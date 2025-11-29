from rest_framework import serializers
from lms.models import Review, Course, Enrollment


class ReviewSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    student_id = serializers.IntegerField(source='student.id', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    
    class Meta:
        model = Review
        fields = [
            'id', 'course', 'student', 'student_id', 'student_name',
            'rating', 'comment', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ReviewCreateSerializer(serializers.Serializer):
    course_id = serializers.IntegerField(required=True)
    rating = serializers.IntegerField(required=True)
    comment = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value

    def validate_course_id(self, value):
        try:
            Course.objects.get(id=value)
        except Course.DoesNotExist:
            raise serializers.ValidationError("Course not found.")
        return value

