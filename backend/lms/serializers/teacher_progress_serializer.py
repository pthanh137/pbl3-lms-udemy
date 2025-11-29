from rest_framework import serializers
from lms.models import (
    Student, StudentProgress, StudentCourseProgress, Lesson, Course, Enrollment
)
from django.db.models import Avg, Count, Q
from django.utils import timezone
from datetime import timedelta


class TeacherStudentProgressSerializer(serializers.ModelSerializer):
    """Serializer for student progress in a course (for teacher views)"""
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    student_email = serializers.CharField(source='student.email', read_only=True)
    student_id = serializers.IntegerField(source='student.id', read_only=True)
    
    class Meta:
        model = StudentCourseProgress
        fields = [
            'id', 'student_id', 'student_name', 'student_email',
            'overall_progress', 'last_access', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'overall_progress', 'last_access', 'created_at', 'updated_at']


class ChapterProgressDetailSerializer(serializers.Serializer):
    """Serializer for chapter/lesson progress detail"""
    lesson_id = serializers.IntegerField()
    lesson_title = serializers.CharField()
    section_title = serializers.CharField()
    section_order = serializers.IntegerField()
    lesson_order = serializers.IntegerField()
    duration_seconds = serializers.IntegerField(allow_null=True)
    watched_seconds = serializers.IntegerField()
    progress_percent = serializers.FloatField()
    completed = serializers.BooleanField()
    last_watched = serializers.DateTimeField(allow_null=True)
    status = serializers.CharField()  # 'completed', 'in_progress', 'not_started'


class StudentDetailProgressSerializer(serializers.Serializer):
    """Serializer for student detail page"""
    student_id = serializers.IntegerField()
    student_name = serializers.CharField()
    student_email = serializers.CharField()
    course_id = serializers.IntegerField()
    course_title = serializers.CharField()
    overall_progress = serializers.FloatField()
    last_access = serializers.DateTimeField()
    enrolled_at = serializers.DateTimeField()
    chapters = ChapterProgressDetailSerializer(many=True)


class CourseAnalyticsSerializer(serializers.Serializer):
    """Serializer for course analytics"""
    course_id = serializers.IntegerField()
    course_title = serializers.CharField()
    total_students = serializers.IntegerField()
    avg_course_progress = serializers.FloatField()
    active_students_count = serializers.IntegerField(help_text="Active in last 7 days")
    inactive_students_count = serializers.IntegerField(help_text="Inactive for 7+ days")
    students_by_progress = TeacherStudentProgressSerializer(many=True)
    progress_distribution = serializers.DictField(
        help_text="Distribution: 0-25%, 25-50%, 50-75%, 75-100%"
    )

