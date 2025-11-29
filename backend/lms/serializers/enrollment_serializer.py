from rest_framework import serializers
from lms.models import Enrollment


class EnrollmentSerializer(serializers.ModelSerializer):
    student = serializers.PrimaryKeyRelatedField(read_only=True)
    course = serializers.PrimaryKeyRelatedField(read_only=True)
    student_id = serializers.IntegerField(write_only=True, required=False)
    course_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Enrollment
        fields = ['id', 'student', 'student_id', 'course', 'course_id', 'enrolled_at', 'completed']
        read_only_fields = ['id', 'student', 'course', 'enrolled_at', 'completed']

    def create(self, validated_data):
        student_id = validated_data.pop('student_id', None)
        course_id = validated_data.pop('course_id', None)
        
        if student_id:
            validated_data['student_id'] = student_id
        if course_id:
            validated_data['course_id'] = course_id
            
        return super().create(validated_data)



