from django.urls import path
from lms.views.analytics_views import (
    AnalyticsSummaryView,
    RevenueDailyView,
    EnrollmentsDailyView,
    CoursePerformanceView
)

urlpatterns = [
    path('summary/', AnalyticsSummaryView.as_view(), name='analytics-summary'),
    path('revenue-daily/', RevenueDailyView.as_view(), name='revenue-daily'),
    path('enrollments-daily/', EnrollmentsDailyView.as_view(), name='enrollments-daily'),
    path('course-performance/', CoursePerformanceView.as_view(), name='course-performance'),
]


