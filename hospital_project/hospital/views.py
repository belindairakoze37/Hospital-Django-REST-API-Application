# hospital/views.py
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from django.contrib.auth.models import User
from django.utils import timezone

from .models import (
    AVG_SERVICE_MINUTES,
    Appointment,
    Department,
    Doctor,
    Patient,
    Notification,
    NewsletterSubscriber,
    QueueDisplay,
    QueueTicket,
    SupportMessage,
)
from .permissions import IsDoctorOrReadOnly
from .utils import (
    is_valid_email,
    request_language,
    send_appointment_confirmation_email,
    send_appointment_reminder_email,
    send_queue_registered_email,
)
from .serializers import (
    AppointmentSerializer,
    DepartmentSerializer,
    DoctorSerializer,
    NewsletterSubscriberSerializer,
    PatientSerializer,
    NotificationSerializer,
    PublicAppointmentSerializer,
    PublicDoctorSerializer,
    QueueDisplaySerializer,
    QueueStatusSerializer,
    QueueTicketSerializer,
    SupportMessageSerializer,
    UserSerializer,
)

# Create your views here.

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    # Read access is public so the anonymous queue kiosk can list departments.
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


# hospital/views.py
class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.select_related('department').all()
    serializer_class = DoctorSerializer
    filter_backends = (DjangoFilterBackend, filters.SearchFilter)
    filterset_fields = ('department', 'specialization')
    search_fields = ('first_name', 'last_name')
    # The public booking kiosk needs the doctor list, so reads are open while
    # creating and editing doctors stays restricted to logged-in staff.
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        # Anonymous callers only see the public subset of doctor fields.
        if self.action in ('list', 'retrieve') and not self.request.user.is_authenticated:
            return PublicDoctorSerializer
        return DoctorSerializer

    def create(self, request, *args, **kwargs):
        # Log the request data for debugging
        print("Creating doctor with data:", request.data)
        return super().create(request, *args, **kwargs)

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    filter_backends = (DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter)
    filterset_fields = ('gender',)
    search_fields = ('first_name', 'last_name', 'phone')
    ordering_fields = ('date_of_birth', 'created_at')

    @action(detail=True, methods=['get'])
    def appointments(self, request, pk=None):
        patient = self.get_object()
        appointments = patient.appointments.all()
        serializer = AppointmentSerializer(appointments, many=True)
        return Response(serializer.data)


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = (IsDoctorOrReadOnly,)
    filter_backends = (DjangoFilterBackend, filters.OrderingFilter)
    filterset_fields = ('status', 'doctor', 'patient')
    ordering_fields = ('appointment_date',)

    @action(detail=True, methods=['patch'])
    def cancel(self, request, pk=None):
        appointment = self.get_object()
        appointment.status = 'cancelled'
        appointment.save()
        return Response({'status': 'Appointment cancelled'})
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        upcoming_appointments = self.get_queryset().filter(
            appointment_date__gte=timezone.now(),
            status='scheduled'
        ).order_by('appointment_date')[:10]
        serializer = self.get_serializer(upcoming_appointments, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'])
    def complete(self, request, pk=None):
        appointment = self.get_object()
        appointment.status = 'completed'
        appointment.save()
        return Response({'status': 'Appointment completed'})

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def public_book(self, request):
        """Book an appointment without an account.

        Accepts ``first_name``, ``last_name``, ``phone``, ``doctor`` (or
        ``doctor_id``), ``appointment_date`` and ``notes``. A ``Patient`` is
        reused when the phone number is already known, otherwise created.
        """
        payload = {key: value for key, value in request.data.items()}

        if not payload.get('doctor') and payload.get('doctor_id'):
            payload['doctor'] = payload['doctor_id']

        # Allow date and time to arrive separately from the kiosk form.
        if payload.get('appointment_date') and payload.get('appointment_time'):
            payload['appointment_date'] = (
                f"{payload['appointment_date']}T{payload['appointment_time']}:00"
            )

        serializer = PublicAppointmentSerializer(data=payload)
        if not serializer.is_valid():
            # A stable code lets the kiosk show a translated message instead of
            # the serializer's English field errors.
            return Response(
                {
                    'detail': 'Please check the details and try again.',
                    'code': 'invalid_booking_details',
                    'fields': serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        appointment = serializer.save()

        doctor_user = appointment.doctor.user
        if doctor_user:
            Notification.objects.create(
                user=doctor_user,
                notification_type='appointment_created',
                title='New Appointment Booked',
                message=(
                    f'{appointment.patient} booked an appointment on '
                    f'{timezone.localtime(appointment.appointment_date):%d %b %Y at %H:%M}.'
                ),
                link='/appointments',
            )

        when = timezone.localtime(appointment.appointment_date)
        send_appointment_confirmation_email(
            appointment.patient.email,
            appointment.patient.first_name,
            f'Dr. {appointment.doctor.first_name} {appointment.doctor.last_name}',
            when,
            language=request_language(request),
        )

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_superuser:
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)

    @action(detail=False, methods=['get', 'put', 'patch'])
    def me(self, request):
        user = request.user
        if request.method == 'GET':
            serializer = self.get_serializer(user)
            return Response(serializer.data)
        elif request.method in ['PUT', 'PATCH']:
            serializer = self.get_serializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                if 'username' in serializer.validated_data:
                    del serializer.validated_data['username']
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def change_password(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not old_password or not new_password:
            return Response(
                {'error': 'Both old and new passwords are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not user.check_password(old_password):
            return Response(
                {'error': 'Current password is incorrect'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(new_password) < 8:
            return Response(
                {'error': 'Password must be at least 8 characters long'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password)
        user.save()
        return Response({'message': 'Password changed successfully'})


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        notifications = Notification.objects.filter(user=request.user, read=False)
        count = notifications.update(read=True)
        return Response({'message': f'{count} notifications marked as read', 'count': count})
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.mark_as_read()
        return Response({'message': 'Notification marked as read'})


ACTIVE_QUEUE_STATUSES = ('waiting', 'called', 'in_progress')


def notify_queue_user(user, notification_type, title, message, link='/queue'):
    """Queue notifications are optional: patients without an account are skipped."""
    if not user:
        return None
    return Notification.objects.create(
        user=user,
        notification_type=notification_type,
        title=title,
        message=message,
        link=link,
    )


def notify_ticket_holder(ticket, *args, **kwargs):
    """Notify the linked patient only; anonymous walk-in tickets have no user."""
    user = ticket.patient.user if ticket.patient_id else None
    return notify_queue_user(user, *args, **kwargs)


class QueueTicketViewSet(viewsets.ModelViewSet):
    serializer_class = QueueTicketSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = (DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter)
    filterset_fields = ('department', 'status', 'current_stage', 'priority', 'is_emergency')
    search_fields = (
        'queue_number',
        'patient_name',
        'phone_number',
        'patient__first_name',
        'patient__last_name',
    )
    ordering_fields = ('created_at', 'priority', 'queue_number')

    def get_permissions(self):
        # Registration and the public display board need no account: walk-in
        # patients take a ticket and the waiting-room screen reads the board.
        # Everything else (listing, calling, completing) stays staff-only so
        # patient data is never exposed.
        if self.action in ('register', 'create', 'status_board'):
            return [permissions.AllowAny()]
        return super().get_permissions()

    def get_queryset(self):
        queryset = QueueTicket.objects.select_related(
            'patient', 'department', 'appointment__doctor', 'served_by'
        )
        department = self.request.query_params.get('department')
        if department:
            queryset = queryset.filter(department_id=department)

        status_param = self.request.query_params.get('status')
        if status_param:
            statuses = [s for s in status_param.split(',') if s]
            queryset = queryset.filter(status__in=statuses)

        # Default to today's queue unless the caller explicitly asks for history.
        if self.request.query_params.get('all') not in ('1', 'true', 'True'):
            date_param = self.request.query_params.get('date')
            if date_param:
                queryset = queryset.filter(created_at__date=date_param)
            else:
                queryset = queryset.filter(created_at__date=timezone.localdate())
        return queryset

    def _next_waiting(self, department_id):
        return QueueTicket.objects.filter(
            department_id=department_id,
            status='waiting',
            created_at__date=timezone.localdate(),
        ).order_by('-priority', 'created_at').first()

    def _notify_next_in_line(self, department_id, exclude_id=None):
        next_ticket = self._next_waiting(department_id)
        if not next_ticket or next_ticket.id == exclude_id:
            next_ticket = QueueTicket.objects.filter(
                department_id=department_id,
                status='waiting',
                created_at__date=timezone.localdate(),
            ).exclude(id=exclude_id).order_by('-priority', 'created_at').first()

        if not next_ticket:
            return
        notify_queue_user(
            next_ticket.patient.user if next_ticket.patient_id else None,
            'queue_turn_approaching',
            'Your Turn Is Approaching',
            (
                f'Ticket {next_ticket.queue_number} is next in line at '
                f'{next_ticket.department.dept_name}. Please be ready.'
            ),
            link='/queue/my-ticket',
        )

    def _call_ticket(self, ticket, request):
        if ticket.status != 'waiting':
            return Response(
                {'detail': 'Only waiting tickets can be called.', 'code': 'only_waiting_can_be_called'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        ticket.status = 'called'
        ticket.called_at = timezone.now()
        ticket.served_by = request.user
        room_number = request.data.get('room_number')
        if room_number is not None:
            ticket.room_number = room_number
        ticket.save()

        notify_ticket_holder(
            ticket,
            'queue_called',
            'You Have Been Called',
            (
                f'Ticket {ticket.queue_number} has been called at '
                f'{ticket.department.dept_name}'
                + (f', room {ticket.room_number}.' if ticket.room_number else '.')
            ),
            link='/queue/my-ticket',
        )
        # The "your turn" email is sent by the QueueTicket post_save signal, so
        # it fires for every code path that calls a ticket (not just this view).
        self._notify_next_in_line(ticket.department_id, exclude_id=ticket.id)
        return Response(self.get_serializer(ticket).data)

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def register(self, request):
        """Public registration: works for linked patients and anonymous walk-ins."""
        patient_id = request.data.get('patient_id') or request.data.get('patient')
        department_id = request.data.get('department_id') or request.data.get('department')
        patient_name = (request.data.get('patient_name') or '').strip()
        phone_number = (request.data.get('phone_number') or '').strip()
        email = (request.data.get('email') or '').strip()
        room_number = (request.data.get('room_number') or '').strip()
        reason_for_visit = (request.data.get('reason_for_visit') or '').strip()

        if email and not is_valid_email(email):
            return Response(
                {'detail': 'That email address does not look valid.', 'code': 'invalid_email'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not department_id:
            return Response(
                {'detail': 'Please choose a department.', 'code': 'department_required'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        department = Department.objects.filter(pk=department_id).first()
        if not department:
            return Response(
                {'detail': 'That department was not found.', 'code': 'department_not_found'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        patient = None
        if patient_id:
            patient = Patient.objects.filter(pk=patient_id).select_related('user').first()
            if not patient:
                return Response(
                    {'detail': 'That patient was not found.', 'code': 'patient_not_found'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if not patient and not patient_name:
            return Response(
                {'detail': 'Please enter your full name.', 'code': 'name_required'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            priority = int(request.data.get('priority', 0))
        except (TypeError, ValueError):
            priority = 0
        if priority not in (0, 1, 2):
            priority = 0

        if patient:
            duplicate = QueueTicket.objects.filter(
                patient=patient,
                department=department,
                status__in=ACTIVE_QUEUE_STATUSES,
                created_at__date=timezone.localdate(),
            ).first()
            if duplicate:
                return Response(
                    {
                        'detail': (
                            f'{patient} already has active ticket {duplicate.queue_number} '
                            f'in {department.dept_name}.'
                        ),
                        'code': 'duplicate_ticket',
                        'ticket': duplicate.queue_number,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        ticket = QueueTicket.objects.create(
            patient=patient,
            patient_name=None if patient else (patient_name or None),
            phone_number=phone_number or None,
            email=email or None,
            department=department,
            priority=priority,
            is_emergency=priority == 2,
            room_number=room_number,
            reason_for_visit=reason_for_visit,
        )

        send_queue_registered_email(
            ticket.contact_email,
            ticket.display_name,
            ticket.queue_number,
            department.dept_name,
            language=request_language(request),
        )

        if patient:
            notify_queue_user(
                patient.user,
                'queue_position_update',
                f'Queue Ticket {ticket.queue_number}',
                (
                    f'You are number {ticket.position_in_queue} in the '
                    f'{department.dept_name} queue. Estimated wait: '
                    f'{ticket.estimated_wait_minutes} minutes.'
                ),
                link='/queue/my-ticket',
            )

        payload = self.get_serializer(ticket).data
        now_serving = (
            QueueTicket.objects.filter(
                department=department,
                status__in=('called', 'in_progress'),
                created_at__date=timezone.localdate(),
            )
            .order_by('-started_at', '-called_at')
            .first()
        )
        payload['now_serving'] = now_serving.queue_number if now_serving else ''
        payload['now_serving_room'] = now_serving.room_number if now_serving else ''
        return Response(payload, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def call_next(self, request, pk=None):
        """Call the next waiting ticket in the department of the given ticket."""
        ticket = self.get_object()
        next_ticket = self._next_waiting(ticket.department_id)
        if not next_ticket:
            return Response(
                {'detail': 'No waiting patients in this department.', 'code': 'no_waiting_patients'},
                status=status.HTTP_404_NOT_FOUND,
            )
        return self._call_ticket(next_ticket, request)

    @action(detail=False, methods=['post'], url_path='call_next')
    def call_next_department(self, request):
        """Call the next waiting ticket for a department supplied in the body."""
        department_id = request.data.get('department')
        if not department_id:
            return Response(
                {'detail': 'A department id is required.', 'code': 'department_required'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        next_ticket = self._next_waiting(department_id)
        if not next_ticket:
            return Response(
                {'detail': 'No waiting patients in this department.', 'code': 'no_waiting_patients'},
                status=status.HTTP_404_NOT_FOUND,
            )
        return self._call_ticket(next_ticket, request)

    @action(detail=True, methods=['post'])
    def start_service(self, request, pk=None):
        ticket = self.get_object()
        if ticket.status not in ('waiting', 'called'):
            return Response(
                {'detail': 'Only waiting or called tickets can be started.', 'code': 'only_waiting_can_be_started'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        ticket.status = 'in_progress'
        ticket.started_at = timezone.now()
        if not ticket.called_at:
            ticket.called_at = ticket.started_at
        stage = request.data.get('current_stage')
        if stage:
            ticket.current_stage = stage
        if not ticket.served_by_id:
            ticket.served_by = request.user
        ticket.save()
        return Response(self.get_serializer(ticket).data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        ticket = self.get_object()
        if ticket.status in ('completed', 'cancelled', 'no_show'):
            return Response(
                {'detail': 'This ticket is already closed.', 'code': 'ticket_closed'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        ticket.status = 'completed'
        ticket.current_stage = 'completed'
        ticket.completed_at = timezone.now()
        if not ticket.started_at:
            ticket.started_at = ticket.completed_at
        ticket.save()

        notify_ticket_holder(
            ticket,
            'queue_completed',
            'Visit Completed',
            (
                f'Your visit for ticket {ticket.queue_number} at '
                f'{ticket.department.dept_name} is complete. Thank you!'
            ),
            link='/queue/my-ticket',
        )
        return Response(self.get_serializer(ticket).data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        ticket = self.get_object()
        if ticket.status in ('completed', 'cancelled'):
            return Response(
                {'detail': 'This ticket cannot be cancelled.', 'code': 'ticket_not_cancellable'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        ticket.status = 'cancelled'
        ticket.save()

        notify_ticket_holder(
            ticket,
            'queue_position_update',
            'Queue Ticket Cancelled',
            f'Ticket {ticket.queue_number} has been cancelled.',
            link='/queue/my-ticket',
        )
        return Response(self.get_serializer(ticket).data)

    @action(detail=False, methods=['get'], url_path='status_board')
    def status_board(self, request):
        today = timezone.localdate()
        board = []
        for department in Department.objects.all().order_by('dept_name'):
            todays_tickets = QueueTicket.objects.filter(
                department=department, created_at__date=today
            )
            now_serving = (
                todays_tickets.filter(status='in_progress').order_by('started_at').first()
                or todays_tickets.filter(status='called').order_by('called_at').first()
            )
            waiting = todays_tickets.filter(status='waiting').order_by('-priority', 'created_at')
            waiting_count = waiting.count()
            display = getattr(department, 'queue_display', None)
            room = now_serving.room_number if now_serving else ''
            if not room and display:
                room = display.room_number

            board.append(
                {
                    'department': department.dept_name,
                    'department_id': department.id,
                    'now_serving': now_serving.queue_number if now_serving else '',
                    'now_serving_patient': (
                        str(now_serving.patient)
                        if now_serving and now_serving.patient_id
                        else (now_serving.patient_name or '' if now_serving else '')
                    ),
                    'now_serving_room': room,
                    'waiting_count': waiting_count,
                    'upcoming': list(waiting.values_list('queue_number', flat=True)[:5]),
                    'estimated_wait_minutes': waiting_count * AVG_SERVICE_MINUTES,
                }
            )
        return Response(QueueStatusSerializer(board, many=True).data)

    @action(detail=False, methods=['get'], url_path='my_ticket')
    def my_ticket(self, request):
        patient = Patient.objects.filter(user=request.user).first()
        if not patient:
            return Response(None)

        ticket = QueueTicket.objects.select_related(
            'patient', 'department', 'appointment__doctor', 'served_by'
        ).filter(
            patient=patient,
            status__in=ACTIVE_QUEUE_STATUSES,
        ).order_by('-created_at').first()

        if not ticket:
            return Response(None)
        return Response(self.get_serializer(ticket).data)


class QueueDisplayViewSet(viewsets.ModelViewSet):
    queryset = QueueDisplay.objects.select_related('department', 'current_ticket')
    serializer_class = QueueDisplaySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = (DjangoFilterBackend,)
    filterset_fields = ('department', 'is_active')


class NewsletterSubscribeView(APIView):
    """Public POST /api/newsletter/subscribe/ used by the footer form."""

    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'newsletter'

    def post(self, request):
        serializer = NewsletterSubscriberSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {
                    'status': 'invalid',
                    'detail': 'Please enter a valid email address.',
                    'errors': serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        email = serializer.validated_data['email']
        source = serializer.validated_data.get('source') or 'home_footer'

        # Silently accept bot submissions so the honeypot is not revealed.
        if serializer.validated_data.get('website'):
            return Response(
                {'status': 'subscribed', 'detail': "Thanks, you're subscribed.", 'email': email},
                status=status.HTTP_201_CREATED,
            )

        _, created = NewsletterSubscriber.objects.get_or_create(
            email=email, defaults={'source': source}
        )
        if not created:
            return Response(
                {
                    'status': 'already_subscribed',
                    'detail': 'This email is already subscribed.',
                    'email': email,
                },
                status=status.HTTP_409_CONFLICT,
            )

        return Response(
            {'status': 'subscribed', 'detail': "Thanks, you're subscribed.", 'email': email},
            status=status.HTTP_201_CREATED,
        )


class SupportMessageView(APIView):
    """Public POST /api/support/messages/ backing the Support contact form."""

    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'support'

    def post(self, request):
        serializer = SupportMessageSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {
                    'status': 'invalid',
                    'detail': 'Please check the highlighted fields.',
                    'errors': serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        message = serializer.save()
        return Response(
            {
                'status': 'received',
                'detail': "Thanks! Your message is on its way.",
                'id': message.id,
            },
            status=status.HTTP_201_CREATED,
        )