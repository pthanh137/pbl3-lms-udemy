from rest_framework import serializers
from lms.models import Order, Course


class OrderSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    course_id = serializers.IntegerField(source='course.id', read_only=True)
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'student', 'course', 'course_id', 'course_title', 
            'student_name', 'amount', 'payment_status', 'payment_method',
            'transaction_id', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CreateOrderSerializer(serializers.Serializer):
    course_id = serializers.IntegerField(required=True)
    
    def validate_course_id(self, value):
        try:
            Course.objects.get(id=value)
        except Course.DoesNotExist:
            raise serializers.ValidationError("Course not found.")
        return value


class FakeConfirmSerializer(serializers.Serializer):
    order_id = serializers.IntegerField(required=True)


