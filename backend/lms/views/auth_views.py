from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from django.contrib.auth.hashers import check_password
from lms.models import Teacher, Student
from lms.serializers import TeacherSerializer, StudentSerializer


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
