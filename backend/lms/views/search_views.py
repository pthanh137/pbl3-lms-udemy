from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q, Count
from lms.models import Course, Category, Enrollment, Student
from lms.serializers.course_serializer import CourseSerializer


class CourseSearchPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 100


class SearchCoursesView(APIView):
    """
    Search courses with filters and sorting.
    GET /api/search/
    Query params:
    - q: search keyword
    - category: category ID
    - price: 'free' or 'paid'
    - level: 'Beginner', 'Intermediate', 'Advanced'
    - sort: 'newest', 'rating', 'popular', 'price_low', 'price_high'
    - page: page number
    """
    pagination_class = CourseSearchPagination

    def get(self, request):
        queryset = Course.objects.all().select_related('teacher', 'category').prefetch_related('enrollments')

        # Search keyword
        q = request.query_params.get('q', '').strip()
        if q:
            queryset = queryset.filter(
                Q(title__icontains=q) | Q(description__icontains=q)
            )

        # Category filter
        category_id = request.query_params.get('category')
        if category_id:
            try:
                queryset = queryset.filter(category_id=int(category_id))
            except ValueError:
                pass

        # Price filter
        price_filter = request.query_params.get('price')
        if price_filter == 'free':
            queryset = queryset.filter(price=0)
        elif price_filter == 'paid':
            queryset = queryset.filter(price__gt=0)

        # Level filter
        level = request.query_params.get('level')
        if level and level in ['Beginner', 'Intermediate', 'Advanced']:
            queryset = queryset.filter(level=level)

        # Sorting
        sort_by = request.query_params.get('sort', 'newest')
        if sort_by == 'newest':
            queryset = queryset.order_by('-created_at')
        elif sort_by == 'rating':
            queryset = queryset.order_by('-average_rating', '-total_reviews')
        elif sort_by == 'popular':
            queryset = queryset.order_by('-total_enrollments', '-views')
        elif sort_by == 'price_low':
            queryset = queryset.order_by('price')
        elif sort_by == 'price_high':
            queryset = queryset.order_by('-price')

        # Pagination
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)
        
        if page is not None:
            serializer = CourseSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = CourseSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class RecommendCoursesView(APIView):
    """
    Get recommended courses for the current user.
    GET /api/courses/recommend/
    """
    def get(self, request):
        student = None
        
        # Try to get current student if authenticated
        if hasattr(request, 'auth') and request.auth:
            student_id = request.auth.get('student_id')
            if student_id:
                try:
                    student = Student.objects.get(id=student_id)
                except Student.DoesNotExist:
                    pass

        if student:
            # Get student's enrolled courses
            enrolled_courses = Enrollment.objects.filter(student=student).values_list('course_id', flat=True)
            
            if enrolled_courses:
                # Get categories of enrolled courses
                enrolled_categories = Course.objects.filter(id__in=enrolled_courses).values_list('category_id', flat=True).distinct()
                
                # Recommend courses in same categories (exclude already enrolled)
                recommended = Course.objects.filter(
                    category_id__in=enrolled_categories
                ).exclude(
                    id__in=enrolled_courses
                ).order_by('-average_rating', '-total_enrollments')[:6]
            else:
                # No enrollments yet, recommend popular courses
                recommended = Course.objects.order_by('-total_enrollments', '-average_rating', '-views')[:6]
        else:
            # Not logged in or not a student, recommend popular courses
            recommended = Course.objects.order_by('-total_enrollments', '-average_rating', '-views')[:6]

        serializer = CourseSerializer(recommended, many=True)
        return Response({
            'results': serializer.data,
            'count': len(serializer.data)
        }, status=status.HTTP_200_OK)

