from rest_framework import serializers
from lms.models import Question
from .option_serializer import OptionSerializer


class QuestionSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'question_text', 'order', 'options']
        read_only_fields = ['id', 'options']



