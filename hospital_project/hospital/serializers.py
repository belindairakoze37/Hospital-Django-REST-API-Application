# hospital/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from .models import (
    Appointment,
    Department,
    Doctor,
    Patient,
    Notification,
    QueueDisplay,
    QueueTicket,
    SupportMessage,
    UserPreference,
)

# Language names accepted by UserPreference (mirrors the frontend i18n config).
SUPPORTED_LANGUAGES = (
    'English',
    'Kiswahili',
    'Spanish',
    'French',
    'German',
    'Portuguese',
    'Italian',
)


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, validators=[validate_password])
    # Stored on UserPreference; written through this field, read in
    # to_representation() so a missing preference still returns ''.
    language = serializers.CharField(
        write_only=True, required=False, allow_blank=True, max_length=40
    )

    def validate_language(self, value):
        # Unknown values are ignored rather than failing a whole profile save.
        return value if value in SUPPORTED_LANGUAGES else ''

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password', 'is_staff', 'is_superuser', 'date_joined', 'language']
        read_only_fields = ['date_joined']
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True},
            'username': {'required': True}
        }

    def to_representation(self, instance):
        data = super().to_representation(instance)
        preference = getattr(instance, 'preference', None)
        data['language'] = preference.language if preference else ''
        return data

    def create(self, validated_data):
        language = validated_data.pop('language', '')
        password = validated_data.pop('password', None)
        user = User.objects.create_user(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        if language:
            UserPreference.objects.update_or_create(
                user=user, defaults={'language': language}
            )
        return user

    def update(self, instance, validated_data):
        language = validated_data.pop('language', '')
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        if language:
            UserPreference.objects.update_or_create(
                user=instance, defaults={'language': language}
            )
            # Drop the cached reverse relation so to_representation() reports
            # the value that was just written.
            instance.refresh_from_db()
        return instance


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ('id', 'dept_name', 'floor_number', 'name_translations')



class DoctorSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(
        source='department.dept_name',
        read_only=True
    )

    class Meta:
        model = Doctor
        fields = (
            'id',
            'user',
            'first_name',
            'last_name',
            'specialization',
            'department',
            'department_name',
            'email',
            'phone'
        )

    def validate_email(self, value):
        if not value.endswith('@hospital.com'):
            raise serializers.ValidationError(
                "Doctor email must be a hospital.com address"
            )
        return value

    def create(self, validated_data):
        validated_data.pop('department_name', None)
        return super().create(validated_data)


class PublicDoctorSerializer(serializers.ModelSerializer):
    """Doctor details that are safe to show on the anonymous booking kiosk."""

    department_name = serializers.CharField(source='department.dept_name', read_only=True)

    class Meta:
        model = Doctor
        fields = (
            'id',
            'first_name',
            'last_name',
            'specialization',
            'department',
            'department_name',
        )


class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = (
            'id',
            'user',
            'first_name',
            'last_name',
            'date_of_birth',
            'gender',
            'phone',
            'email',
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


class PublicAppointmentSerializer(serializers.ModelSerializer):
    """Books an appointment from the public kiosk.

    Only a name and phone number are collected, so the matching ``Patient``
    record is looked up (or created) behind the scenes.
    """

    first_name = serializers.CharField(write_only=True, max_length=50)
    last_name = serializers.CharField(write_only=True, max_length=50)
    phone = serializers.CharField(write_only=True, max_length=15)
    email = serializers.EmailField(write_only=True)
    patient_name = serializers.SerializerMethodField()
    patient_phone = serializers.SerializerMethodField()
    patient_email = serializers.SerializerMethodField()
    doctor = serializers.PrimaryKeyRelatedField(queryset=Doctor.objects.all())
    doctor_name = serializers.SerializerMethodField()
    doctor_specialization = serializers.CharField(source='doctor.specialization', read_only=True)
    department_name = serializers.CharField(source='doctor.department.dept_name', read_only=True)
    appointment_date = serializers.DateTimeField()

    class Meta:
        model = Appointment
        fields = (
            'id',
            'first_name',
            'last_name',
            'phone',
            'email',
            'patient_name',
            'patient_phone',
            'patient_email',
            'doctor',
            'doctor_name',
            'doctor_specialization',
            'department_name',
            'appointment_date',
            'status',
            'notes',
        )
        read_only_fields = ('id', 'status')

    def get_patient_name(self, obj):
        return str(obj.patient)

    def get_patient_phone(self, obj):
        return obj.patient.phone

    def get_patient_email(self, obj):
        return obj.patient.email

    def get_doctor_name(self, obj):
        return str(obj.doctor)

    def validate_first_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError('Please enter your first name.')
        return value

    def validate_last_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError('Please enter your last name.')
        return value

    def validate_phone(self, value):
        value = value.strip()
        if len(value) < 10:
            raise serializers.ValidationError(
                'Enter a valid phone number with at least 10 digits.'
            )
        return value

    def validate_appointment_date(self, value):
        if value <= timezone.now():
            raise serializers.ValidationError('Please choose a date and time in the future.')
        return value

    def validate(self, attrs):
        doctor = attrs.get('doctor')
        appointment_date = attrs.get('appointment_date')
        if doctor and appointment_date and Appointment.objects.filter(
            doctor=doctor,
            appointment_date=appointment_date,
            status='scheduled',
        ).exists():
            raise serializers.ValidationError(
                {
                    'appointment_date': (
                        'This doctor is already booked at that time. '
                        'Please choose another slot.'
                    )
                }
            )
        return attrs

    def create(self, validated_data):
        first_name = validated_data.pop('first_name')
        last_name = validated_data.pop('last_name')
        phone = validated_data.pop('phone')
        email = validated_data.pop('email')

        patient = Patient.objects.filter(phone=phone).first()
        if patient is None:
            patient = Patient.objects.filter(
                first_name__iexact=first_name,
                last_name__iexact=last_name,
            ).first()
        if patient is None:
            patient = Patient.objects.create(
                first_name=first_name,
                last_name=last_name,
                phone=phone,
                email=email,
            )
        elif not patient.email:
            # Keep an existing record but capture the address for reminders.
            patient.email = email
            patient.save(update_fields=['email'])

        return Appointment.objects.create(patient=patient, **validated_data)


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'notification_type', 'title', 'message', 'read', 'link', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class QueueTicketSerializer(serializers.ModelSerializer):
    patient = serializers.PrimaryKeyRelatedField(
        queryset=Patient.objects.all(), required=False, allow_null=True
    )
    patient_name = serializers.SerializerMethodField()
    department_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()
    position_in_queue = serializers.ReadOnlyField()
    estimated_wait_minutes = serializers.ReadOnlyField()
    people_ahead = serializers.ReadOnlyField()
    served_by_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    stage_display = serializers.CharField(source='get_current_stage_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)

    class Meta:
        model = QueueTicket
        fields = (
            'id',
            'patient',
            'patient_name',
            'phone_number',
            'email',
            'appointment',
            'doctor_name',
            'department',
            'department_name',
            'queue_number',
            'ticket_code',
            'sequence_number',
            'status',
            'status_display',
            'current_stage',
            'stage_display',
            'created_at',
            'called_at',
            'started_at',
            'completed_at',
            'priority',
            'priority_display',
            'is_emergency',
            'reason_for_visit',
            'notes',
            'served_by',
            'served_by_name',
            'room_number',
            'position_in_queue',
            'people_ahead',
            'estimated_wait_minutes',
        )
        read_only_fields = (
            'queue_number',
            'ticket_code',
            'sequence_number',
            'status',
            'current_stage',
            'created_at',
            'called_at',
            'started_at',
            'completed_at',
            'served_by',
        )

    def get_patient_name(self, obj):
        if obj.patient_id:
            return str(obj.patient)
        return obj.patient_name or ''

    def get_department_name(self, obj):
        return obj.department.dept_name if obj.department_id else ''

    def get_doctor_name(self, obj):
        if obj.appointment_id and obj.appointment.doctor_id:
            return str(obj.appointment.doctor)
        return ''

    def get_served_by_name(self, obj):
        if not obj.served_by_id:
            return ''
        return obj.served_by.get_full_name() or obj.served_by.username

    def validate(self, data):
        patient = data.get('patient') or getattr(self.instance, 'patient', None)
        department = data.get('department') or getattr(self.instance, 'department', None)
        appointment = data.get('appointment')

        if appointment is not None:
            if patient and appointment.patient_id != patient.id:
                raise serializers.ValidationError(
                    {'appointment': 'This appointment belongs to a different patient.'}
                )
            if department and appointment.doctor.department_id != department.id:
                raise serializers.ValidationError(
                    {'appointment': 'This appointment is for a different department.'}
                )
        return data


class QueueDisplaySerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.dept_name', read_only=True)
    current_ticket_number = serializers.SerializerMethodField()

    class Meta:
        model = QueueDisplay
        fields = (
            'id',
            'department',
            'department_name',
            'name',
            'is_active',
            'current_ticket',
            'current_ticket_number',
            'room_number',
            'updated_at',
        )
        read_only_fields = ('updated_at',)

    def get_current_ticket_number(self, obj):
        return obj.current_ticket.queue_number if obj.current_ticket_id else ''


class QueueStatusSerializer(serializers.Serializer):
    department = serializers.CharField()
    department_id = serializers.IntegerField()
    now_serving = serializers.CharField(allow_blank=True)
    now_serving_patient = serializers.CharField(allow_blank=True)
    now_serving_room = serializers.CharField(allow_blank=True)
    waiting_count = serializers.IntegerField()
    upcoming = serializers.ListField(child=serializers.CharField())
    estimated_wait_minutes = serializers.IntegerField()


class NewsletterSubscriberSerializer(serializers.Serializer):
    email = serializers.EmailField()
    source = serializers.CharField(required=False, allow_blank=True, max_length=50)
    # Honeypot: real browsers leave this empty because it is hidden with CSS.
    website = serializers.CharField(required=False, allow_blank=True, max_length=200)

    def validate_email(self, value):
        return value.strip().lower()


class SupportMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportMessage
        fields = ['id', 'name', 'email', 'message', 'created_at']
        read_only_fields = ['created_at']

    def validate_name(self, value):
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError('Please enter your name.')
        return value

    def validate_email(self, value):
        return value.strip().lower()

    def validate_message(self, value):
        value = value.strip()
        if len(value) < 10:
            raise serializers.ValidationError('Please give us a little more detail.')
        return value