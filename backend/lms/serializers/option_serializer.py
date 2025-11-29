from rest_framework import serializers
from lms.models import Option


class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ['id', 'option_text', 'is_correct']
        read_only_fields = ['id']




