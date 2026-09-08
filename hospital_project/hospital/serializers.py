from rest_framework import serializers
from typing import ClassVar
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password

from .models import Appointment, Department, Doctor, Notification, Patient




class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, validators=[validate_password])
    
    class Meta:
        model = User
        fields: ClassVar[list] = ['id', 'username', 'email', 'first_name', 'last_name', 'password', 'is_staff', 'is_superuser', 'date_joined']
        read_only_fields: ClassVar[list] = ['date_joined']
        extra_kwargs: ClassVar[dict] = {
            'password': {'write_only': True},
            'email': {'required': True},
            'username': {'required': True}
        }

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User.objects.create_user(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields: ClassVar[list] = ('id', 'dept_name', 'floor_number')


class DoctorSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(
        source='department.dept_name',
        read_only=True
    )

    class Meta:
        model = Doctor
        fields: ClassVar[list] = (
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
        fields: ClassVar[list] = (
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
        fields: ClassVar[list] = (
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

    # hospital/serializers.py - Add this serializer

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'notification_type', 'title', 'message', 'read', 'link', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']