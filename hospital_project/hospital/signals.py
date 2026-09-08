# hospital/signals.py
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Doctor

from django.utils import timezone
from datetime import datetime, timedelta
from .models import Appointment, Patient,  Notification


@receiver(post_save, sender=User)
def create_doctor_for_user(sender, instance, created, **kwargs):
    if created and instance.is_staff:
        Doctor.objects.get_or_create(
            user=instance,
            defaults={
                'first_name': instance.first_name,
                'last_name': instance.last_name,
                'email': instance.email,
                'department_id': 1,  # Set default department
                'specialization': 'General'
            }
        )


# hospital/signals.py - Add these signals



@receiver(post_save, sender=Appointment)
def create_appointment_notification(sender, instance, created, **kwargs):
    """Create notifications when an appointment is created, updated, or cancelled"""
    
    if created:
        # Appointment Created - Notify the patient and doctor
        patient_name = f"{instance.patient.first_name} {instance.patient.last_name}"
        doctor_name = f"Dr. {instance.doctor.first_name} {instance.doctor.last_name}"
        appointment_date = instance.appointment_date.strftime("%B %d, %Y at %I:%M %p")
        
        # Notify the patient
        Notification.objects.create(
            user=instance.patient.user if hasattr(instance.patient, 'user') else None,
            notification_type='appointment_created',
            title='Appointment Confirmed',
            message=f'Your appointment with {doctor_name} has been confirmed for {appointment_date}.',
            link=f'/appointments/{instance.id}'
        )
        
        # Notify the doctor (if they have a user account)
        if instance.doctor.user:
            Notification.objects.create(
                user=instance.doctor.user,
                notification_type='appointment_created',
                title='New Appointment Scheduled',
                message=f'New appointment with {patient_name} scheduled for {appointment_date}.',
                link=f'/appointments/{instance.id}'
            )
    
    elif not created and instance.status == 'cancelled':
        # Appointment Cancelled - Notify the patient and doctor
        patient_name = f"{instance.patient.first_name} {instance.patient.last_name}"
        doctor_name = f"Dr. {instance.doctor.first_name} {instance.doctor.last_name}"
        
        # Notify the patient
        if instance.patient.user:
            Notification.objects.create(
                user=instance.patient.user,
                notification_type='appointment_cancelled',
                title='Appointment Cancelled',
                message=f'Your appointment with {doctor_name} has been cancelled.',
                link=f'/appointments/{instance.id}'
            )
        
        # Notify the doctor
        if instance.doctor.user:
            Notification.objects.create(
                user=instance.doctor.user,
                notification_type='appointment_cancelled',
                title='Appointment Cancelled',
                message=f'Appointment with {patient_name} has been cancelled.',
                link=f'/appointments/{instance.id}'
            )
    
    elif not created and instance.status == 'completed':
        # Appointment Completed - Notify the patient
        doctor_name = f"Dr. {instance.doctor.first_name} {instance.doctor.last_name}"
        if instance.patient.user:
            Notification.objects.create(
                user=instance.patient.user,
                notification_type='appointment_updated',
                title='Appointment Completed',
                message=f'Your appointment with {doctor_name} has been marked as completed.',
                link=f'/appointments/{instance.id}'
            )


@receiver(post_save, sender=Patient)
def create_patient_notification(sender, instance, created, **kwargs):
    """Create notification when a new patient is registered"""
    if created:
        # Notify admin users (or all staff)
        staff_users = User.objects.filter(is_staff=True)
        patient_name = f"{instance.first_name} {instance.last_name}"
        
        for user in staff_users:
            Notification.objects.create(
                user=user,
                notification_type='patient_registered',
                title='New Patient Registered',
                message=f'{patient_name} has been registered as a new patient.',
                link=f'/patients/{instance.id}'
            )


@receiver(post_save, sender=Doctor)
def create_doctor_notification(sender, instance, created, **kwargs):
    """Create notification when a new doctor is added"""
    if created:
        # Notify admin users
        staff_users = User.objects.filter(is_staff=True)
        doctor_name = f"Dr. {instance.first_name} {instance.last_name}"
        
        for user in staff_users:
            Notification.objects.create(
                user=user,
                notification_type='doctor_assigned',
                title='New Doctor Added',
                message=f'{doctor_name} has been added to the staff.',
                link=f'/doctors/{instance.id}'
            )


def send_appointment_reminders():
    """Function to send appointment reminders (to be run by a scheduled task)"""
    today = timezone.now().date()
    tomorrow = today + timedelta(days=1)
    
    # Get appointments for tomorrow
    tomorrow_appointments = Appointment.objects.filter(
        appointment_date__date=tomorrow,
        status='scheduled'
    )
    
    for appointment in tomorrow_appointments:
        patient_name = f"{appointment.patient.first_name} {appointment.patient.last_name}"
        doctor_name = f"Dr. {appointment.doctor.first_name} {appointment.doctor.last_name}"
        appointment_time = appointment.appointment_date.strftime("%I:%M %p")
        
        # Notify the patient
        if appointment.patient.user:
            Notification.objects.create(
                user=appointment.patient.user,
                notification_type='appointment_reminder',
                title='Appointment Reminder',
                message=f'Reminder: You have an appointment with {doctor_name} tomorrow at {appointment_time}.',
                link=f'/appointments/{appointment.id}'
            )
        
        # Notify the doctor
        if appointment.doctor.user:
            Notification.objects.create(
                user=appointment.doctor.user,
                notification_type='appointment_reminder',
                title='Appointment Reminder',
                message=f'Reminder: You have an appointment with {patient_name} tomorrow at {appointment_time}.',
                link=f'/appointments/{appointment.id}'
            )