from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, ValidationError, PermissionDenied
from django.db import transaction
from lms.models import Review, Course, Enrollment, Student
from lms.serializers.review_serializer import ReviewSerializer, ReviewCreateSerializer
from lms.permissions import IsStudent


def get_current_student(request):
    """
    Helper function to get the current student from the request.
    """
    if hasattr(request, 'auth') and request.auth:
        student_id = request.auth.get('student_id')
        if student_id:
            try:
                return Student.objects.get(id=student_id)
            except Student.DoesNotExist:
                pass
        
        email = request.auth.get('email')
        if email:
            try:
                return Student.objects.get(email=email)
            except Student.DoesNotExist:
                pass
    
    return None


class AddReviewView(APIView):
    """
    Add or update a review for a course.
    POST /api/reviews/add/
    Body: { "course_id": 1, "rating": 5, "comment": "Great course!" }
    """
    permission_classes = [IsStudent]

    @transaction.atomic
    def post(self, request):
        student = get_current_student(request)
        if not student:
            return Response(
                {'error': 'Student not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ReviewCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        course_id = serializer.validated_data['course_id']
        rating = serializer.validated_data['rating']
        comment = serializer.validated_data.get('comment', '')

        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response(
                {'error': 'Course not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if student is enrolled
        if not Enrollment.objects.filter(student=student, course=course).exists():
            return Response(
                {'error': 'You must be enrolled in this course to leave a review'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get or create review
        review, created = Review.objects.get_or_create(
            course=course,
            student=student,
            defaults={
                'rating': rating,
                'comment': comment
            }
        )

        # If review exists, update it
        if not created:
            review.rating = rating
            review.comment = comment
            review.save()

        # Update course rating stats
        course.update_rating_stats()

        # Return review data
        review_serializer = ReviewSerializer(review)
        return Response({
            'message': 'Review added successfully' if created else 'Review updated successfully',
            'review': review_serializer.data
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class CourseReviewsView(APIView):
    """
    Get all reviews for a course.
    GET /api/reviews/course/<course_id>/
    """
    permission_classes = []  # Public endpoint

    def get(self, request, course_id):
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response(
                {'error': 'Course not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        reviews = Review.objects.filter(course=course).select_related('student')
        serializer = ReviewSerializer(reviews, many=True)
        
        return Response({
            'course_id': course.id,
            'course_title': course.title,
            'average_rating': course.average_rating,
            'total_reviews': course.total_reviews,
            'reviews': serializer.data
        }, status=status.HTTP_200_OK)


class MyReviewView(APIView):
    """
    Get current student's review for a course.
    GET /api/reviews/my/<course_id>/
    """
    permission_classes = [IsStudent]

    def get(self, request, course_id):
        student = get_current_student(request)
        if not student:
            return Response(
                {'error': 'Student not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response(
                {'error': 'Course not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            review = Review.objects.get(course=course, student=student)
            serializer = ReviewSerializer(review)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Review.DoesNotExist:
            return Response(
                {'message': 'No review found'},
                status=status.HTTP_404_NOT_FOUND
            )


class DeleteReviewView(APIView):
    """
    Delete current student's review for a course.
    DELETE /api/reviews/delete/<course_id>/
    """
    permission_classes = [IsStudent]

    @transaction.atomic
    def delete(self, request, course_id):
        student = get_current_student(request)
        if not student:
            return Response(
                {'error': 'Student not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response(
                {'error': 'Course not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            review = Review.objects.get(course=course, student=student)
            review.delete()
            
            # Update course rating stats
            course.update_rating_stats()
            
            return Response(
                {'message': 'Review deleted successfully'},
                status=status.HTTP_200_OK
            )
        except Review.DoesNotExist:
            return Response(
                {'error': 'Review not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class RatingSummaryView(APIView):
    """
    Get rating summary for a course.
    GET /api/reviews/course/<course_id>/rating_summary/
    """
    permission_classes = []  # Public endpoint

    def get(self, request, course_id):
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response(
                {'error': 'Course not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Calculate star distribution
        reviews = Review.objects.filter(course=course)
        star_counts = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0}
        
        for review in reviews:
            if review.rating in star_counts:
                star_counts[review.rating] += 1

        return Response({
            'average': course.average_rating or 0,
            'total_reviews': course.total_reviews or 0,
            'stars': star_counts
        }, status=status.HTTP_200_OK)


class HighlightReviewsView(APIView):
    """
    Get highlighted reviews for homepage.
    GET /api/reviews/highlight/
    """
    permission_classes = []  # Public endpoint

    def get(self, request):
        # First try to get 4+ star reviews
        reviews = Review.objects.select_related('course', 'student').filter(
            rating__gte=4
        ).order_by('-rating', '-created_at')[:6]
        
        # If not enough 4+ star reviews, get latest reviews regardless of rating
        if reviews.count() < 6:
            all_reviews = Review.objects.select_related('course', 'student').order_by('-created_at')[:6]
            # Combine and deduplicate
            review_ids = list(reviews.values_list('id', flat=True))
            additional_reviews = all_reviews.exclude(id__in=review_ids)[:6 - reviews.count()]
            reviews = list(reviews) + list(additional_reviews)

        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

