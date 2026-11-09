# hospital/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import Department, Doctor, Patient, Appointment, Notification, QueueTicket, QueueDisplay

# Unregister the default User admin and register a custom one
admin.site.unregister(User)
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'is_superuser')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    list_filter = ('is_staff', 'is_superuser', 'is_active')

admin.site.register(Department)
admin.site.register(Doctor)
admin.site.register(Patient)
admin.site.register(Appointment)
admin.site.register(Notification)


@admin.register(QueueTicket)
class QueueTicketAdmin(admin.ModelAdmin):
    list_display = (
        'queue_number', 'patient', 'department', 'status', 'current_stage',
        'priority', 'is_emergency', 'created_at',
    )
    list_filter = ('status', 'current_stage', 'priority', 'is_emergency', 'department')
    search_fields = ('queue_number', 'patient__first_name', 'patient__last_name')
    readonly_fields = ('queue_number', 'ticket_code', 'sequence_number', 'created_at')


@admin.register(QueueDisplay)
class QueueDisplayAdmin(admin.ModelAdmin):
    list_display = ('name', 'department', 'current_ticket', 'room_number', 'is_active', 'updated_at')
    list_filter = ('is_active', 'department')