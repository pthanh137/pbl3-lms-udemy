from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, NotFound, ValidationError
from django.contrib.auth.hashers import check_password, make_password
from lms.models import (
    Teacher, Course, Section, Lesson, Quiz, Question, Option
)
from lms.serializers import (
    CourseSerializer, SectionSerializer, LessonSerializer,
    QuizSerializer, QuestionSerializer, OptionSerializer
)
from lms.serializers.teacher_profile_serializer import (
    TeacherProfileSerializer, TeacherChangePasswordSerializer
)
from lms.permissions import IsTeacher


def get_current_teacher(request):
    """
    Helper function to get the current teacher from the request.
    Assumes JWT token contains teacher_id or email.
    """
    if hasattr(request, 'auth') and request.auth:
        # Try to get teacher_id from token
        teacher_id = request.auth.get('teacher_id')
        if teacher_id:
            try:
                return Teacher.objects.get(id=teacher_id)
            except Teacher.DoesNotExist:
                pass
        
        # Try to get email from token
        email = request.auth.get('email')
        if email:
            try:
                return Teacher.objects.get(email=email)
            except Teacher.DoesNotExist:
                pass
    
    # Fallback: try to get from user if available
    if hasattr(request, 'user') and request.user and request.user.is_authenticated:
        if hasattr(request.user, 'email'):
            try:
                return Teacher.objects.get(email=request.user.email)
            except Teacher.DoesNotExist:
                pass
    
    return None


class TeacherCourseViewSet(viewsets.ModelViewSet):
    """
    ViewSet for teachers to manage their courses.
    Requires: JWT auth + IsTeacher permission
    Note: IsTeacher already checks authentication via request.auth
    """
    serializer_class = CourseSerializer
    permission_classes = [IsTeacher]  # IsTeacher already checks authentication
    
    def get_queryset(self):
        """
        Return only courses owned by the current teacher.
        """
        teacher = get_current_teacher(self.request)
        if not teacher:
            return Course.objects.none()
        return Course.objects.filter(teacher=teacher)
    
    def perform_create(self, serializer):
        """
        Automatically set the teacher to the current teacher.
        """
        teacher = get_current_teacher(self.request)
        if not teacher:
            raise PermissionDenied("Teacher not found")
        serializer.save(teacher=teacher)
    
    def perform_update(self, serializer):
        """
        Ensure the teacher owns the course before updating.
        """
        course = self.get_object()
        teacher = get_current_teacher(self.request)
        if not teacher or course.teacher != teacher:
            raise PermissionDenied("You do not have permission to update this course")
        serializer.save()
    
    def perform_destroy(self, instance):
        """
        Ensure the teacher owns the course before deleting.
        """
        teacher = get_current_teacher(self.request)
        if not teacher or instance.teacher != teacher:
            raise PermissionDenied("You do not have permission to delete this course")
        instance.delete()


class SectionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing sections of courses.
    Requires: JWT auth + IsTeacher permission
    """
    serializer_class = SectionSerializer
    permission_classes = [IsTeacher]  # IsTeacher already checks authentication
    
    def get_queryset(self):
        """
        Return sections of courses owned by the current teacher.
        Filter by course ID if provided in query params.
        """
        teacher = get_current_teacher(self.request)
        if not teacher:
            return Section.objects.none()
        
        queryset = Section.objects.filter(course__teacher=teacher)
        
        # Filter by course ID if provided
        course_id = self.request.query_params.get('course')
        if course_id:
            try:
                queryset = queryset.filter(course_id=int(course_id))
            except (ValueError, TypeError):
                pass
        
        return queryset
    
    def perform_create(self, serializer):
        """
        Validate that the course belongs to the current teacher.
        """
        teacher = get_current_teacher(self.request)
        if not teacher:
            raise PermissionDenied("Teacher not found")
        
        course_id = self.request.data.get('course')
        if not course_id:
            raise PermissionDenied("Course ID is required")
        
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            raise NotFound("Course not found")
        
        if course.teacher != teacher:
            raise PermissionDenied("You do not have permission to create sections for this course")
        
        serializer.save(course=course)
    
    def perform_update(self, serializer):
        """
        Ensure the section belongs to a course owned by the current teacher.
        """
        section = self.get_object()
        teacher = get_current_teacher(self.request)
        if not teacher or section.course.teacher != teacher:
            raise PermissionDenied("You do not have permission to update this section")
        serializer.save()
    
    def perform_destroy(self, instance):
        """
        Ensure the section belongs to a course owned by the current teacher.
        """
        teacher = get_current_teacher(self.request)
        if not teacher or instance.course.teacher != teacher:
            raise PermissionDenied("You do not have permission to delete this section")
        instance.delete()


class LessonViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing lessons.
    Requires: JWT auth + IsTeacher permission
    """
    serializer_class = LessonSerializer
    permission_classes = [IsTeacher]  # IsTeacher already checks authentication
    
    def get_queryset(self):
        """
        Return lessons in sections of courses owned by the current teacher.
        Filter by section ID if provided in query params.
        Optimize queries with select_related for section and course.
        """
        teacher = get_current_teacher(self.request)
        if not teacher:
            return Lesson.objects.none()
        
        queryset = Lesson.objects.filter(section__course__teacher=teacher).select_related('section', 'section__course')
        
        # Filter by section ID if provided
        section_id = self.request.query_params.get('section')
        if section_id:
            try:
                queryset = queryset.filter(section_id=int(section_id))
            except (ValueError, TypeError):
                pass
        
        return queryset
    
    def perform_create(self, serializer):
        """
        Validate that the section belongs to a course owned by the current teacher.
        Handle video file upload: if video_file is provided, set video_url to the file URL.
        """
        teacher = get_current_teacher(self.request)
        if not teacher:
            raise PermissionDenied("Teacher not found")
        
        section_id = self.request.data.get('section')
        if not section_id:
            raise PermissionDenied("Section ID is required")
        
        try:
            section = Section.objects.get(id=section_id)
        except Section.DoesNotExist:
            raise NotFound("Section not found")
        
        if section.course.teacher != teacher:
            raise PermissionDenied("You do not have permission to create lessons for this section")
        
        # Handle video file upload
        lesson = serializer.save(section=section)
        
        # If video_file was uploaded, set video_url to the file URL
        if lesson.video_file:
            from django.conf import settings
            import os
            # Get the file URL
            video_url = lesson.video_file.url
            # Make it absolute if needed
            if not video_url.startswith('http'):
                request = self.request
                video_url = request.build_absolute_uri(video_url)
            lesson.video_url = video_url
            lesson.save(update_fields=['video_url'])
    
    def perform_update(self, serializer):
        """
        Ensure the lesson belongs to a section of a course owned by the current teacher.
        Handle video file upload: if video_file is provided, set video_url to the file URL.
        """
        lesson = self.get_object()
        teacher = get_current_teacher(self.request)
        if not teacher or lesson.section.course.teacher != teacher:
            raise PermissionDenied("You do not have permission to update this lesson")
        
        # Handle video file upload
        updated_lesson = serializer.save()
        
        # If video_file was uploaded, set video_url to the file URL
        if updated_lesson.video_file:
            from django.conf import settings
            import os
            # Get the file URL
            video_url = updated_lesson.video_file.url
            # Make it absolute if needed
            if not video_url.startswith('http'):
                request = self.request
                video_url = request.build_absolute_uri(video_url)
            updated_lesson.video_url = video_url
            updated_lesson.save(update_fields=['video_url'])
    
    def perform_destroy(self, instance):
        """
        Ensure the lesson belongs to a section of a course owned by the current teacher.
        """
        teacher = get_current_teacher(self.request)
        if not teacher or instance.section.course.teacher != teacher:
            raise PermissionDenied("You do not have permission to delete this lesson")
        instance.delete()


class QuizViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing quizzes.
    Requires: JWT auth + IsTeacher permission
    """
    serializer_class = QuizSerializer
    permission_classes = [IsTeacher]  # IsTeacher already checks authentication
    
    def get_queryset(self):
        """
        Return quizzes of courses owned by the current teacher.
        Filter by course ID if provided in query params.
        """
        teacher = get_current_teacher(self.request)
        if not teacher:
            return Quiz.objects.none()
        
        queryset = Quiz.objects.filter(course__teacher=teacher)
        
        # Filter by course ID if provided
        course_id = self.request.query_params.get('course')
        if course_id:
            try:
                queryset = queryset.filter(course_id=int(course_id))
            except (ValueError, TypeError):
                pass
        
        return queryset
    
    def perform_create(self, serializer):
        """
        Validate that the course belongs to the current teacher.
        """
        teacher = get_current_teacher(self.request)
        if not teacher:
            raise PermissionDenied("Teacher not found")
        
        course_id = self.request.data.get('course')
        if not course_id:
            raise PermissionDenied("Course ID is required")
        
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            raise NotFound("Course not found")
        
        if course.teacher != teacher:
            raise PermissionDenied("You do not have permission to create quizzes for this course")
        
        serializer.save(course=course)
    
    def perform_update(self, serializer):
        """
        Ensure the quiz belongs to a course owned by the current teacher.
        """
        quiz = self.get_object()
        teacher = get_current_teacher(self.request)
        if not teacher or quiz.course.teacher != teacher:
            raise PermissionDenied("You do not have permission to update this quiz")
        serializer.save()
    
    def perform_destroy(self, instance):
        """
        Ensure the quiz belongs to a course owned by the current teacher.
        """
        teacher = get_current_teacher(self.request)
        if not teacher or instance.course.teacher != teacher:
            raise PermissionDenied("You do not have permission to delete this quiz")
        instance.delete()


class QuestionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing questions in quizzes.
    Requires: JWT auth + IsTeacher permission
    """
    serializer_class = QuestionSerializer
    permission_classes = [IsTeacher]  # IsTeacher already checks authentication
    
    def get_queryset(self):
        """
        Return questions in quizzes of courses owned by the current teacher.
        """
        teacher = get_current_teacher(self.request)
        if not teacher:
            return Question.objects.none()
        return Question.objects.filter(quiz__course__teacher=teacher)
    
    def perform_create(self, serializer):
        """
        Validate that the quiz belongs to a course owned by the current teacher.
        """
        teacher = get_current_teacher(self.request)
        if not teacher:
            raise PermissionDenied("Teacher not found")
        
        quiz_id = self.request.data.get('quiz')
        if not quiz_id:
            raise PermissionDenied("Quiz ID is required")
        
        try:
            quiz = Quiz.objects.get(id=quiz_id)
        except Quiz.DoesNotExist:
            raise NotFound("Quiz not found")
        
        if quiz.course.teacher != teacher:
            raise PermissionDenied("You do not have permission to create questions for this quiz")
        
        serializer.save(quiz=quiz)
    
    def perform_update(self, serializer):
        """
        Ensure the question belongs to a quiz of a course owned by the current teacher.
        """
        question = self.get_object()
        teacher = get_current_teacher(self.request)
        if not teacher or question.quiz.course.teacher != teacher:
            raise PermissionDenied("You do not have permission to update this question")
        serializer.save()
    
    def perform_destroy(self, instance):
        """
        Ensure the question belongs to a quiz of a course owned by the current teacher.
        """
        teacher = get_current_teacher(self.request)
        if not teacher or instance.quiz.course.teacher != teacher:
            raise PermissionDenied("You do not have permission to delete this question")
        instance.delete()


class OptionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing options in questions.
    Requires: JWT auth + IsTeacher permission
    """
    serializer_class = OptionSerializer
    permission_classes = [IsTeacher]  # IsTeacher already checks authentication
    
    def get_queryset(self):
        """
        Return options in questions of quizzes of courses owned by the current teacher.
        """
        teacher = get_current_teacher(self.request)
        if not teacher:
            return Option.objects.none()
        return Option.objects.filter(question__quiz__course__teacher=teacher)
    
    def perform_create(self, serializer):
        """
        Validate that the question belongs to a quiz of a course owned by the current teacher.
        """
        teacher = get_current_teacher(self.request)
        if not teacher:
            raise PermissionDenied("Teacher not found")
        
        question_id = self.request.data.get('question')
        if not question_id:
            raise PermissionDenied("Question ID is required")
        
        try:
            question = Question.objects.get(id=question_id)
        except Question.DoesNotExist:
            raise NotFound("Question not found")
        
        if question.quiz.course.teacher != teacher:
            raise PermissionDenied("You do not have permission to create options for this question")
        
        serializer.save(question=question)
    
    def perform_update(self, serializer):
        """
        Ensure the option belongs to a question of a quiz of a course owned by the current teacher.
        """
        option = self.get_object()
        teacher = get_current_teacher(self.request)
        if not teacher or option.question.quiz.course.teacher != teacher:
            raise PermissionDenied("You do not have permission to update this option")
        serializer.save()
    
    def perform_destroy(self, instance):
        """
        Ensure the option belongs to a question of a quiz of a course owned by the current teacher.
        """
        teacher = get_current_teacher(self.request)
        if not teacher or instance.question.quiz.course.teacher != teacher:
            raise PermissionDenied("You do not have permission to delete this option")
        instance.delete()


# Teacher Profile and Password Change Views
@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsTeacher])
def TeacherProfileView(request):
    """
    Get or update teacher profile.
    GET /api/teacher/profile/
    PUT/PATCH /api/teacher/profile/
    """
    teacher = get_current_teacher(request)
    if not teacher:
        return Response(
            {'error': 'Teacher not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == 'GET':
        serializer = TeacherProfileSerializer(teacher)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method in ['PUT', 'PATCH']:
        serializer = TeacherProfileSerializer(teacher, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsTeacher])
def TeacherChangePasswordView(request):
    """
    Change teacher password.
    POST /api/teacher/change-password/
    Body: {
        "old_password": "...",
        "new_password": "...",
        "confirm_password": "..."
    }
    """
    teacher = get_current_teacher(request)
    if not teacher:
        return Response(
            {'error': 'Teacher not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    serializer = TeacherChangePasswordSerializer(data=request.data)
    if serializer.is_valid():
        old_password = serializer.validated_data['old_password']
        new_password = serializer.validated_data['new_password']
        
        # Verify old password
        if not check_password(old_password, teacher.password):
            return Response(
                {'error': 'Old password is incorrect'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update password
        teacher.password = make_password(new_password)
        teacher.save()
        
        return Response(
            {'message': 'Password changed successfully'},
            status=status.HTTP_200_OK
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


