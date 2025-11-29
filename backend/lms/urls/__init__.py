from django.urls import path, include
from rest_framework.routers import DefaultRouter
from lms.views import (
    public_views,
    teacher_views,
    student_views,
    auth_views,
    teacher_progress_views,
    message_views,
    teacher_message_views,
    student_message_views,
    notification_views
)
from lms.views.auth_views import CustomTokenRefreshView
from lms.views.search_views import RecommendCoursesView
from lms.views import course_review_views

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
    path('teacher/courses/<int:course_id>/students/', 
         teacher_progress_views.CourseStudentsListView.as_view(), 
         name='teacher-course-students'),
    path('teacher/courses/<int:course_id>/students/<int:student_id>/detail/', 
         teacher_progress_views.StudentDetailProgressView.as_view(), 
         name='teacher-student-detail'),
    path('teacher/courses/<int:course_id>/analytics/', 
         teacher_progress_views.CourseAnalyticsView.as_view(), 
         name='teacher-course-analytics'),
    
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
    
    # Review endpoints (old routes - keep for backward compatibility)
    path('reviews/', include('lms.urls.review_urls')),
    
    # Course review endpoints (new routes)
    path('courses/<int:course_id>/review/', 
         course_review_views.CourseReviewCreateView.as_view(), 
         name='course-review-create'),
    path('courses/<int:course_id>/reviews/', 
         course_review_views.CourseReviewsListView.as_view(), 
         name='course-reviews-list'),
    path('courses/<int:course_id>/rating_summary/', 
         course_review_views.CourseRatingSummaryView.as_view(), 
         name='course-rating-summary'),
    
    # Search endpoints
    path('search/', include('lms.urls.search_urls')),
    path('courses/recommend/', RecommendCoursesView.as_view(), name='recommend-courses'),
    
    # Message endpoints (for both teacher and student)
    path('messages/conversations/', message_views.ConversationsListView.as_view(), name='conversations-list'),
    path('messages/conversation/<int:conversation_id>/', message_views.ConversationDetailView.as_view(), name='conversation-detail'),
    path('messages/send/', message_views.SendMessageView.as_view(), name='send-message'),
    path('messages/start_private/', message_views.StartPrivateChatView.as_view(), name='start-private-chat'),
    path('messages/broadcast/', message_views.BroadcastMessageView.as_view(), name='broadcast-message'),
    path('messages/mark_read/', message_views.MarkMessagesReadView.as_view(), name='mark-read'),
    path('messages/unread_count/', message_views.UnreadCountView.as_view(), name='unread-count'),
    
    # Teacher message endpoints
    path('teacher/messages/unread_count/', teacher_message_views.TeacherUnreadCountView.as_view(), name='teacher-unread-count'),
    path('teacher/messages/enrolled-students/', teacher_message_views.TeacherEnrolledStudentsView.as_view(), name='teacher-enrolled-students'),
    
    # Student message endpoints
    path('student/messages/unread_count/', student_message_views.StudentUnreadCountView.as_view(), name='student-unread-count'),
    
    # Student notification endpoints
    path('student/notifications/', notification_views.StudentNotificationsListView.as_view(), name='student-notifications'),
    path('student/notifications/mark_read/', notification_views.MarkNotificationReadView.as_view(), name='mark-notification-read'),
    path('student/notifications/unread_count/', notification_views.StudentNotificationUnreadCountView.as_view(), name='student-notification-unread-count'),
]
