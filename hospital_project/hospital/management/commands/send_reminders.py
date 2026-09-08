# hospital/management/commands/send_reminders.py
from django.core.management.base import BaseCommand
from hospital.signals import send_appointment_reminders

class Command(BaseCommand):
    help = 'Send appointment reminders for tomorrow'

    def handle(self, *args, **options):
        count = send_appointment_reminders()
        self.stdout.write(self.style.SUCCESS(f'✅ Appointment reminders sent successfully: {count} notifications created'))