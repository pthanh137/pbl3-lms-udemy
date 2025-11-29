from rest_framework import serializers
from lms.models import Teacher
from django.db.models import Count, Avg, Q, Sum
from lms.models import Course, Enrollment, Review


class TeacherPublicSerializer(serializers.ModelSerializer):
    """
    Public serializer for teacher list with statistics.
    Excludes password and includes computed stats.
    """
    total_courses = serializers.SerializerMethodField()
    total_students = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()

    class Meta:
        model = Teacher
        fields = [
            'id',
            'full_name',
            'email',
            'bio',
            'qualification',
            'skills',
            'profile_img',
            'total_courses',
            'total_students',
            'average_rating',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def get_total_courses(self, obj):
        """Get total number of courses by this teacher"""
        # Use prefetch_related if available, otherwise count
        if hasattr(obj, '_prefetched_objects_cache') and 'courses' in obj._prefetched_objects_cache:
            return len(obj._prefetched_objects_cache['courses'])
        return Course.objects.filter(teacher=obj).count()

    def get_total_students(self, obj):
        """Get total unique students enrolled in teacher's courses"""
        return Enrollment.objects.filter(
            course__teacher=obj
        ).values('student').distinct().count()

    def get_average_rating(self, obj):
        """Get average rating from all courses by this teacher"""
        courses = Course.objects.filter(teacher=obj)
        if not courses.exists():
            return 0.0
        
        # Calculate weighted average rating across all courses
        total_weighted_rating = 0.0
        total_reviews = 0
        
        for course in courses:
            if course.average_rating > 0 and course.total_reviews > 0:
                total_weighted_rating += course.average_rating * course.total_reviews
                total_reviews += course.total_reviews
        
        if total_reviews == 0:
            return 0.0
        
        avg = total_weighted_rating / total_reviews
        return round(avg, 1)

