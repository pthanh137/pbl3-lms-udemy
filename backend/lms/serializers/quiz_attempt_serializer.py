from rest_framework import serializers
from lms.models import QuizAttempt


class QuizAttemptSerializer(serializers.ModelSerializer):
    student = serializers.PrimaryKeyRelatedField(read_only=True)
    quiz_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = QuizAttempt
        fields = ['id', 'student', 'quiz', 'quiz_id', 'score', 'passed', 'created_at']
        read_only_fields = ['id', 'student', 'created_at']

    def create(self, validated_data):
        quiz_id = validated_data.pop('quiz_id', None)
        
        if quiz_id:
            validated_data['quiz_id'] = quiz_id
            
        return super().create(validated_data)

    def update(self, instance, validated_data):
        quiz_id = validated_data.pop('quiz_id', None)
        
        if quiz_id:
            validated_data['quiz_id'] = quiz_id
            
        return super().update(instance, validated_data)




