# hospital/signals.py
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone
from datetime import timedelta
from .models import Appointment, Patient, Doctor, Notification, QueueTicket
from .utils import send_appointment_reminder_email, send_queue_called_email, user_language
from django.contrib.auth.models import User


def _log(message):
    """Log a line without crashing on consoles that cannot encode emoji."""
    try:
        print(message)
    except UnicodeEncodeError:
        print(message.encode('ascii', 'replace').decode('ascii'))

@receiver(post_save, sender=Appointment)
def create_appointment_notification(sender, instance, created, **kwargs):
    """Create notifications when an appointment is created, updated, or cancelled"""
    
    try:
        if created:
            # Appointment Created - Notify the patient and doctor
            patient_name = f"{instance.patient.first_name} {instance.patient.last_name}"
            doctor_name = f"Dr. {instance.doctor.first_name} {instance.doctor.last_name}"
            appointment_date = instance.appointment_date.strftime("%B %d, %Y at %I:%M %p")
            
            # Notify the patient (if they have a user account)
            if instance.patient.user:
                Notification.objects.create(
                    user=instance.patient.user,
                    notification_type='appointment_created',
                    title='Appointment Confirmed',
                    message=f'Your appointment with {doctor_name} has been confirmed for {appointment_date}.',
                    link=f'/appointments/{instance.id}'
                )
                _log(f"âœ… Notification sent to patient: {instance.patient.user.username}")
            
            # Notify the doctor (if they have a user account)
            if instance.doctor.user:
                Notification.objects.create(
                    user=instance.doctor.user,
                    notification_type='appointment_created',
                    title='New Appointment Scheduled',
                    message=f'New appointment with {patient_name} scheduled for {appointment_date}.',
                    link=f'/appointments/{instance.id}'
                )
                _log(f"âœ… Notification sent to doctor: {instance.doctor.user.username}")
                
        elif not created and instance.status == 'cancelled':
            # Appointment Cancelled - Notify the patient and doctor
            patient_name = f"{instance.patient.first_name} {instance.patient.last_name}"
            doctor_name = f"Dr. {instance.doctor.first_name} {instance.doctor.last_name}"
            
            if instance.patient.user:
                Notification.objects.create(
                    user=instance.patient.user,
                    notification_type='appointment_cancelled',
                    title='Appointment Cancelled',
                    message=f'Your appointment with {doctor_name} has been cancelled.',
                    link=f'/appointments/{instance.id}'
                )
                _log(f"âœ… Cancellation notification sent to patient: {instance.patient.user.username}")
            
            if instance.doctor.user:
                Notification.objects.create(
                    user=instance.doctor.user,
                    notification_type='appointment_cancelled',
                    title='Appointment Cancelled',
                    message=f'Appointment with {patient_name} has been cancelled.',
                    link=f'/appointments/{instance.id}'
                )
                _log(f"âœ… Cancellation notification sent to doctor: {instance.doctor.user.username}")
                
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
                _log(f"âœ… Completion notification sent to patient: {instance.patient.user.username}")
                
    except Exception as e:
        _log(f"âŒ Error creating appointment notification: {e}")


@receiver(post_save, sender=Patient)
def create_patient_notification(sender, instance, created, **kwargs):
    """Create notification when a new patient is registered"""
    try:
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
                _log(f"âœ… Patient registration notification sent to admin: {user.username}")
                
            # Also notify the patient themselves if they have a user account
            if instance.user:
                Notification.objects.create(
                    user=instance.user,
                    notification_type='patient_registered',
                    title='Welcome to QueueCare',
                    message=f'Welcome {patient_name}! Your patient account has been created successfully.',
                    link=f'/patients/{instance.id}'
                )
                _log(f"âœ… Welcome notification sent to patient: {instance.user.username}")
                
    except Exception as e:
        _log(f"âŒ Error creating patient notification: {e}")


