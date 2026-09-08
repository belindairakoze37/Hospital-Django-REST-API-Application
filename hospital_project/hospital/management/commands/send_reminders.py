from django.core.management.base import BaseCommand
from hospital.signals import send_appointment_reminders

class Command(BaseCommand):
    help = 'Send appointment reminders for tomorrow'

    def handle(self, *args, **options):
        send_appointment_reminders()
        self.stdout.write(self.style.SUCCESS('Appointment reminders sent successfully'))