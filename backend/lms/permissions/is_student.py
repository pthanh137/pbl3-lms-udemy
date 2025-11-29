from rest_framework import permissions
from lms.models import Student


class IsStudent(permissions.BasePermission):
    """
    Permission class to check if the authenticated user is a Student.
    Works with JWT tokens that contain student_id or email.
    Also checks authentication status (request.auth must exist).
    """
    
    def has_permission(self, request, view):
        print(f"DEBUG IsStudent.has_permission: Checking permission")
        print(f"DEBUG: request.auth = {getattr(request, 'auth', None)}")
        
        # First check if user is authenticated (has valid token)
        if not hasattr(request, 'auth') or not request.auth:
            print("DEBUG: No request.auth found")
            return False
        
        # Check if token contains student_id
        student_id = request.auth.get('student_id')
        print(f"DEBUG: student_id from token = {student_id}")
        if student_id:
            exists = Student.objects.filter(id=student_id).exists()
            print(f"DEBUG: Student with ID {student_id} exists: {exists}")
            if exists:
                return True
        
        # Check if token contains email
        email = request.auth.get('email')
        print(f"DEBUG: email from token = {email}")
        if email:
            exists = Student.objects.filter(email=email).exists()
            print(f"DEBUG: Student with email {email} exists: {exists}")
            if exists:
                return True
        
        # Check user_type to ensure it's a student token
        user_type = request.auth.get('user_type')
        print(f"DEBUG: user_type from token = {user_type}")
        if user_type == 'student':
            # If user_type is student but no student_id/email, still allow
            # (might be a valid student token)
            email = request.auth.get('email')
            if email:
                exists = Student.objects.filter(email=email).exists()
                print(f"DEBUG: Student with email {email} (from user_type check) exists: {exists}")
                if exists:
                    return True
        
        # Fallback: check request.user if available (for non-JWT auth)
        if hasattr(request, 'user') and request.user and request.user.is_authenticated:
            print(f"DEBUG: Checking request.user: {request.user}")
            if hasattr(request.user, 'email'):
                exists = Student.objects.filter(email=request.user.email).exists()
                print(f"DEBUG: Student with email {request.user.email} (from request.user) exists: {exists}")
                if exists:
                    return True
            elif hasattr(request.user, 'username'):
                exists = Student.objects.filter(email=request.user.username).exists()
                print(f"DEBUG: Student with email {request.user.username} (from request.user.username) exists: {exists}")
                if exists:
                    return True
        
        print("DEBUG: IsStudent permission check FAILED")
        return False
