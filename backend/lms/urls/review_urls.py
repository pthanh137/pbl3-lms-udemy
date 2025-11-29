from django.urls import path
from lms.views.review_views import (
    AddReviewView,
    CourseReviewsView,
    MyReviewView,
    DeleteReviewView
)

urlpatterns = [
    path('add/', AddReviewView.as_view(), name='add-review'),
    path('course/<int:course_id>/', CourseReviewsView.as_view(), name='course-reviews'),
    path('my/<int:course_id>/', MyReviewView.as_view(), name='my-review'),
    path('delete/<int:course_id>/', DeleteReviewView.as_view(), name='delete-review'),
]

