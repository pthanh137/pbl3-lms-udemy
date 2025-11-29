from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, NotFound
from django.db.models import Avg, Count, Q, F
from django.utils import timezone
from datetime import timedelta
from lms.models import (
    Course, Student, StudentProgress, StudentCourseProgress, Lesson, Enrollment
)
from lms.permissions import IsTeacher
from lms.views.teacher_views import get_current_teacher
from lms.serializers.teacher_progress_serializer import (
    TeacherStudentProgressSerializer,
    StudentDetailProgressSerializer,
    ChapterProgressDetailSerializer,
    CourseAnalyticsSerializer
)


class CourseStudentsListView(APIView):
    """
    GET /api/teacher/courses/<course_id>/students/
    Returns list of students enrolled in the course with their overall progress.
    """
    permission_classes = [IsTeacher]

    def get(self, request, course_id):
        teacher = get_current_teacher(request)
        if not teacher:
            raise PermissionDenied("Teacher not found")

        try:
            course = Course.objects.get(id=course_id, teacher=teacher)
        except Course.DoesNotExist:
            raise NotFound("Course not found")

        # Get all enrollments for this course
        enrollments = Enrollment.objects.filter(course=course).select_related('student')

        # Get or create StudentCourseProgress for each enrolled student
        students_data = []
        for enrollment in enrollments:
            student = enrollment.student
            
            # Get or create course progress
            course_progress, _ = StudentCourseProgress.objects.get_or_create(
                student=student,
                course=course,
                defaults={'overall_progress': 0.0}
            )
            
            # Recalculate if needed (if progress is 0 and student has watched lessons)
            if course_progress.overall_progress == 0:
                self._recalculate_progress(student, course, course_progress)
            
            students_data.append(course_progress)

        # Serialize
        serializer = TeacherStudentProgressSerializer(students_data, many=True)
        
        # Add search/filter support
        search_query = request.query_params.get('search', '').strip()
        if search_query:
            filtered_data = [
                s for s in serializer.data
                if search_query.lower() in s['student_name'].lower() or
                   search_query.lower() in s['student_email'].lower()
            ]
            return Response(filtered_data, status=status.HTTP_200_OK)

        return Response(serializer.data, status=status.HTTP_200_OK)

    def _recalculate_progress(self, student, course, course_progress):
        """Recalculate overall progress for a student in a course"""
        all_lessons = Lesson.objects.filter(section__course=course)
        total_lessons = all_lessons.count()
        
        if total_lessons == 0:
            course_progress.overall_progress = 0
            course_progress.save()
            return

        lesson_progresses = []
        for lesson in all_lessons:
            try:
                lesson_progress = StudentProgress.objects.get(
                    student=student,
                    lesson=lesson
                )
                if lesson.duration_seconds and lesson.duration_seconds > 0:
                    progress_percent = min(100, (lesson_progress.watched_seconds / lesson.duration_seconds) * 100)
                else:
                    progress_percent = 100 if lesson_progress.completed else 0
            except StudentProgress.DoesNotExist:
                progress_percent = 0
            lesson_progresses.append(progress_percent)

        overall_progress = sum(lesson_progresses) / len(lesson_progresses) if lesson_progresses else 0
        course_progress.overall_progress = overall_progress
        course_progress.save()


