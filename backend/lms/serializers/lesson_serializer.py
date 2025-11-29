from rest_framework import serializers
from lms.models import Lesson


class LessonSerializer(serializers.ModelSerializer):
    section_id = serializers.IntegerField(source='section.id', read_only=True)
    section_title = serializers.CharField(source='section.title', read_only=True)
    section_order = serializers.IntegerField(source='section.order', read_only=True)
    course_id = serializers.IntegerField(source='section.course.id', read_only=True)
    course_title = serializers.CharField(source='section.course.title', read_only=True)
    
    # Video type properties
    is_youtube = serializers.BooleanField(read_only=True)
    youtube_video_id = serializers.CharField(read_only=True, allow_null=True)
    is_mp4 = serializers.BooleanField(read_only=True)
    
    # Nested section with course info (for detailed views)
    section = serializers.SerializerMethodField()
    
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'description', 'video_url', 'video_file', 'duration_seconds', 'order',
                  'section_id', 'section_title', 'section_order', 'course_id', 'course_title', 'section',
                  'is_youtube', 'youtube_video_id', 'is_mp4']
        read_only_fields = ['id', 'section_id', 'section_title', 'section_order', 'course_id', 'course_title', 'section',
                           'is_youtube', 'youtube_video_id', 'is_mp4']
    
    def get_section(self, obj):
        """Return section with course info"""
        if obj.section:
            return {
                'id': obj.section.id,
                'title': obj.section.title,
                'order': obj.section.order,
                'course': {
                    'id': obj.section.course.id,
                    'title': obj.section.course.title,
                } if obj.section.course else None
            }
        return None



