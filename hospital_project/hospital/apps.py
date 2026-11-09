# hospital/apps.py
from django.apps import AppConfig

class HospitalConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'hospital'

    def ready(self):
        # Import signals to register them
        import hospital.signals
        # ASCII only: the Windows console code page (cp1252) cannot encode emoji
        # and would crash Django startup.
        print("[hospital] signals loaded")