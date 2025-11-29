from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from django.contrib.auth.hashers import check_password, make_password
from lms.models import Teacher, Student
from lms.serializers import TeacherSerializer, StudentSerializer
from lms.serializers.student_profile_serializer import (
    StudentProfileSerializer, StudentChangePasswordSerializer
)
from lms.permissions import IsStudent


@api_view(['POST'])
@permission_classes([AllowAny])
def StudentRegisterAPIView(request):
    """
    Register a new student.
    POST /api/auth/student/register/
    """
    serializer = StudentSerializer(data=request.data)
    if serializer.is_valid():
        student = serializer.save()
        # Return student info without password
        response_data = StudentSerializer(student).data
        return Response(response_data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def StudentLoginAPIView(request):
    """
    Login for students.
    POST /api/auth/student/login/
    Body: { "email": "...", "password": "..." }
    """
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not email or not password:
        return Response(
            {'error': 'Email and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        student = Student.objects.get(email=email)
    except Student.DoesNotExist:
        return Response(
            {'error': 'Invalid email or password'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Check password
    if not check_password(password, student.password):
        return Response(
            {'error': 'Invalid email or password'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Generate JWT tokens
    refresh = RefreshToken()
    refresh['student_id'] = student.id
    refresh['email'] = student.email
    refresh['user_type'] = 'student'
    
    access_token = refresh.access_token
    access_token['student_id'] = student.id
    access_token['email'] = student.email
    access_token['user_type'] = 'student'
    
    # Return response
    student_data = StudentSerializer(student).data
    return Response({
        'student': student_data,
        'access': str(access_token),
        'refresh': str(refresh)
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def TeacherRegisterAPIView(request):
    """
    Register a new teacher.
    POST /api/auth/teacher/register/
    """
    serializer = TeacherSerializer(data=request.data)
    if serializer.is_valid():
        teacher = serializer.save()
        # Return teacher info without password
        response_data = TeacherSerializer(teacher).data
        return Response(response_data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def TeacherLoginAPIView(request):
    """
    Login for teachers.
    POST /api/auth/teacher/login/
    Body: { "email": "...", "password": "..." }
    """
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not email or not password:
        return Response(
            {'error': 'Email and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        teacher = Teacher.objects.get(email=email)
    except Teacher.DoesNotExist:
        return Response(
            {'error': 'Invalid email or password'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Check password
    if not check_password(password, teacher.password):
        return Response(
            {'error': 'Invalid email or password'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Generate JWT tokens
    refresh = RefreshToken()
    refresh['teacher_id'] = teacher.id
    refresh['email'] = teacher.email
    refresh['user_type'] = 'teacher'
    
    access_token = refresh.access_token
    access_token['teacher_id'] = teacher.id
    access_token['email'] = teacher.email
    access_token['user_type'] = 'teacher'
    
    # Return response
    teacher_data = TeacherSerializer(teacher).data
    return Response({
        'teacher': teacher_data,
        'access': str(access_token),
        'refresh': str(refresh)
    }, status=status.HTTP_200_OK)


# Custom Token Refresh View
class CustomTokenRefreshView(TokenRefreshView):
    """
    Custom token refresh endpoint.
    POST /api/auth/token/refresh/
    Body: { "refresh": "..." }
    """
    pass


def get_current_student_from_request(request):
    """
    Helper function to get the current student from the request.
    """
    if hasattr(request, 'auth') and request.auth:
        student_id = request.auth.get('student_id')
        if student_id:
            try:
                return Student.objects.get(id=student_id)
            except Student.DoesNotExist:
                pass
        
        email = request.auth.get('email')
        if email:
            try:
                return Student.objects.get(email=email)
            except Student.DoesNotExist:
                pass
    
    return None


@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsStudent])
def StudentProfileView(request):
    """
    Get or update student profile.
    GET /api/auth/profile/
    PUT/PATCH /api/auth/profile/
    """
    student = get_current_student_from_request(request)
    if not student:
        return Response(
            {'error': 'Student not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == 'GET':
        serializer = StudentProfileSerializer(student)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method in ['PUT', 'PATCH']:
        serializer = StudentProfileSerializer(student, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsStudent])
def StudentChangePasswordView(request):
    """
    Change student password.
    POST /api/auth/change-password/
    Body: {
        "old_password": "...",
        "new_password": "..."
    }
    """
    student = get_current_student_from_request(request)
    if not student:
        return Response(
            {'error': 'Student not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    serializer = StudentChangePasswordSerializer(data=request.data)
    if serializer.is_valid():
        old_password = serializer.validated_data['old_password']
        new_password = serializer.validated_data['new_password']
        
        # Verify old password
        if not check_password(old_password, student.password):
            return Response(
                {'error': 'Mật khẩu cũ không đúng'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update password
        student.password = make_password(new_password)
        student.save()
        
        return Response(
            {'message': 'Đổi mật khẩu thành công'},
            status=status.HTTP_200_OK
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

