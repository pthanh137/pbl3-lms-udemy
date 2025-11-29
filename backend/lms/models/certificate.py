from django.db import models
from django.utils import timezone
from .student import Student
from .course import Course
from .teacher import Teacher


class Certificate(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='certificates')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='certificates')
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='issued_certificates')
    code = models.CharField(max_length=100, unique=True)
    issued_at = models.DateTimeField(auto_now_add=True)
    is_valid = models.BooleanField(default=True)

    def __str__(self):
        return f"Certificate {self.code} - {self.student.full_name} - {self.course.title}"

    @classmethod
    def generate_code(cls, course, student):
        """
        Generate unique certificate code.
        Format: CERT-{COURSE_ID}-{STUDENT_ID}-{YYYYMMDD}
        """
        date_str = timezone.now().strftime('%Y%m%d')
        code = f"CERT-{course.id}-{student.id}-{date_str}"
        return code

    class Meta:
        verbose_name = 'Certificate'
        verbose_name_plural = 'Certificates'
        unique_together = ['student', 'course']
        ordering = ['-issued_at']


