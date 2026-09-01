from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
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

# create your views here.
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
