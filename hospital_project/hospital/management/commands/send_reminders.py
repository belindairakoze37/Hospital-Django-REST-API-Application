# hospital/management/commands/send_reminders.py
from django.core.management.base import BaseCommand
from hospital.signals import send_appointment_reminders

class Command(BaseCommand):
    help = "Sends email reminders for tomorrow's appointments and marks them as reminded"

    def handle(self, *args, **options):
        emailed = send_appointment_reminders()

        for address in emailed:
            self.stdout.write(f"Sent reminder to {address}")

        if emailed:
            self.stdout.write(self.style.SUCCESS(f"{len(emailed)} reminder email(s) sent"))
        else:
            self.stdout.write("No appointments need a reminder right now")