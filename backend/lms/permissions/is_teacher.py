from rest_framework import permissions
from lms.models import Teacher


class IsTeacher(permissions.BasePermission):
    """
    Permission class to check if the authenticated user is a Teacher.
    Works with JWT tokens that contain teacher_id or email.
    Also checks authentication status (request.auth must exist).
    """
    
    def has_permission(self, request, view):
        # First check if user is authenticated (has valid token)
        if not hasattr(request, 'auth') or not request.auth:
            return False
        
        # Check if token contains teacher_id
        teacher_id = request.auth.get('teacher_id')
        if teacher_id:
            return Teacher.objects.filter(id=teacher_id).exists()
        
        # Check if token contains email
        email = request.auth.get('email')
        if email:
            return Teacher.objects.filter(email=email).exists()
        
        # Check user_type to ensure it's a teacher token
        user_type = request.auth.get('user_type')
        if user_type == 'teacher':
            # If user_type is teacher but no teacher_id/email, still allow
            # (might be a valid teacher token)
            email = request.auth.get('email')
            if email:
                return Teacher.objects.filter(email=email).exists()
        
        # Fallback: check request.user if available (for non-JWT auth)
        if hasattr(request, 'user') and request.user and request.user.is_authenticated:
            if hasattr(request.user, 'email'):
                return Teacher.objects.filter(email=request.user.email).exists()
            elif hasattr(request.user, 'username'):
                return Teacher.objects.filter(email=request.user.username).exists()
        
        return False