class StudentDetailProgressView(APIView):
    """
    GET /api/teacher/courses/<course_id>/students/<student_id>/detail/
    Returns detailed progress for a specific student in a course.
    """
    permission_classes = [IsTeacher]

    def get(self, request, course_id, student_id):
        teacher = get_current_teacher(request)
        if not teacher:
            raise PermissionDenied("Teacher not found")

        try:
            course = Course.objects.get(id=course_id, teacher=teacher)
        except Course.DoesNotExist:
            raise NotFound("Course not found")

        try:
            student = Student.objects.get(id=student_id)
        except Student.DoesNotExist:
            raise NotFound("Student not found")

        # Check if student is enrolled
        try:
            enrollment = Enrollment.objects.get(student=student, course=course)
        except Enrollment.DoesNotExist:
            raise NotFound("Student is not enrolled in this course")

        # Get or create course progress
        course_progress, _ = StudentCourseProgress.objects.get_or_create(
            student=student,
            course=course,
            defaults={'overall_progress': 0.0}
        )

        # Get all lessons in the course with progress
        all_lessons = Lesson.objects.filter(
            section__course=course
        ).select_related('section').order_by('section__order', 'order')

        chapters_data = []
        for lesson in all_lessons:
            try:
                progress = StudentProgress.objects.get(student=student, lesson=lesson)
                watched_seconds = progress.watched_seconds
                completed = progress.completed
                last_watched = progress.updated_at
            except StudentProgress.DoesNotExist:
                watched_seconds = 0
                completed = False
                last_watched = None

            # Calculate progress percent
            if lesson.duration_seconds and lesson.duration_seconds > 0:
                progress_percent = min(100, (watched_seconds / lesson.duration_seconds) * 100)
            else:
                progress_percent = 100 if completed else 0

            # Determine status
            if completed or progress_percent >= 95:
                status = 'completed'
            elif progress_percent > 0:
                status = 'in_progress'
            else:
                status = 'not_started'

            chapters_data.append({
                'lesson_id': lesson.id,
                'lesson_title': lesson.title,
                'section_title': lesson.section.title,
                'section_order': lesson.section.order,
                'lesson_order': lesson.order,
                'duration_seconds': lesson.duration_seconds,
                'watched_seconds': watched_seconds,
                'progress_percent': round(progress_percent, 2),
                'completed': completed,
                'last_watched': last_watched,
                'status': status
            })

        # Recalculate overall progress
        if chapters_data:
            overall_progress = sum(c['progress_percent'] for c in chapters_data) / len(chapters_data)
            course_progress.overall_progress = overall_progress
            course_progress.save()

        result = {
            'student_id': student.id,
            'student_name': student.full_name,
            'student_email': student.email,
            'course_id': course.id,
            'course_title': course.title,
            'overall_progress': course_progress.overall_progress,
            'last_access': course_progress.last_access,
            'enrolled_at': enrollment.enrolled_at,
            'chapters': chapters_data
        }

        serializer = StudentDetailProgressSerializer(result)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CourseAnalyticsView(APIView):
    """
    GET /api/teacher/courses/<course_id>/analytics/
    Returns analytics summary for a course.
    """
    permission_classes = [IsTeacher]

    def get(self, request, course_id):
        teacher = get_current_teacher(request)
        if not teacher:
            raise PermissionDenied("Teacher not found")

        try:
            course = Course.objects.get(id=course_id, teacher=teacher)
        except Course.DoesNotExist:
            raise NotFound("Course not found")

        # Get all enrollments
        enrollments = Enrollment.objects.filter(course=course)
        total_students = enrollments.count()

        # Get all course progress records
        course_progresses = StudentCourseProgress.objects.filter(course=course)
        
        # Calculate average progress
        avg_progress = course_progresses.aggregate(
            avg=Avg('overall_progress')
        )['avg'] or 0.0

        # Calculate active/inactive students (last 7 days)
        seven_days_ago = timezone.now() - timedelta(days=7)
        active_students = course_progresses.filter(
            last_access__gte=seven_days_ago
        ).count()
        inactive_students = total_students - active_students

        # Get students sorted by progress (descending)
        students_by_progress = course_progresses.select_related('student').order_by('-overall_progress')
        students_serializer = TeacherStudentProgressSerializer(students_by_progress, many=True)

        # Calculate progress distribution
        distribution = {
            '0-25': course_progresses.filter(overall_progress__gte=0, overall_progress__lt=25).count(),
            '25-50': course_progresses.filter(overall_progress__gte=25, overall_progress__lt=50).count(),
            '50-75': course_progresses.filter(overall_progress__gte=50, overall_progress__lt=75).count(),
            '75-100': course_progresses.filter(overall_progress__gte=75, overall_progress__lte=100).count(),
        }

        result = {
            'course_id': course.id,
            'course_title': course.title,
            'total_students': total_students,
            'avg_course_progress': round(avg_progress, 2),
            'active_students_count': active_students,
            'inactive_students_count': inactive_students,
            'students_by_progress': students_serializer.data,
            'progress_distribution': distribution
        }

        serializer = CourseAnalyticsSerializer(result)
        return Response(serializer.data, status=status.HTTP_200_OK)

