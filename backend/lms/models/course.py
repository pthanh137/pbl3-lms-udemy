from django.db import models
from .teacher import Teacher
from .category import Category


class Course(models.Model):
    LEVEL_CHOICES = [
        ('Beginner', 'Beginner'),
        ('Intermediate', 'Intermediate'),
        ('Advanced', 'Advanced'),
    ]

    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='courses')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='courses')
    title = models.CharField(max_length=200)
    description = models.TextField()
    featured_img = models.ImageField(upload_to='courses/', blank=True, null=True)
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='Beginner')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    language = models.CharField(max_length=100, blank=True, null=True)
    views = models.IntegerField(default=0)
    average_rating = models.FloatField(default=0.0)
    total_reviews = models.IntegerField(default=0)
    total_enrollments = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    def update_rating_stats(self):
        """Update average_rating and total_reviews based on reviews"""
        from django.db.models import Avg, Count
        stats = self.reviews.aggregate(
            avg_rating=Avg('rating'),
            total=Count('id')
        )
        self.average_rating = stats['avg_rating'] or 0.0
        self.total_reviews = stats['total'] or 0
        self.save(update_fields=['average_rating', 'total_reviews'])

    class Meta:
        verbose_name = 'Course'
        verbose_name_plural = 'Courses'
        ordering = ['-created_at']



