from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets, permissions,status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Appointment, Department, Doctor, Patient
from .permissions import IsDoctorOrReadOnly
from .serializers import (
    AppointmentSerializer,
    DepartmentSerializer,
    DoctorSerializer,
    PatientSerializer,
)

from django.contrib.auth.models import User
    
from .serializers import UserSerializer

from .models import Notification
from .serializers import NotificationSerializer


# create your views here.

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Regular users can only see themselves
        if self.request.user.is_superuser:
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)

    @action(detail=False, methods=['get', 'put', 'patch'])
    def me(self, request):
        """Get or update the current user's profile"""
        user = request.user
        
        if request.method == 'GET':
            serializer = self.get_serializer(user)
            return Response(serializer.data)
        
        elif request.method in ['PUT', 'PATCH']:
            serializer = self.get_serializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                # Remove username from update data if it exists
                if 'username' in serializer.validated_data:
                    del serializer.validated_data['username']
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """Change user's password"""
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
        # Return notifications for the current user
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
    
class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer


class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    filter_backends = (DjangoFilterBackend, filters.SearchFilter)
    filterset_fields = ('department', 'specialization')
    search_fields = ('first_name', 'last_name')


class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    filter_backends = (DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter)
    filterset_fields = ('gender',)
    search_fields = ('first_name', 'last_name', 'phone')
    ordering_fields = ('date_of_birth', 'created_at')

    # Custom endpoint: GET /api/patients/5/appointments/
    @action(detail=True, methods=['get'])
    def appointments(self, request, pk=None):
        patient = self.get_object()
        appointments = patient.appointments.all()
        serializer = AppointmentSerializer(appointments, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def upcoming_appointments(self, request, pk=None):
        """Get upcoming appointments for a patient"""
        from django.utils import timezone
        patient = self.get_object()
        appointments = patient.appointments.filter(
            appointment_date__gte=timezone.now(),
            status='scheduled'
        ).order_by('appointment_date')
        serializer = AppointmentSerializer(appointments, many=True)
        return Response(serializer.data)


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = (IsDoctorOrReadOnly,)
    filter_backends = (DjangoFilterBackend, filters.OrderingFilter)
    filterset_fields = ('status', 'doctor', 'patient')
    ordering_fields = ('appointment_date',)

    # Custom endpoint: PATCH /api/appointments/3/cancel/
    @action(detail=True, methods=['patch'])
    def cancel(self, request, pk=None):
        appointment = self.get_object()
        appointment.status = 'cancelled'
        appointment.save()
        return Response({'status': 'Appointment cancelled'})

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get all upcoming appointments"""
        from django.utils import timezone
        upcoming_appointments = self.get_queryset().filter(
            appointment_date__gte=timezone.now(),
            status='scheduled'
        ).order_by('appointment_date')[:10]
        serializer = self.get_serializer(upcoming_appointments, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'])
    def complete(self, request, pk=None):
        """Mark appointment as completed"""
        appointment = self.get_object()
        appointment.status = 'completed'
        appointment.save()
        return Response({'status': 'Appointment completed'})
