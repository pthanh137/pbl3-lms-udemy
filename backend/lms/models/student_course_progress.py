from django.db import models
from django.utils import timezone
from .student import Student
from .course import Course


class StudentCourseProgress(models.Model):
    """
    Tracks overall course progress for each student.
    Automatically updated when lesson progress changes.
    """
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='course_progress')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='student_progress')
    overall_progress = models.FloatField(default=0.0, help_text="Overall progress percentage (0-100)")
    last_access = models.DateTimeField(auto_now=True, help_text="Last time student accessed this course")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.student.full_name} - {self.course.title} ({self.overall_progress:.1f}%)"

    class Meta:
        verbose_name = 'Student Course Progress'
        verbose_name_plural = 'Student Course Progress'
        unique_together = ['student', 'course']
        ordering = ['-last_access']
        indexes = [
            models.Index(fields=['course', 'overall_progress']),
            models.Index(fields=['student', 'course']),
        ]

