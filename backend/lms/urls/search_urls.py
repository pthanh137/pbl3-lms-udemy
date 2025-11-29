from django.urls import path
from lms.views.search_views import (
    SearchCoursesView,
    RecommendCoursesView
)

urlpatterns = [
    path('', SearchCoursesView.as_view(), name='search-courses'),
]


