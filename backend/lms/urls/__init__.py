from django.urls import path, include
from rest_framework.routers import DefaultRouter
from lms.views import (
    public_views,
    teacher_views,
    student_views,
    auth_views
)
from lms.views.auth_views import CustomTokenRefreshView
from lms.views.search_views import RecommendCoursesView

# Create router for ViewSets
router = DefaultRouter()

# Public ViewSets
router.register(r'categories', public_views.CategoryViewSet, basename='category')
router.register(r'courses', public_views.CourseViewSet, basename='course')
router.register(r'public/teachers', public_views.TeacherPublicViewSet, basename='public-teacher')

# Teacher ViewSets
router.register(r'teacher/courses', teacher_views.TeacherCourseViewSet, basename='teacher-course')
router.register(r'teacher/sections', teacher_views.SectionViewSet, basename='teacher-section')
router.register(r'teacher/lessons', teacher_views.LessonViewSet, basename='teacher-lesson')
router.register(r'teacher/quizzes', teacher_views.QuizViewSet, basename='teacher-quiz')
router.register(r'teacher/questions', teacher_views.QuestionViewSet, basename='teacher-question')
router.register(r'teacher/options', teacher_views.OptionViewSet, basename='teacher-option')

# URL patterns
urlpatterns = [
    # Router URLs (ViewSets)
    path('', include(router.urls)),
    
    # Authentication endpoints
    path('auth/student/register/', auth_views.StudentRegisterAPIView, name='student-register'),
    path('auth/student/login/', auth_views.StudentLoginAPIView, name='student-login'),
    path('auth/teacher/register/', auth_views.TeacherRegisterAPIView, name='teacher-register'),
    path('auth/teacher/login/', auth_views.TeacherLoginAPIView, name='teacher-login'),
    path('auth/token/refresh/', CustomTokenRefreshView.as_view(), name='token-refresh'),
    
    # Teacher endpoints
    path('teacher/profile/', teacher_views.TeacherProfileView, name='teacher-profile'),
    path('teacher/change-password/', teacher_views.TeacherChangePasswordView, name='teacher-change-password'),
    path('teacher/analytics/', include('lms.urls.analytics_urls')),
    
    # Student endpoints
    path('student/enroll/', student_views.EnrollmentView.as_view(), name='student-enroll'),
    path('student/courses/', student_views.EnrollmentView.as_view(), name='student-courses'),
    path('student/courses/<int:course_id>/content/', student_views.StudentCourseContentView.as_view(), name='student-course-content'),
    path('student/lesson-progress/', student_views.StudentLessonProgressView.as_view(), name='student-lesson-progress'),
    path('student/quiz/<int:quiz_id>/', student_views.StudentQuizDetailView.as_view(), name='student-quiz-detail'),
    path('student/quiz/<int:quiz_id>/submit/', student_views.StudentQuizSubmitView.as_view(), name='student-quiz-submit'),
    path('student/quiz/attempts/', student_views.StudentQuizAttemptsListView.as_view(), name='student-quiz-attempts'),
    path('student/certificates/', include('lms.urls.certificate_urls')),
    
    # Payment endpoints
    path('payment/', include('lms.urls.payment_urls')),
    
    # Review endpoints
    path('reviews/', include('lms.urls.review_urls')),
    
    # Search endpoints
    path('search/', include('lms.urls.search_urls')),
    path('courses/recommend/', RecommendCoursesView.as_view(), name='recommend-courses'),
]
