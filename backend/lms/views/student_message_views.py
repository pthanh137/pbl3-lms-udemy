from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.db.models import Q
from django.contrib.contenttypes.models import ContentType
from lms.models import Conversation, Message, Teacher, Student
from lms.permissions import IsStudent
from lms.views.student_views import get_current_student


class StudentUnreadCountView(APIView):
    """
    GET /api/student/messages/unread_count/
    Returns total unread message count for the student.
    """
    permission_classes = [IsStudent]

    def get(self, request):
        student = get_current_student(request)
        if not student:
            raise PermissionDenied("Student not found")

        # Get all conversations where student is a participant
        conversations = Conversation.objects.filter(
            participants_students=student
        ).distinct()

        # Count unread messages in these conversations
        # Unread = messages where sender is not the student and is_read=False
        student_content_type = ContentType.objects.get_for_model(Student)
        total_unread = Message.objects.filter(
            conversation__in=conversations,
            is_read=False
        ).exclude(
            sender_content_type=student_content_type,
            sender_object_id=student.id
        ).count()

        return Response({
            'unread_total': total_unread
        }, status=status.HTTP_200_OK)

