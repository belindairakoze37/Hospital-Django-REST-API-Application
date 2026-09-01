from rest_framework.routers import DefaultRouter

from .views import (
    AppointmentViewSet,
    DepartmentViewSet,
    DoctorViewSet,
    PatientViewSet,
)

router = DefaultRouter()

router.register(r'departments', DepartmentViewSet)
router.register(r'doctors', DoctorViewSet)
router.register(r'patients', PatientViewSet)
router.register(r'appointments', AppointmentViewSet)

urlpatterns = router.urls