from django.db import models
from .student import Student
from .course import Course


class Notification(models.Model):
    """
    Notification model for students.
    Used for course announcements and other notifications.
    Separate from the Message/Conversation system.
    """
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='notifications',
        help_text="Course related to this notification (null for general notifications)"
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['student', 'is_read', '-created_at']),
        ]

    def __str__(self):
        return f"Notification for {self.student.full_name}: {self.title}"