@receiver(post_save, sender=Doctor)
def create_doctor_notification(sender, instance, created, **kwargs):
    """Create notification when a new doctor is added"""
    try:
        if created:
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
                _log(f"âœ… Doctor notification sent to admin: {user.username}")
                
            # Also notify the doctor themselves if they have a user account
            if instance.user:
                Notification.objects.create(
                    user=instance.user,
                    notification_type='doctor_assigned',
                    title='Welcome to QueueCare',
                    message=f'Welcome {doctor_name}! You have been added as a doctor.',
                    link=f'/doctors/{instance.id}'
                )
                _log(f"âœ… Welcome notification sent to doctor: {instance.user.username}")
                
    except Exception as e:
        _log(f"âŒ Error creating doctor notification: {e}")


@receiver(pre_save, sender=QueueTicket)
def remember_ticket_status(sender, instance, **kwargs):
    """Cache the stored status so the post_save hook can detect the transition."""
    if not instance.pk:
        return
    instance._previous_status = (
        QueueTicket.objects.filter(pk=instance.pk)
        .values_list('status', flat=True)
        .first()
    )


@receiver(post_save, sender=QueueTicket)
def queue_ticket_notifications(sender, instance, created, **kwargs):
    """Email the patient as soon as their number is called.

    Only the transition into ``called`` sends mail, so re-saving a ticket that
    is already called never double-mails the patient. The address comes from
    the ticket itself first, which is what makes this work for public
    walk-ins who have no user account.
    """
    if instance.status != 'called':
        return
    if getattr(instance, '_previous_status', None) == 'called':
        return

    email = instance.contact_email
    if not email:
        _log(f"No email on file for ticket {instance.queue_number}; skipping call email")
        return

    send_queue_called_email(
        email,
        instance.display_name,
        instance.queue_number,
        instance.room_number,
        language=user_language(instance.patient.user if instance.patient_id else None),
    )
    _log(f"Queue call email sent to {email} for ticket {instance.queue_number}")


def send_appointment_reminders():
    """Email + in-app reminders for tomorrow's appointments.

    ``Appointment.reminder_sent`` keeps this idempotent: running the command
    twice in a day never double-mails a patient, and reminders also reach
    patients without an account as long as a patient email is on file.

    Returns the list of addresses that were emailed.
    """
    emailed = []
    try:
        today = timezone.now().date()
        tomorrow = today + timedelta(days=1)

        # Get appointments for tomorrow that have not been reminded yet
        tomorrow_appointments = Appointment.objects.select_related(
            'patient__user', 'doctor__user'
        ).filter(
            appointment_date__date=tomorrow,
            status='scheduled',
            reminder_sent=False,
        )

        reminder_count = 0
        for appointment in tomorrow_appointments:
            patient_name = f"{appointment.patient.first_name} {appointment.patient.last_name}"
            doctor_name = f"Dr. {appointment.doctor.first_name} {appointment.doctor.last_name}"
            appointment_time = appointment.appointment_date.strftime("%I:%M %p")

            # Email the patient (works for walk-ins, who have no user account)
            patient_email = (
                appointment.patient.user.email
                if appointment.patient.user_id
                else appointment.patient.email
            )
            patient_email = patient_email or appointment.patient.email
            patient_language = user_language(
                appointment.patient.user if appointment.patient.user_id else None
            )
            if send_appointment_reminder_email(
                patient_email,
                appointment.patient.first_name,
                doctor_name,
                appointment.appointment_date,
                language=patient_language,
            ):
                emailed.append(patient_email)

            # Notify the patient
            if appointment.patient.user:
                Notification.objects.create(
                    user=appointment.patient.user,
                    notification_type='appointment_reminder',
                    title='Appointment Reminder',
                    message=f'Reminder: You have an appointment with {doctor_name} tomorrow at {appointment_time}.',
                    link=f'/appointments/{appointment.id}'
                )
                reminder_count += 1

            # Notify the doctor
            if appointment.doctor.user:
                Notification.objects.create(
                    user=appointment.doctor.user,
                    notification_type='appointment_reminder',
                    title='Appointment Reminder',
                    message=f'Reminder: You have an appointment with {patient_name} tomorrow at {appointment_time}.',
                    link=f'/appointments/{appointment.id}'
                )
                reminder_count += 1

            appointment.reminder_sent = True
            appointment.save(update_fields=['reminder_sent'])

        _log(f"Appointment reminders: {reminder_count} notifications, {len(emailed)} emails")
        return emailed

    except Exception as e:
        _log(f"Error sending reminders: {e}")
        return emailed