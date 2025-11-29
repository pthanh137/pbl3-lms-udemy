from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, NotFound, ValidationError
from rest_framework import status
from django.db.models import Q
from django.contrib.contenttypes.models import ContentType
from lms.models import (
    Conversation, Message, Teacher, Student, Course, Enrollment, Notification
)
from lms.permissions import IsTeacher, IsStudent
from lms.views.teacher_views import get_current_teacher
from lms.views.student_views import get_current_student
from lms.serializers.message_serializer import (
    ConversationSerializer,
    MessageSerializer,
    CreateMessageSerializer,
    StartPrivateChatSerializer,
    BroadcastMessageSerializer
)


class ConversationsListView(APIView):
    """
    GET /api/messages/conversations/
    Returns list of conversations for the current user.
    Works for both teacher and student.
    """
    permission_classes = []  # Will check in view

    def get(self, request):
        # Determine current user
        teacher = get_current_teacher(request)
        student = get_current_student(request)
        
        if not teacher and not student:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Get conversations where user is a participant
        if teacher:
            conversations = Conversation.objects.filter(
                participants_teachers=teacher
            ).distinct()
        elif student:
            conversations = Conversation.objects.filter(
                participants_students=student
            ).distinct()
        else:
            conversations = Conversation.objects.none()

        conversations = conversations.prefetch_related(
            'participants_teachers',
            'participants_students',
            'messages'
        ).order_by('-updated_at')

        serializer = ConversationSerializer(conversations, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class UnreadCountView(APIView):
    """
    GET /api/messages/unread_count/
    Returns total unread message count for the current user (teacher or student).
    """
    permission_classes = []  # Will check in view

    def get(self, request):
        teacher = get_current_teacher(request)
        student = get_current_student(request)
        
        if not teacher and not student:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Get all conversations where user is a participant
        if teacher:
            conversations = Conversation.objects.filter(
                participants_teachers=teacher
            ).distinct()
            user_content_type = ContentType.objects.get_for_model(Teacher)
            user_id = teacher.id
        else:
            conversations = Conversation.objects.filter(
                participants_students=student
            ).distinct()
            user_content_type = ContentType.objects.get_for_model(Student)
            user_id = student.id

        # Count unread messages where sender is not the current user
        total_unread = Message.objects.filter(
            conversation__in=conversations,
            is_read=False
        ).exclude(
            sender_content_type=user_content_type,
            sender_object_id=user_id
        ).count()

        return Response({
            'unread_total': total_unread
        }, status=status.HTTP_200_OK)


class ConversationDetailView(APIView):
    """
    GET /api/messages/conversation/<id>/
    Returns messages in a conversation with pagination.
    """
    permission_classes = []  # Will check in view

    def get(self, request, conversation_id):
        # Determine current user
        teacher = get_current_teacher(request)
        student = get_current_student(request)
        
        if not teacher and not student:
            raise PermissionDenied("Authentication required")

        try:
            conversation = Conversation.objects.prefetch_related(
                'participants_teachers',
                'participants_students'
            ).get(id=conversation_id)
        except Conversation.DoesNotExist:
            raise NotFound("Conversation not found")

        # Check if user is a participant
        is_participant = False
        if teacher and conversation.participants_teachers.filter(id=teacher.id).exists():
            is_participant = True
        if student and conversation.participants_students.filter(id=student.id).exists():
            is_participant = True

        if not is_participant:
            raise PermissionDenied("You are not a participant in this conversation")

        # Mark messages as read when conversation is opened
        if teacher:
            user_content_type = ContentType.objects.get_for_model(Teacher)
            user_id = teacher.id
        elif student:
            user_content_type = ContentType.objects.get_for_model(Student)
            user_id = student.id
        else:
            user_content_type = None
            user_id = None

        if user_content_type and user_id:
            Message.objects.filter(
                conversation=conversation,
                is_read=False
            ).exclude(
                sender_content_type=user_content_type,
                sender_object_id=user_id
            ).update(is_read=True)

        # Get messages with pagination (sorted by created_at ascending - oldest first)
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 50))
        offset = (page - 1) * page_size

        messages = conversation.messages.all().order_by('created_at')[offset:offset + page_size]

        serializer = MessageSerializer(messages, many=True)
        return Response({
            'conversation': ConversationSerializer(conversation, context={'request': request}).data,
            'messages': serializer.data,
            'page': page,
            'page_size': page_size
        }, status=status.HTTP_200_OK)


