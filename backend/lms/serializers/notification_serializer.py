from rest_framework import serializers
from lms.models import Notification, Course


class CourseNotificationSerializer(serializers.ModelSerializer):
    """Minimal course info for notification"""
    class Meta:
        model = Course
        fields = ['id', 'title', 'featured_img']
        read_only_fields = ['id', 'title', 'featured_img']


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for Notification model"""
    course = CourseNotificationSerializer(read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id', 'student', 'course', 'title', 'message',
            'is_read', 'created_at'
        ]
        read_only_fields = ['id', 'student', 'created_at']


class MarkNotificationReadSerializer(serializers.Serializer):
    """Serializer for marking notification as read"""
    id = serializers.IntegerField(required=True)

