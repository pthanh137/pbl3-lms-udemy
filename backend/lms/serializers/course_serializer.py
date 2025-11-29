from rest_framework import serializers
from lms.models import Course, Teacher, Category
from .teacher_serializer import TeacherSerializer
from .category_serializer import CategorySerializer
from .section_serializer import SectionSerializer
from .quiz_serializer import QuizSerializer


class CourseSerializer(serializers.ModelSerializer):
    teacher = TeacherSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    sections = SectionSerializer(many=True, read_only=True)
    quizzes = QuizSerializer(many=True, read_only=True)
    teacher_id = serializers.PrimaryKeyRelatedField(
        queryset=Teacher.objects.all(),
        source='teacher',
        write_only=True,
        required=False
    )
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True,
        required=False
    )

    class Meta:
        model = Course
        fields = ['id', 'teacher', 'teacher_id', 'category', 'category_id', 
                  'title', 'description', 'featured_img', 'level', 'price', 
                  'discount_price', 'language', 'views', 'average_rating', 
                  'total_reviews', 'total_enrollments', 'created_at', 'sections', 'quizzes']
        read_only_fields = ['id', 'teacher', 'category', 'views', 'average_rating', 
                           'total_reviews', 'total_enrollments', 'created_at', 'sections', 'quizzes']

