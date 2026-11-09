from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    AppointmentViewSet,
    DepartmentViewSet,
    DoctorViewSet,
    NewsletterSubscribeView,
    PatientViewSet,
    UserViewSet,
    NotificationViewSet,
    QueueTicketViewSet,
    QueueDisplayViewSet,
    SupportMessageView,
)

router = DefaultRouter()
router.register(r'departments', DepartmentViewSet)
router.register(r'doctors', DoctorViewSet)
router.register(r'patients', PatientViewSet)
router.register(r'appointments', AppointmentViewSet)
router.register(r'users', UserViewSet)
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'queue', QueueTicketViewSet, basename='queue')
router.register(r'queue-displays', QueueDisplayViewSet)

urlpatterns = router.urls + [
    # Public, unauthenticated endpoints used by the marketing pages.
    path('newsletter/subscribe/', NewsletterSubscribeView.as_view(), name='newsletter-subscribe'),
    path('support/messages/', SupportMessageView.as_view(), name='support-messages'),
]