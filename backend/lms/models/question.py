from django.db import models
from .quiz import Quiz


class Question(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    order = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.quiz.title} - {self.question_text[:50]}..."

    class Meta:
        verbose_name = 'Question'
        verbose_name_plural = 'Questions'
        ordering = ['order', 'id']




