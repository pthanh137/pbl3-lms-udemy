from django.contrib import admin
from .models import (
    Teacher, Student, Category, Course,
    Section, Lesson, Quiz, Question, Option,
    Enrollment, StudentProgress, StudentCourseProgress,
    Conversation, Message, Notification
)

admin.site.register(Teacher)
admin.site.register(Student)
admin.site.register(Category)
admin.site.register(Course)
admin.site.register(Section)
admin.site.register(Lesson)
admin.site.register(Quiz)
admin.site.register(Question)
admin.site.register(Option)
admin.site.register(Enrollment)
admin.site.register(StudentProgress)
admin.site.register(StudentCourseProgress)
admin.site.register(Conversation)
admin.site.register(Message)
admin.site.register(Notification)
