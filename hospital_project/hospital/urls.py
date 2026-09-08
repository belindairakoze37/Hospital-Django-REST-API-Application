from rest_framework.routers import DefaultRouter
from .views import (
    AppointmentViewSet,
    DepartmentViewSet,
    DoctorViewSet,
    PatientViewSet,
    UserViewSet,
    NotificationViewSet,
)

router = DefaultRouter()
router.register(r'departments', DepartmentViewSet)
router.register(r'doctors', DoctorViewSet)
router.register(r'patients', PatientViewSet)
router.register(r'appointments', AppointmentViewSet)
router.register(r'users', UserViewSet)
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = router.urls