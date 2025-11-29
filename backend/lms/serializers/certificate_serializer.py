from rest_framework import serializers
from lms.models import Certificate


class CertificateSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    student_email = serializers.CharField(source='student.email', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    teacher_name = serializers.CharField(source='teacher.full_name', read_only=True)

    class Meta:
        model = Certificate
        fields = [
            'id',
            'student',
            'student_name',
            'student_email',
            'course',
            'course_title',
            'teacher',
            'teacher_name',
            'code',
            'issued_at',
            'is_valid'
        ]
        read_only_fields = ['id', 'code', 'issued_at', 'is_valid']


class CertificateDetailSerializer(CertificateSerializer):
    """Extended serializer for certificate detail view"""
    course_description = serializers.CharField(source='course.description', read_only=True)
    course_level = serializers.CharField(source='course.level', read_only=True)

    class Meta(CertificateSerializer.Meta):
        fields = CertificateSerializer.Meta.fields + [
            'course_description',
            'course_level'
        ]

