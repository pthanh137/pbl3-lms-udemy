from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta
from lms.models import Teacher, Course, Enrollment
from lms.models.order import Order
from lms.permissions import IsTeacher


def get_current_teacher(request):
    """
    Helper function to get the current teacher from the request.
    """
    if hasattr(request, 'auth') and request.auth:
        teacher_id = request.auth.get('teacher_id')
        if teacher_id:
            try:
                return Teacher.objects.get(id=teacher_id)
            except Teacher.DoesNotExist:
                pass
        
        email = request.auth.get('email')
        if email:
            try:
                return Teacher.objects.get(email=email)
            except Teacher.DoesNotExist:
                pass
    
    return None


class AnalyticsSummaryView(APIView):
    """
    Get analytics summary for teacher.
    GET /api/teacher/analytics/summary/
    """
    permission_classes = [IsTeacher]

    def get(self, request):
        teacher = get_current_teacher(request)
        if not teacher:
            return Response(
                {'error': 'Teacher not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get teacher's courses
        courses = Course.objects.filter(teacher=teacher)
        
        # Total Revenue (from paid orders)
        total_revenue = Order.objects.filter(
            course__teacher=teacher,
            payment_status='paid'
        ).aggregate(total=Sum('amount'))['total'] or 0

        # Total Students (unique students enrolled in teacher's courses)
        total_students = Enrollment.objects.filter(
            course__teacher=teacher
        ).values('student').distinct().count()

        # Total Courses
        total_courses = courses.count()

        # Today Revenue
        today = timezone.now().date()
        today_revenue = Order.objects.filter(
            course__teacher=teacher,
            payment_status='paid',
            updated_at__date=today
        ).aggregate(total=Sum('amount'))['total'] or 0

        return Response({
            'total_revenue': float(total_revenue),
            'total_students': total_students,
            'total_courses': total_courses,
            'today_revenue': float(today_revenue)
        }, status=status.HTTP_200_OK)


class RevenueDailyView(APIView):
    """
    Get daily revenue for the last N days.
    GET /api/teacher/analytics/revenue-daily/?days=30
    """
    permission_classes = [IsTeacher]

    def get(self, request):
        teacher = get_current_teacher(request)
        if not teacher:
            return Response(
                {'error': 'Teacher not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        days = int(request.query_params.get('days', 30))
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days - 1)

        # Get daily revenue
        orders = Order.objects.filter(
            course__teacher=teacher,
            payment_status='paid',
            updated_at__date__gte=start_date,
            updated_at__date__lte=end_date
        ).extra(
            select={'day': 'DATE(updated_at)'}
        ).values('day').annotate(
            revenue=Sum('amount')
        ).order_by('day')

        # Create a complete date range
        daily_data = []
        current_date = start_date
        while current_date <= end_date:
            day_str = current_date.strftime('%Y-%m-%d')
            day_revenue = next(
                (item['revenue'] for item in orders if item['day'].strftime('%Y-%m-%d') == day_str),
                0
            )
            daily_data.append({
                'date': day_str,
                'revenue': float(day_revenue)
            })
            current_date += timedelta(days=1)

        return Response({
            'results': daily_data,
            'days': days
        }, status=status.HTTP_200_OK)


class EnrollmentsDailyView(APIView):
    """
    Get daily enrollments for the last N days.
    GET /api/teacher/analytics/enrollments-daily/?days=30
    """
    permission_classes = [IsTeacher]

    def get(self, request):
        teacher = get_current_teacher(request)
        if not teacher:
            return Response(
                {'error': 'Teacher not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        days = int(request.query_params.get('days', 30))
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days - 1)

        # Get daily enrollments
        enrollments = Enrollment.objects.filter(
            course__teacher=teacher,
            enrolled_at__date__gte=start_date,
            enrolled_at__date__lte=end_date
        ).extra(
            select={'day': 'DATE(enrolled_at)'}
        ).values('day').annotate(
            count=Count('id')
        ).order_by('day')

        # Create a complete date range
        daily_data = []
        current_date = start_date
        while current_date <= end_date:
            day_str = current_date.strftime('%Y-%m-%d')
            day_count = next(
                (item['count'] for item in enrollments if item['day'].strftime('%Y-%m-%d') == day_str),
                0
            )
            daily_data.append({
                'date': day_str,
                'count': day_count
            })
            current_date += timedelta(days=1)

        return Response({
            'results': daily_data,
            'days': days
        }, status=status.HTTP_200_OK)


class CoursePerformanceView(APIView):
    """
    Get performance data for each course.
    GET /api/teacher/analytics/course-performance/
    """
    permission_classes = [IsTeacher]

    def get(self, request):
        teacher = get_current_teacher(request)
        if not teacher:
            return Response(
                {'error': 'Teacher not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        courses = Course.objects.filter(teacher=teacher)
        
        performance_data = []
        for course in courses:
            # Course revenue
            revenue = Order.objects.filter(
                course=course,
                payment_status='paid'
            ).aggregate(total=Sum('amount'))['total'] or 0

            # Total enrollments
            enrollments = Enrollment.objects.filter(course=course).count()

            performance_data.append({
                'course_id': course.id,
                'course_title': course.title,
                'revenue': float(revenue),
                'total_enrollments': enrollments,
                'average_rating': course.average_rating,
                'total_reviews': course.total_reviews
            })

        # Sort by revenue descending
        performance_data.sort(key=lambda x: x['revenue'], reverse=True)

        return Response({
            'results': performance_data
        }, status=status.HTTP_200_OK)

