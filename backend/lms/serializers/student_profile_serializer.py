from rest_framework import serializers
from lms.models import Student


class StudentProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for student profile (no password field).
    Used for GET and PUT/PATCH operations.
    """
    class Meta:
        model = Student
        fields = ['id', 'full_name', 'email', 'mobile_no', 'profile_img', 'bio', 'created_at']
        read_only_fields = ['id', 'created_at', 'email']  # Email should not be changed


class StudentChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for changing student password.
    """
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, min_length=6)

    def validate_new_password(self, value):
        if len(value) < 6:
            raise serializers.ValidationError("Mật khẩu mới phải có ít nhất 6 ký tự.")
        return value

