from django.db import models
from django.contrib.auth.hashers import make_password


class Student(models.Model):
    full_name = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    mobile_no = models.CharField(max_length=20, blank=True, null=True)
    profile_img = models.ImageField(upload_to='students/', blank=True, null=True)
    bio = models.TextField(blank=True, null=True, help_text="Mô tả cá nhân")
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.password and not self.password.startswith('pbkdf2_'):
            self.password = make_password(self.password)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.full_name

    class Meta:
        verbose_name = 'Student'
        verbose_name_plural = 'Students'
        ordering = ['-created_at']




