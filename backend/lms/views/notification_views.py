from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, NotFound
from lms.models import Notification, Student
from lms.permissions import IsStudent
from lms.views.student_views import get_current_student
from lms.serializers.notification_serializer import (
    NotificationSerializer, MarkNotificationReadSerializer
)


class StudentNotificationsListView(APIView):
    """
    GET /api/student/notifications/
    Returns list of notifications for the current student.
    """
    permission_classes = [IsStudent]

    def get(self, request):
        student = get_current_student(request)
        if not student:
            raise PermissionDenied("Student not found")

        # Get all notifications for this student, sorted by newest first
        notifications = Notification.objects.filter(
            student=student
        ).select_related('course').order_by('-created_at')

        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MarkNotificationReadView(APIView):
    """
    POST /api/student/notifications/mark_read/
    Mark a notification as read.
    """
    permission_classes = [IsStudent]

    def post(self, request):
        student = get_current_student(request)
        if not student:
            raise PermissionDenied("Student not found")

        serializer = MarkNotificationReadSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        notification_id = serializer.validated_data['id']

        try:
            notification = Notification.objects.get(id=notification_id, student=student)
        except Notification.DoesNotExist:
            return Response(
                {'error': 'Notification not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        notification.is_read = True
        notification.save()

        return Response({
            'success': True,
            'message': 'Notification marked as read'
        }, status=status.HTTP_200_OK)


class StudentNotificationUnreadCountView(APIView):
    """
    GET /api/student/notifications/unread_count/
    Returns total unread notification count for the student.
    """
    permission_classes = [IsStudent]

    def get(self, request):
        student = get_current_student(request)
        if not student:
            raise PermissionDenied("Student not found")

        unread_total = Notification.objects.filter(
            student=student,
            is_read=False
        ).count()

        return Response({
            'unread_total': unread_total
        }, status=status.HTTP_200_OK)

