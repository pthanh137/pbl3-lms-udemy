from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, NotFound
from rest_framework.views import APIView
from django.db.models import Q
from lms.models import (
    Student, Course, Enrollment, Quiz, Question, Option, QuizAttempt,
    Lesson, StudentProgress
)
from lms.serializers import (
    EnrollmentSerializer, CourseSerializer, QuizSerializer,
    QuizAttemptSerializer, StudentProgressSerializer
)
from lms.permissions import IsStudent


def get_current_student(request):
    """
    Helper function to get the current student from the request.
    Assumes JWT token contains student_id or email.
    """
    if hasattr(request, 'auth') and request.auth:
        # Try to get student_id from token
        student_id = request.auth.get('student_id')
        if student_id:
            try:
                return Student.objects.get(id=student_id)
            except Student.DoesNotExist:
                pass
        
        # Try to get email from token
        email = request.auth.get('email')
        if email:
            try:
                return Student.objects.get(email=email)
            except Student.DoesNotExist:
                pass
    
    # Fallback: try to get from user if available
    if hasattr(request, 'user') and request.user and request.user.is_authenticated:
        if hasattr(request.user, 'email'):
            try:
                return Student.objects.get(email=request.user.email)
            except Student.DoesNotExist:
                pass
    
    return None


class EnrollmentView(APIView):
    """
    View for student enrollment.
    POST /api/student/enroll/ - enroll in a course
    GET /api/student/courses/ - list enrolled courses
    """
    permission_classes = [IsStudent]  # IsStudent already checks authentication
    
    def post(self, request):
        """
        Enroll in a course.
        Body: { "course": <course_id> }
        """
        student = get_current_student(request)
        if not student:
            raise PermissionDenied("Student not found")
        
        course_id = request.data.get('course')
        if not course_id:
            return Response(
                {'error': 'Course ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response(
                {'error': 'Course not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Create or get enrollment
        enrollment, created = Enrollment.objects.get_or_create(
            student=student,
            course=course
        )
        
        # Update course total_enrollments (signal will handle this, but we can also do it here)
        if created:
            course.total_enrollments = Enrollment.objects.filter(course=course).count()
            course.save(update_fields=['total_enrollments'])
        
        serializer = EnrollmentSerializer(enrollment)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )
    
    def get(self, request):
        """
        List all courses the student is enrolled in.
        """
        student = get_current_student(request)
        if not student:
            raise PermissionDenied("Student not found")
        
        enrollments = Enrollment.objects.filter(student=student)
        courses = [enrollment.course for enrollment in enrollments]
        
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class StudentCourseContentView(APIView):
    """
    Get course content (only if student is enrolled).
    GET /api/student/courses/<course_id>/content/
    Returns course with progress info for each lesson.
    """
    permission_classes = [IsStudent]  # IsStudent already checks authentication
    
    def get(self, request, course_id):
        """
        Get full course content if student is enrolled, with progress data.
        """
        student = get_current_student(request)
        if not student:
            raise PermissionDenied("Student not found")
        
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response(
                {'error': 'Course not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if student is enrolled
        enrollment = Enrollment.objects.filter(student=student, course=course).first()
        if not enrollment:
            return Response(
                {'error': 'You are not enrolled in this course'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get course data with sections and lessons
        course_data = CourseSerializer(course).data
        
        # Add progress info to each lesson
        for section_data in course_data.get('sections', []):
            for lesson_data in section_data.get('lessons', []):
                lesson_id = lesson_data['id']
                progress = StudentProgress.objects.filter(
                    student=student,
                    lesson_id=lesson_id
                ).first()
                
                if progress:
                    lesson_data['progress'] = {
                        'watched_seconds': progress.watched_seconds,
                        'completed': progress.completed
                    }
                else:
                    lesson_data['progress'] = {
                        'watched_seconds': 0,
                        'completed': False
                    }
        
        # Add enrollment completion status
        course_data['enrollment_completed'] = enrollment.completed
        
        return Response(course_data, status=status.HTTP_200_OK)


class StudentQuizDetailView(APIView):
    """
    Get quiz details for a student (without is_correct flags).
    GET /api/student/quiz/<quiz_id>/
    """
    permission_classes = [IsStudent]  # IsStudent already checks authentication
    
    def get(self, request, quiz_id):
        """
        Get quiz details without exposing correct answers.
        """
        student = get_current_student(request)
        if not student:
            raise PermissionDenied("Student not found")
        
        try:
            quiz = Quiz.objects.get(id=quiz_id)
        except Quiz.DoesNotExist:
            return Response(
                {'error': 'Quiz not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if student is enrolled in the course
        if not Enrollment.objects.filter(student=student, course=quiz.course).exists():
            return Response(
                {'error': 'You are not enrolled in this course'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get quiz data
        quiz_data = {
            'id': quiz.id,
            'title': quiz.title,
            'description': quiz.description,
            'pass_mark': quiz.pass_mark,
            'created_at': quiz.created_at,
            'questions': []
        }
        
        # Get questions with options (without is_correct)
        questions = Question.objects.filter(quiz=quiz).order_by('order', 'id')
        for question in questions:
            question_data = {
                'id': question.id,
                'question_text': question.question_text,
                'order': question.order,
                'options': []
            }
            
            options = Option.objects.filter(question=question).order_by('id')
            for option in options:
                option_data = {
                    'id': option.id,
                    'option_text': option.option_text,
                    # is_correct is intentionally excluded
                }
                question_data['options'].append(option_data)
            
            quiz_data['questions'].append(question_data)
        
        return Response(quiz_data, status=status.HTTP_200_OK)


class StudentQuizSubmitView(APIView):
    """
    Submit quiz answers and calculate score.
    POST /api/student/quiz/<quiz_id>/submit/
    Body: { "answers": { "<question_id>": <option_id>, ... } }
    """
    permission_classes = [IsStudent]  # IsStudent already checks authentication
    
    def post(self, request, quiz_id):
        """
        Submit quiz answers and create QuizAttempt.
        """
        student = get_current_student(request)
        if not student:
            raise PermissionDenied("Student not found")
        
        try:
            quiz = Quiz.objects.get(id=quiz_id)
        except Quiz.DoesNotExist:
            return Response(
                {'error': 'Quiz not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if student is enrolled in the course
        if not Enrollment.objects.filter(student=student, course=quiz.course).exists():
            return Response(
                {'error': 'You are not enrolled in this course'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        answers = request.data.get('answers', {})
        if not answers:
            return Response(
                {'error': 'Answers are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get all questions for this quiz
        questions = Question.objects.filter(quiz=quiz)
        total_questions = questions.count()
        
        if total_questions == 0:
            return Response(
                {'error': 'Quiz has no questions'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Calculate score
        correct_count = 0
        for question in questions:
            question_id = str(question.id)
            if question_id in answers:
                selected_option_id = answers[question_id]
                try:
                    selected_option = Option.objects.get(
                        id=selected_option_id,
                        question=question
                    )
                    if selected_option.is_correct:
                        correct_count += 1
                except Option.DoesNotExist:
                    # Invalid option ID, count as wrong
                    pass
        
        # Calculate score percentage
        score = (correct_count / total_questions) * 100
        passed = score >= quiz.pass_mark
        
        # Create QuizAttempt
        quiz_attempt = QuizAttempt.objects.create(
            student=student,
            quiz=quiz,
            score=score,
            passed=passed
        )
        
        return Response({
            'score': round(score, 2),
            'passed': passed,
            'correct_answers': correct_count,
            'total_questions': total_questions,
            'attempt_id': quiz_attempt.id
        }, status=status.HTTP_201_CREATED)


class StudentQuizAttemptsListView(APIView):
    """
    List all quiz attempts for the current student.
    GET /api/student/quiz/attempts/
    """
    permission_classes = [IsStudent]  # IsStudent already checks authentication
    
    def get(self, request):
        """
        List all quiz attempts for the current student.
        """
        student = get_current_student(request)
        if not student:
            raise PermissionDenied("Student not found")
        
        attempts = QuizAttempt.objects.filter(student=student).order_by('-created_at')
        serializer = QuizAttemptSerializer(attempts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class StudentLessonProgressView(APIView):
    """
    Update or create student lesson progress.
    POST /api/student/lesson-progress/
    Body: { "lesson_id": <id>, "watched_seconds": <int>, "completed": <bool> }
    """
    permission_classes = [IsStudent]  # IsStudent already checks authentication
    
    def post(self, request):
        """
        Upsert student progress for a lesson.
        Auto-marks completed if watched_seconds >= lesson.duration_seconds.
        Auto-marks course completed if all lessons are completed.
        """
        student = get_current_student(request)
        if not student:
            raise PermissionDenied("Student not found")
        
        lesson_id = request.data.get('lesson_id')
        watched_seconds = request.data.get('watched_seconds', 0)
        completed = request.data.get('completed', False)
        
        if not lesson_id:
            return Response(
                {'error': 'lesson_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            lesson = Lesson.objects.get(id=lesson_id)
        except Lesson.DoesNotExist:
            return Response(
                {'error': 'Lesson not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if student is enrolled in the course
        if not Enrollment.objects.filter(student=student, course=lesson.section.course).exists():
            return Response(
                {'error': 'You are not enrolled in this course'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Auto-mark completed if watched_seconds >= duration_seconds
        if lesson.duration_seconds and watched_seconds >= lesson.duration_seconds:
            completed = True
        
        # Get or create progress
        progress, created = StudentProgress.objects.get_or_create(
            student=student,
            lesson=lesson,
            defaults={
                'watched_seconds': watched_seconds,
                'completed': completed
            }
        )
        
        if not created:
            progress.watched_seconds = watched_seconds
            progress.completed = completed
            progress.save()
        
        # Check if all lessons in the course are completed
        course = lesson.section.course
        all_lessons = Lesson.objects.filter(section__course=course)
        total_lessons = all_lessons.count()
        
        if total_lessons > 0:
            completed_lessons = StudentProgress.objects.filter(
                student=student,
                lesson__section__course=course,
                completed=True
            ).count()
            
            # Update enrollment completion status
            enrollment = Enrollment.objects.get(student=student, course=course)
            was_completed = enrollment.completed
            if completed_lessons >= total_lessons:
                enrollment.completed = True
                # Issue certificate if course is completed for the first time
                if not was_completed:
                    from lms.utils.certificate_utils import issue_certificate
                    issue_certificate(student, course)
            else:
                enrollment.completed = False
            enrollment.save()
        
        serializer = StudentProgressSerializer(progress)
        return Response(serializer.data, status=status.HTTP_200_OK)



