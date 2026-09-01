from rest_framework import serializers

from .models import Appointment, Department, Doctor, Patient


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ('id', 'dept_name', 'floor_number')


class DoctorSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(
        source='department.dept_name',
        read_only=True
    )

    class Meta:
        model = Doctor
        fields = (
            'id',
            'first_name',
            'last_name',
            'specialization',
            'department',
            'department_name',
            'email'
        )

    def validate_email(self, value):
        if not value.endswith('@hospital.com'):
            raise serializers.ValidationError(
                "Doctor email must be a hospital.com address"
            )
        return value


class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = (
            'id',
            'first_name',
            'last_name',
            'date_of_birth',
            'gender',
            'phone',
            'emergency_contact',
            'created_at'
        )
        read_only_fields = ('created_at',)

    def validate_phone(self, value):
        if len(value) < 10:
            raise serializers.ValidationError(
                "Phone number must be at least 10 digits"
            )
        return value


class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()

    class Meta:
        model = Appointment
        fields = (
            'id',
            'patient',
            'doctor',
            'patient_name',
            'doctor_name',
            'appointment_date',
            'status',
            'notes'
        )

    def get_patient_name(self, obj):
        return str(obj.patient)

    def get_doctor_name(self, obj):
        return str(obj.doctor)

    def validate(self, data):
        doctor = data.get(
            'doctor',
            self.instance.doctor if self.instance else None
        )

        appointment_date = data.get(
            'appointment_date',
            self.instance.appointment_date if self.instance else None
        )

        if Appointment.objects.filter(
            doctor=doctor,
            appointment_date=appointment_date
        ).exclude(
            id=self.instance.id if self.instance else None
        ).exists():
            raise serializers.ValidationError(
                "This doctor already has an appointment at that time."
            )

        return data