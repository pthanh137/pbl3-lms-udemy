from rest_framework import serializers
from lms.models import StudentProgress


class StudentProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProgress
        fields = ['id', 'student', 'lesson', 'watched_seconds', 'completed', 'updated_at']
        read_only_fields = ['id', 'student', 'updated_at']

