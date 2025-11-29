from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, ValidationError, PermissionDenied
from django.db import transaction
from lms.models import Order, Course, Enrollment, Student
from lms.serializers.order_serializer import (
    OrderSerializer, CreateOrderSerializer, FakeConfirmSerializer
)
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


class CreateOrderView(APIView):
    """
    Create a new order for a course.
    POST /api/payment/create-order/
    Body: { "course_id": 5 }
    """
    permission_classes = [IsStudent]

    def post(self, request):
        student = get_current_student(request)
        if not student:
            return Response(
                {'error': 'Student not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = CreateOrderSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        course_id = serializer.validated_data['course_id']

        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response(
                {'error': 'Course not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if student already enrolled
        if Enrollment.objects.filter(student=student, course=course).exists():
            return Response(
                {'error': 'You are already enrolled in this course'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if there's a pending order
        existing_order = Order.objects.filter(
            student=student,
            course=course,
            payment_status='pending'
        ).first()

        if existing_order:
            payment_url = f"http://localhost:3000/payment/fake/{existing_order.id}"
            return Response({
                'order_id': existing_order.id,
                'payment_url': payment_url,
                'message': 'Pending order found'
            }, status=status.HTTP_200_OK)

        # Calculate amount (use discount_price if available, otherwise price)
        amount = course.discount_price if course.discount_price else course.price

        # Create new order
        order = Order.objects.create(
            student=student,
            course=course,
            amount=amount,
            payment_status='pending',
            payment_method='mock'
        )

        payment_url = f"http://localhost:3000/payment/fake/{order.id}"

        return Response({
            'order_id': order.id,
            'payment_url': payment_url,
            'amount': str(amount),
            'course_title': course.title
        }, status=status.HTTP_201_CREATED)


class FakeConfirmPaymentView(APIView):
    """
    Confirm fake payment and create enrollment.
    POST /api/payment/fake-confirm/
    Body: { "order_id": 12 }
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

        serializer = FakeConfirmSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        order_id = serializer.validated_data['order_id']

        try:
            order = Order.objects.get(id=order_id)
        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if order belongs to current student
        if order.student != student:
            return Response(
                {'error': 'You do not have permission to confirm this order'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Check if order is already paid
        if order.payment_status == 'paid':
            return Response({
                'message': 'Order is already paid',
                'order_id': order.id,
                'status': 'paid'
            }, status=status.HTTP_200_OK)

        # Update order status
        order.payment_status = 'paid'
        order.transaction_id = f"MOCK_{order.id}_{order.created_at.timestamp()}"
        order.save()

        # Create enrollment if not exists
        enrollment, created = Enrollment.objects.get_or_create(
            student=student,
            course=order.course,
            defaults={'completed': False}
        )
        
        # Update course total_enrollments (signal will handle this, but we can also do it here)
        if created:
            order.course.total_enrollments = Enrollment.objects.filter(course=order.course).count()
            order.course.save(update_fields=['total_enrollments'])

        return Response({
            'message': 'Payment confirmed successfully',
            'order_id': order.id,
            'status': 'paid',
            'enrollment_created': created
        }, status=status.HTTP_200_OK)


class PaymentStatusView(APIView):
    """
    Get payment status of an order.
    GET /api/payment/status/<order_id>/
    """
    permission_classes = [IsStudent]

    def get(self, request, pk):
        student = get_current_student(request)
        if not student:
            return Response(
                {'error': 'Student not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            order = Order.objects.get(id=pk)
        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if order belongs to current student
        if order.student != student:
            return Response(
                {'error': 'You do not have permission to view this order'},
                status=status.HTTP_403_FORBIDDEN
            )

        return Response({
            'order_id': order.id,
            'status': order.payment_status,
            'amount': str(order.amount),
            'course_id': order.course.id,
            'course_title': order.course.title,
            'created_at': order.created_at
        }, status=status.HTTP_200_OK)

