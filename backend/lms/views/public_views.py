from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from django.db.models import Count, Q
from lms.models import Category, Course, Teacher
from lms.serializers import CategorySerializer, CourseSerializer
from lms.serializers.teacher_public_serializer import TeacherPublicSerializer


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public read-only viewset for categories.
    GET /api/categories/ - list all categories
    GET /api/categories/<id>/ - retrieve a category
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public read-only viewset for courses.
    GET /api/courses/ - list all courses (basic info)
    GET /api/courses/<id>/ - retrieve course with full nested structure
    GET /api/courses/<id>/content/ - get full nested content
    """
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [AllowAny]
    
    def list(self, request, *args, **kwargs):
        """
        List courses with basic info (no heavy nesting).
        """
        queryset = self.filter_queryset(self.get_queryset())
        
        # Use a simplified serializer for list view
        # We'll use the full serializer but the nested fields are read-only anyway
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve a single course with full nested structure.
        """
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'], url_path='content')
    def content(self, request, pk=None):
        """
        Get full nested content structure for a course.
        GET /api/courses/<id>/content/
        """
        course = self.get_object()
        serializer = self.get_serializer(course)
        return Response(serializer.data)


class TeacherPublicViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public read-only viewset for teachers.
    GET /api/public/teachers/ - list all teachers with stats
    GET /api/public/teachers/<id>/ - retrieve a teacher
    """
    queryset = Teacher.objects.all()
    serializer_class = TeacherPublicSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        """
        Return teachers ordered by total students (most popular first)
        Only return teachers who have at least 1 course
        """
        queryset = Teacher.objects.annotate(
            course_count=Count('courses', distinct=True)
        ).filter(course_count__gt=0)  # Only teachers with at least 1 course
        
        # Order by popularity (can be customized)
        ordering = self.request.query_params.get('ordering', '-course_count')
        if ordering:
            queryset = queryset.order_by(ordering)
        
        return queryset



