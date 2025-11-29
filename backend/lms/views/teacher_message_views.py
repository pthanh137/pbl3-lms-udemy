from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, NotFound
from django.db.models import Q, Count
from django.contrib.contenttypes.models import ContentType
from lms.models import (
    Conversation, Message, Teacher, Student, Course, Enrollment
)
from lms.permissions import IsTeacher
from lms.views.teacher_views import get_current_teacher
from lms.serializers.message_serializer import ConversationSerializer


class TeacherUnreadCountView(APIView):
    """
    GET /api/teacher/messages/unread_count/
    Returns total unread message count for the teacher.
    """
    permission_classes = [IsTeacher]

    def get(self, request):
        teacher = get_current_teacher(request)
        if not teacher:
            raise PermissionDenied("Teacher not found")

        # Get all conversations where teacher is a participant
        conversations = Conversation.objects.filter(
            participants_teachers=teacher
        ).distinct()

        # Count unread messages in these conversations
        # Unread = messages where sender is not the teacher and is_read=False
        teacher_content_type = ContentType.objects.get_for_model(Teacher)
        total_unread = Message.objects.filter(
            conversation__in=conversations,
            is_read=False
        ).exclude(
            sender_content_type=teacher_content_type,
            sender_object_id=teacher.id
        ).count()

        return Response({
            'unread_total': total_unread
        }, status=status.HTTP_200_OK)


class TeacherEnrolledStudentsView(APIView):
    """
    GET /api/teacher/messages/enrolled-students/
    Returns list of students enrolled in teacher's courses.
    """
    permission_classes = [IsTeacher]

    def get(self, request):
        teacher = get_current_teacher(request)
        if not teacher:
            raise PermissionDenied("Teacher not found")

        # Get all courses owned by teacher
        courses = Course.objects.filter(teacher=teacher)
        
        if not courses.exists():
            return Response([], status=status.HTTP_200_OK)
        
        # Get all unique students enrolled in teacher's courses
        enrollments = Enrollment.objects.filter(
            course__in=courses
        ).select_related('student', 'course')

        # Use a dictionary to track unique students
        students_dict = {}
        
        for enrollment in enrollments:
            student = enrollment.student
            if student.id not in students_dict:
                students_dict[student.id] = {
                    'id': student.id,
                    'name': student.full_name or student.email or f'Student {student.id}',
                    'email': student.email,
                    'courses': []
                }
            # Add course to student's course list
            students_dict[student.id]['courses'].append({
                'id': enrollment.course.id,
                'title': enrollment.course.title
            })
        
        # Convert dict to list
        students_data = list(students_dict.values())

        return Response(students_data, status=status.HTTP_200_OK)

