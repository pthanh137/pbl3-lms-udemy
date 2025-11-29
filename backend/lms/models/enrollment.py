from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from .student import Student
from .course import Course


class Enrollment(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    completed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.student.full_name} - {self.course.title}"

    class Meta:
        verbose_name = 'Enrollment'
        verbose_name_plural = 'Enrollments'
        unique_together = ['student', 'course']
        ordering = ['-enrolled_at']


@receiver(post_save, sender=Enrollment)
def update_course_enrollments(sender, instance, created, **kwargs):
    """Update course total_enrollments when enrollment is created"""
    if created:
        course = instance.course
        course.total_enrollments = Enrollment.objects.filter(course=course).count()
        course.save(update_fields=['total_enrollments'])



