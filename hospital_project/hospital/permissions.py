from rest_framework.permissions import BasePermission


class IsDoctorOrReadOnly(BasePermission):
    """
    Only doctors (staff) can create/edit/delete.
    Everyone authenticated can view.
    """
    def has_permission(self, request, view):
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_staff