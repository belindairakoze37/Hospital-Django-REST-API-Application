# hospital/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Doctor

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