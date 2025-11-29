from rest_framework import serializers
from lms.models import Category


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'title', 'description', 'created_at']
        read_only_fields = ['id', 'created_at']




