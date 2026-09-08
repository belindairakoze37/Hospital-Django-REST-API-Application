# hospital/apps.py
from django.apps import AppConfig

class HospitalConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'hospital'

    def ready(self):
        # Import signals to register them
        import hospital.signals
        print("✅ Signals loaded successfully")