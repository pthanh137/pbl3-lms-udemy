from rest_framework import permissions
from lms.models import Student


class IsStudent(permissions.BasePermission):
    """
    Permission class to check if the authenticated user is a Student.
    Works with JWT tokens that contain student_id or email.
    Also checks authentication status (request.auth must exist).
    """
    
    def has_permission(self, request, view):
        # First check if user is authenticated (has valid token)
        if not hasattr(request, 'auth') or not request.auth:
            return False
        
        # Check if token contains student_id
        student_id = request.auth.get('student_id')
        if student_id:
            return Student.objects.filter(id=student_id).exists()
        
        # Check if token contains email
        email = request.auth.get('email')
        if email:
            return Student.objects.filter(email=email).exists()
        
        # Check user_type to ensure it's a student token
        user_type = request.auth.get('user_type')
        if user_type == 'student':
            # If user_type is student but no student_id/email, still allow
            # (might be a valid student token)
            email = request.auth.get('email')
            if email:
                return Student.objects.filter(email=email).exists()
        
        # Fallback: check request.user if available (for non-JWT auth)
        if hasattr(request, 'user') and request.user and request.user.is_authenticated:
            if hasattr(request.user, 'email'):
                return Student.objects.filter(email=request.user.email).exists()
            elif hasattr(request.user, 'username'):
                return Student.objects.filter(email=request.user.username).exists()
        
        return False
