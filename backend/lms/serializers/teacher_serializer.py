from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from lms.models import Teacher


class TeacherSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=6)

    class Meta:
        model = Teacher
        fields = ['id', 'full_name', 'email', 'password', 'bio', 'qualification', 
                  'skills', 'profile_img', 'created_at']
        read_only_fields = ['id', 'created_at']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate_password(self, value):
        if len(value) < 6:
            raise serializers.ValidationError("Password must be at least 6 characters long.")
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data['password'] = make_password(password)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if 'password' in validated_data:
            password = validated_data.pop('password')
            validated_data['password'] = make_password(password)
        return super().update(instance, validated_data)




