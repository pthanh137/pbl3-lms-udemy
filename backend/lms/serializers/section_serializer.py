from rest_framework import serializers
from lms.models import Section
from .lesson_serializer import LessonSerializer


class SectionSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)

    class Meta:
        model = Section
        fields = ['id', 'title', 'order', 'lessons']
        read_only_fields = ['id', 'lessons']



