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
    Assumes JWT token contains student_id or email.
    """
    # Debug logging
    print(f"DEBUG get_current_student: request.auth = {getattr(request, 'auth', None)}")
    
    if hasattr(request, 'auth') and request.auth:
        # Try to get student_id from token
        student_id = request.auth.get('student_id')
        print(f"DEBUG: student_id from token = {student_id}")
        if student_id:
            try:
                student = Student.objects.get(id=student_id)
                print(f"DEBUG: Found student by ID: {student.id} - {student.email}")
                return student
            except Student.DoesNotExist:
                print(f"DEBUG: Student with ID {student_id} not found")
                pass
        
        # Try to get email from token
        email = request.auth.get('email')
        print(f"DEBUG: email from token = {email}")
        if email:
            try:
                student = Student.objects.get(email=email)
                print(f"DEBUG: Found student by email: {student.id} - {student.email}")
                return student
            except Student.DoesNotExist:
                print(f"DEBUG: Student with email {email} not found")
                pass
    
    # Fallback: try to get from user if available
    if hasattr(request, 'user') and request.user and request.user.is_authenticated:
        if hasattr(request.user, 'email'):
            try:
                student = Student.objects.get(email=request.user.email)
                print(f"DEBUG: Found student from request.user: {student.id} - {student.email}")
                return student
            except Student.DoesNotExist:
                pass
    
    print("DEBUG: No student found")
    return None


class CourseReviewCreateView(APIView):
    """
    Create or update a review for a course.
    POST /api/courses/<course_id>/review/
    Body: { "rating": 5, "comment": "Great course!" }
    """
    permission_classes = [IsStudent]

    @transaction.atomic
    def post(self, request, course_id):
        print(f"DEBUG CourseReviewCreateView: Starting post request for course {course_id}")
        print(f"DEBUG: request.auth = {getattr(request, 'auth', None)}")
        print(f"DEBUG: IsStudent permission check passed")
        
        student = get_current_student(request)
        if not student:
            # Log for debugging
            print(f"DEBUG: Student not found. request.auth: {getattr(request, 'auth', None)}")
            return Response(
                {'error': 'Student not found. Please make sure you are logged in as a student.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        print(f"DEBUG: Student found: {student.id} - {student.email}")

        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response(
                {'error': 'Course not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if student is enrolled
        enrollment_exists = Enrollment.objects.filter(student=student, course=course).exists()
        if not enrollment_exists:
            # Log for debugging
            print(f"DEBUG: Enrollment check failed. Student ID: {student.id}, Student Email: {student.email}, Course ID: {course_id}")
            all_enrollments = list(Enrollment.objects.filter(student=student).values_list('course_id', flat=True))
            print(f"DEBUG: All enrollments for student {student.id}: {all_enrollments}")
            print(f"DEBUG: Looking for course {course_id} in enrollments: {course_id in all_enrollments}")
            
            # Double check with course object
            enrollment_by_course = Enrollment.objects.filter(student=student, course__id=course_id).exists()
            print(f"DEBUG: Enrollment check by course object: {enrollment_by_course}")
            
            return Response(
                {'error': 'You must be enrolled in this course to leave a review'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Validate rating
        rating = request.data.get('rating')
        if not rating or not isinstance(rating, int) or rating < 1 or rating > 5:
            return Response(
                {'error': 'Rating must be between 1 and 5'},
                status=status.HTTP_400_BAD_REQUEST
            )

        comment = request.data.get('comment', '')

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


class CourseReviewsListView(APIView):
    """
    Get all reviews for a course.
    GET /api/courses/<course_id>/reviews/
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

        reviews = Review.objects.filter(course=course).select_related('student').order_by('-created_at')
        serializer = ReviewSerializer(reviews, many=True)
        
        return Response({
            'reviews': serializer.data
        }, status=status.HTTP_200_OK)


class CourseRatingSummaryView(APIView):
    """
    Get rating summary for a course.
    GET /api/courses/<course_id>/rating_summary/
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


