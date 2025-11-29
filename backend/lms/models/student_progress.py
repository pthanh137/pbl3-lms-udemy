from django.db import models
from .student import Student
from .lesson import Lesson


class StudentProgress(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='progress')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='student_progress')
    watched_seconds = models.IntegerField(default=0)
    completed = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.student.full_name} - {self.lesson.title} ({self.watched_seconds}s)"

    class Meta:
        verbose_name = 'Student Progress'
        verbose_name_plural = 'Student Progress'
        unique_together = ['student', 'lesson']
        ordering = ['-updated_at']


