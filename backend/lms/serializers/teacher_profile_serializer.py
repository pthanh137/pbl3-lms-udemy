from rest_framework import serializers
from lms.models import Teacher


class TeacherProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for teacher profile (read and update, no password).
    """
    class Meta:
        model = Teacher
        fields = ['id', 'full_name', 'email', 'bio', 'qualification', 
                  'skills', 'profile_img', 'created_at']
        read_only_fields = ['id', 'email', 'created_at']  # Email cannot be changed


class TeacherChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for changing teacher password.
    """
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, min_length=6)
    confirm_password = serializers.CharField(required=True, write_only=True)

    def validate_new_password(self, value):
        if len(value) < 6:
            raise serializers.ValidationError("Password must be at least 6 characters long.")
        return value

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({
                'confirm_password': "New password and confirm password do not match."
            })
        return attrs

