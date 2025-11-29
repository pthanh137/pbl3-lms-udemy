from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.generics import ListAPIView, RetrieveAPIView
from lms.models import Certificate, Student
from lms.serializers.certificate_serializer import (
    CertificateSerializer,
    CertificateDetailSerializer
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


class StudentCertificateListView(APIView):
    """
    Get list of certificates for the current student.
    GET /api/student/certificates/
    """
    permission_classes = [IsStudent]

    def get(self, request):
        student = get_current_student(request)
        if not student:
            return Response(
                {'error': 'Student not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        certificates = Certificate.objects.filter(
            student=student,
            is_valid=True
        ).select_related('course', 'teacher').order_by('-issued_at')

        serializer = CertificateSerializer(certificates, many=True)
        return Response({
            'results': serializer.data,
            'count': len(serializer.data)
        }, status=status.HTTP_200_OK)


class StudentCertificateDetailView(APIView):
    """
    Get certificate detail by ID.
    GET /api/student/certificates/<int:pk>/
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
            certificate = Certificate.objects.select_related(
                'student', 'course', 'teacher'
            ).get(id=pk, is_valid=True)
        except Certificate.DoesNotExist:
            return Response(
                {'error': 'Certificate not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if certificate belongs to current student
        if certificate.student != student:
            return Response(
                {'error': 'You do not have permission to view this certificate'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = CertificateDetailSerializer(certificate)
        return Response(serializer.data, status=status.HTTP_200_OK)


