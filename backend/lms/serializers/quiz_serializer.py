from rest_framework import serializers
from lms.models import Quiz
from .question_serializer import QuestionSerializer


class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ['id', 'title', 'description', 'pass_mark', 'created_at', 'questions']
        read_only_fields = ['id', 'created_at', 'questions']