class SendMessageView(APIView):
    """
    POST /api/messages/send/
    Send a message to a conversation.
    """
    permission_classes = []  # Will check in view

    def post(self, request):
        # Determine current user
        teacher = get_current_teacher(request)
        student = get_current_student(request)
        
        if not teacher and not student:
            raise PermissionDenied("Authentication required")

        serializer = CreateMessageSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        conversation_id = serializer.validated_data['conversation_id']
        content = serializer.validated_data['content']

        try:
            conversation = Conversation.objects.get(id=conversation_id)
        except Conversation.DoesNotExist:
            raise NotFound("Conversation not found")

        # Check if user is a participant
        is_participant = False
        if teacher and conversation.participants_teachers.filter(id=teacher.id).exists():
            is_participant = True
        if student and conversation.participants_students.filter(id=student.id).exists():
            is_participant = True

        if not is_participant:
            raise PermissionDenied("You are not a participant in this conversation")

        # For announcement conversations, only teacher can send
        if conversation.is_group and student:
            raise PermissionDenied("Students cannot send messages in announcement conversations")

        # Create message
        sender = teacher or student
        sender_content_type = ContentType.objects.get_for_model(type(sender))

        message = Message.objects.create(
            conversation=conversation,
            sender_content_type=sender_content_type,
            sender_object_id=sender.id,
            content=content,
            is_read=False  # New messages are unread by default
        )

        # Mark message as read for the sender (they sent it, so they've seen it)
        message.is_read = True
        message.save()

        # Update conversation's updated_at
        conversation.save()

        serializer = MessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class StartPrivateChatView(APIView):
    """
    POST /api/messages/start_private/
    Create or get a private chat room between teacher and student.
    """
    permission_classes = []  # Will check in view

    def post(self, request):
        # Log request data for debugging
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"StartPrivateChat request data: {request.data}")
        
        # Determine current user
        teacher = get_current_teacher(request)
        student = get_current_student(request)
        
        logger.info(f"Current teacher: {teacher}, Current student: {student}")
        
        if not teacher and not student:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        serializer = StartPrivateChatSerializer(data=request.data)
        if not serializer.is_valid():
            logger.error(f"Serializer validation errors: {serializer.errors}")
            return Response(
                {'error': 'Invalid request data', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        student_id = serializer.validated_data.get('student_id')
        teacher_id = serializer.validated_data.get('teacher_id')

        # Determine the other participant
        other_teacher = None
        other_student = None

        if teacher:
            # Teacher is starting chat with a student
            if not student_id:
                return Response(
                    {'error': 'student_id is required when teacher starts chat'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            try:
                other_student = Student.objects.get(id=student_id)
            except Student.DoesNotExist:
                return Response(
                    {'error': 'Student not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Check if student is enrolled in teacher's course
            if not Enrollment.objects.filter(
                student=other_student,
                course__teacher=teacher
            ).exists():
                return Response(
                    {'error': 'Student is not enrolled in your courses'},
                    status=status.HTTP_403_FORBIDDEN
                )

        elif student:
            # Student is starting chat with a teacher
            if not teacher_id:
                return Response(
                    {'error': 'teacher_id is required when student starts chat'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            try:
                other_teacher = Teacher.objects.get(id=teacher_id)
            except Teacher.DoesNotExist:
                return Response(
                    {'error': 'Teacher not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Check if student is enrolled in teacher's course
            if not Enrollment.objects.filter(
                student=student,
                course__teacher=other_teacher
            ).exists():
                return Response(
                    {'error': 'You are not enrolled in this teacher\'s courses'},
                    status=status.HTTP_403_FORBIDDEN
                )

        # Find or create conversation
        # Determine participants
        teacher_participant = teacher if teacher else other_teacher
        student_participant = student if student else other_student

        if not teacher_participant or not student_participant:
            logger.error(f"Missing participants: teacher={teacher_participant}, student={student_participant}")
            return Response(
                {'error': 'Both teacher and student must be specified'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if conversation already exists
        # Find conversations that have both this teacher and this student
        all_private_conversations = Conversation.objects.filter(is_group=False)
        
        conversation = None
        for conv in all_private_conversations:
            has_teacher = conv.participants_teachers.filter(id=teacher_participant.id).exists()
            has_student = conv.participants_students.filter(id=student_participant.id).exists()
            if has_teacher and has_student:
                conversation = conv
                break

        created = False
        if not conversation:
            # Create new conversation
            conversation = Conversation.objects.create(is_group=False)
            conversation.participants_teachers.add(teacher_participant)
            conversation.participants_students.add(student_participant)
            conversation.save()
            created = True
            logger.info(f"Created new conversation {conversation.id} between teacher {teacher_participant.id} and student {student_participant.id}")
        else:
            logger.info(f"Found existing conversation {conversation.id}")

        serializer = ConversationSerializer(conversation, context={'request': request})
        return Response({
            'id': conversation.id,
            'conversation_id': conversation.id,
            'created': created,
            **serializer.data
        }, status=status.HTTP_200_OK)


class BroadcastMessageView(APIView):
    """
    POST /api/messages/broadcast/
    Teacher sends a broadcast message to all students in a course.
    """
    permission_classes = [IsTeacher]

    def post(self, request):
        teacher = get_current_teacher(request)
        if not teacher:
            raise PermissionDenied("Teacher not found")

        serializer = BroadcastMessageSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        course_id = serializer.validated_data['course_id']
        content = serializer.validated_data['content']

        try:
            course = Course.objects.get(id=course_id, teacher=teacher)
        except Course.DoesNotExist:
            raise NotFound("Course not found or you don't have permission")

        # Get or create group conversation for this course
        conversation, created = Conversation.objects.get_or_create(
            course=course,
            is_group=True,
            defaults={}
        )

        if created:
            # Add teacher as participant
            conversation.participants_teachers.add(teacher)
            # Add all enrolled students
            enrollments = Enrollment.objects.filter(course=course)
            for enrollment in enrollments:
                conversation.participants_students.add(enrollment.student)
        else:
            # Ensure all current enrolled students are participants
            enrollments = Enrollment.objects.filter(course=course)
            for enrollment in enrollments:
                conversation.participants_students.add(enrollment.student)

        # Create message
        teacher_content_type = ContentType.objects.get_for_model(Teacher)
        message = Message.objects.create(
            conversation=conversation,
            sender_content_type=teacher_content_type,
            sender_object_id=teacher.id,
            content=content,
            is_read=False  # Mark as unread for all students
        )

        # Mark message as unread for all students in the course
        # (Teacher's message is automatically read for teacher)
        student_content_type = ContentType.objects.get_for_model(Student)
        enrollments = Enrollment.objects.filter(course=course)
        
        # Create Notification for each enrolled student
        for enrollment in enrollments:
            Notification.objects.create(
                student=enrollment.student,
                course=course,
                title=f"Thông báo từ khóa học {course.title}",
                message=content,
                is_read=False
            )

        # Update conversation
        conversation.save()

        serializer = MessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class MarkMessagesReadView(APIView):
    """
    POST /api/messages/mark_read/
    Mark all unread messages in a conversation as read for the current user.
    """
    permission_classes = []  # Will check in view

    def post(self, request):
        # Determine current user
        teacher = get_current_teacher(request)
        student = get_current_student(request)
        
        if not teacher and not student:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        conversation_id = request.data.get('conversation_id')
        if not conversation_id:
            return Response(
                {'error': 'conversation_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            conversation = Conversation.objects.get(id=conversation_id)
        except Conversation.DoesNotExist:
            return Response(
                {'error': 'Conversation not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if user is a participant
        is_participant = False
        if teacher and conversation.participants_teachers.filter(id=teacher.id).exists():
            is_participant = True
        if student and conversation.participants_students.filter(id=student.id).exists():
            is_participant = True

        if not is_participant:
            return Response(
                {'error': 'You are not a participant in this conversation'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Mark messages as read
        if teacher:
            user_content_type = ContentType.objects.get_for_model(Teacher)
            user_id = teacher.id
        else:
            user_content_type = ContentType.objects.get_for_model(Student)
            user_id = student.id

        # Mark all unread messages from other participants as read
        unread_cleared = Message.objects.filter(
            conversation=conversation,
            is_read=False
        ).exclude(
            sender_content_type=user_content_type,
            sender_object_id=user_id
        ).update(is_read=True)

        # Get updated unread count for this conversation (should be 0 after marking)
        unread_count = Message.objects.filter(
            conversation=conversation,
            is_read=False
        ).exclude(
            sender_content_type=user_content_type,
            sender_object_id=user_id
        ).count()

        return Response({
            'success': True,
            'unread_cleared': unread_cleared,
            'unread_count': unread_count
        }, status=status.HTTP_200_OK)

