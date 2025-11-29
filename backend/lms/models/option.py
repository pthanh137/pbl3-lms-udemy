from django.db import models
from .question import Question


class Option(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')
    option_text = models.CharField(max_length=500)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.question.question_text[:30]}... - {self.option_text[:30]}..."

    class Meta:
        verbose_name = 'Option'
        verbose_name_plural = 'Options'
        ordering = ['id']



