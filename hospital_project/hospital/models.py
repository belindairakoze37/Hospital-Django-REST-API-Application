from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class Department(models.Model):
    dept_name = models.CharField(max_length=100)
    floor_number = models.IntegerField()

    def __str__(self):
        return self.dept_name


class Doctor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    specialization = models.CharField(max_length=100)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='doctors')
    email = models.EmailField(unique=True)

    def __str__(self):
        return f"Dr. {self.first_name} {self.last_name}"


class Patient(models.Model):
    GENDER_CHOICES = (
        ('m', 'Male'), 
        ('f', 'Female')
    )

    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    phone = models.CharField(max_length=15)
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