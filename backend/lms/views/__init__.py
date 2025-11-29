# Import all views for easy access
from . import auth_views
from . import public_views
from . import teacher_views
from . import student_views
from . import teacher_message_views
from . import student_message_views
from . import notification_views
from . import course_review_views

__all__ = ['auth_views', 'public_views', 'teacher_views', 'student_views', 'teacher_message_views', 'student_message_views', 'notification_views', 'course_review_views']



