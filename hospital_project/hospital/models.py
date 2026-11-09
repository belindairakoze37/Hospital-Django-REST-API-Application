from django.db import models
from django.contrib.auth.models import User
from django.db.models import Q
from django.utils import timezone

# Average minutes a single patient spends at a service point.
AVG_SERVICE_MINUTES = 15

# Create your models here.

class Department(models.Model):
    dept_name = models.CharField(max_length=100)
    floor_number = models.IntegerField()
    # Optional per-language overrides, e.g. {"French": "Cardiologie"}.
    name_translations = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return self.dept_name


class Doctor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    specialization = models.CharField(max_length=100)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='doctors')
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True, null=True) 

    def __str__(self):
        return f"Dr. {self.first_name} {self.last_name}"


class Patient(models.Model):
    GENDER_CHOICES = (
        ('m', 'Male'), 
        ('f', 'Female')
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    # Public kiosk bookings only collect a name and phone, so the remaining
    # demographics may be filled in later by staff.
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, null=True, blank=True)
    phone = models.CharField(max_length=15)
    # Kept separate from ``user.email`` because walk-in patients created at the
    # public kiosk have no account but still want queue/reminder emails.
    email = models.EmailField(blank=True, null=True)
    emergency_contact = models.CharField(max_length=15, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class Appointment(models.Model):
    STATUS_CHOICES = (
        ('scheduled', 'Scheduled'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='appointments')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='appointments')
    appointment_date = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    notes = models.TextField(blank=True, null=True)
    # Guards against emailing the same reminder twice.
    reminder_sent = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.patient} with {self.doctor} on {self.appointment_date}"


class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('appointment_created', 'Appointment Created'),
        ('appointment_updated', 'Appointment Updated'),
        ('appointment_cancelled', 'Appointment Cancelled'),
        ('appointment_reminder', 'Appointment Reminder'),
        ('patient_registered', 'Patient Registered'),
        ('doctor_assigned', 'Doctor Assigned'),
        ('queue_turn_approaching', 'Queue Turn Approaching'),
        ('queue_called', 'Queue Called'),
        ('queue_position_update', 'Queue Position Update'),
        ('queue_delay', 'Queue Delay'),
        ('queue_completed', 'Queue Completed'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    read = models.BooleanField(default=False)
    link = models.CharField(max_length=200, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.created_at}"
    
    def mark_as_read(self):
        self.read = True
        self.save()


class QueueTicket(models.Model):
    STATUS_CHOICES = (
        ('waiting', 'Waiting'),
        ('called', 'Called'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
    )

    STAGE_CHOICES = (
        ('registration', 'Registration'),
        ('triage', 'Triage'),
        ('consultation', 'Consultation'),
        ('pharmacy', 'Pharmacy'),
        ('payment', 'Payment'),
        ('completed', 'Completed'),
    )

    PRIORITY_CHOICES = (
        (0, 'Normal'),
        (1, 'Urgent'),
        (2, 'Emergency'),
    )

    patient = models.ForeignKey(
        Patient, on_delete=models.SET_NULL, null=True, blank=True, related_name='queue_tickets'
    )
    patient_name = models.CharField(max_length=100, blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    email = models.CharField(max_length=254, blank=True, null=True)
    appointment = models.ForeignKey(
        Appointment, on_delete=models.SET_NULL, null=True, blank=True, related_name='queue_tickets'
    )
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='queue_tickets')
    queue_number = models.CharField(max_length=10, unique=True, blank=True)
    ticket_code = models.CharField(max_length=1, blank=True)
    sequence_number = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='waiting')
    current_stage = models.CharField(max_length=20, choices=STAGE_CHOICES, default='registration')
    created_at = models.DateTimeField(auto_now_add=True)
    called_at = models.DateTimeField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    priority = models.PositiveSmallIntegerField(choices=PRIORITY_CHOICES, default=0)
    is_emergency = models.BooleanField(default=False)
    reason_for_visit = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    served_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='served_queue_tickets'
    )
    room_number = models.CharField(max_length=20, blank=True)

    class Meta:
        ordering = ('-priority', 'created_at')
        indexes = [
            models.Index(fields=['department', 'status']),
            models.Index(fields=['created_at']),
        ]

    @property
    def display_name(self):
        """Name of the linked patient, falling back to the name given at registration."""
        if self.patient_id:
            return str(self.patient)
        return self.patient_name or 'Walk-in patient'

    @property
    def contact_email(self):
        """Best email address for this ticket: kiosk entry, patient record, then account."""
        if self.email:
            return self.email
        if self.patient_id:
            return self.patient.user.email if self.patient.user_id else self.patient.email
        return None

    def __str__(self):
        return f"{self.queue_number} - {self.display_name}"

    def _generate_queue_number(self):
        """Build a per-day ticket like A001 where A is the department initial."""
        prefix = (self.department.dept_name.strip()[:1] or 'Q').upper()
        today = timezone.localdate()
        last_sequence = QueueTicket.objects.filter(
            ticket_code=prefix, created_at__date=today
        ).aggregate(models.Max('sequence_number'))['sequence_number__max'] or 0

        sequence = last_sequence + 1
        number = f"{prefix}{sequence:03d}"
        while QueueTicket.objects.filter(queue_number=number).exists():
            sequence += 1
            number = f"{prefix}{sequence:03d}"
        return prefix, sequence, number

    def save(self, *args, **kwargs):
        if self.department_id and not self.queue_number:
            self.ticket_code, self.sequence_number, self.queue_number = self._generate_queue_number()
        if self.is_emergency:
            self.priority = 2
        super().save(*args, **kwargs)

    @property
    def ticket_day(self):
        if self.created_at:
            return timezone.localtime(self.created_at).date()
        return timezone.localdate()

    @property
    def people_ahead(self):
        if self.status != 'waiting' or not self.department_id:
            return 0
        return QueueTicket.objects.filter(
            department_id=self.department_id,
            status='waiting',
            created_at__date=self.ticket_day,
        ).filter(
            Q(priority__gt=self.priority)
            | Q(priority=self.priority, created_at__lt=self.created_at)
        ).count()

    @property
    def position_in_queue(self):
        if self.status != 'waiting':
            return 0
        return self.people_ahead + 1

    @property
    def estimated_wait_minutes(self):
        if self.status in ('completed', 'cancelled', 'no_show'):
            return 0
        return self.people_ahead * AVG_SERVICE_MINUTES


class QueueDisplay(models.Model):
    department = models.OneToOneField(
        Department, on_delete=models.CASCADE, related_name='queue_display'
    )
    name = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    current_ticket = models.ForeignKey(
        QueueTicket, on_delete=models.SET_NULL, null=True, blank=True, related_name='displayed_in'
    )
    room_number = models.CharField(max_length=20, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('department__dept_name',)

    def __str__(self):
        return self.name or f"{self.department} display"


class UserPreference(models.Model):
    """Per-user UI preferences that do not belong on the Django User model."""

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name='preference'
    )
    language = models.CharField(max_length=40, default='English')
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} ({self.language})"


class NewsletterSubscriber(models.Model):
    email = models.EmailField(unique=True)
    source = models.CharField(max_length=50, blank=True, default='home_footer')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-created_at',)

    def __str__(self):
        return self.email


class SupportMessage(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    message = models.TextField()
    handled = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-created_at',)

    def __str__(self):
        return f"{self.name} <{self.email}>"