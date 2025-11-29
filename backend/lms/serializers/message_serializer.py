from rest_framework import serializers
from lms.models import Conversation, Message, Teacher, Student, Course
from django.contrib.contenttypes.models import ContentType


class MessageSerializer(serializers.ModelSerializer):
    """Serializer for Message model"""
    sender_name = serializers.SerializerMethodField()
    sender_type = serializers.SerializerMethodField()
    sender_id = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = [
            'id', 'conversation', 'sender_id', 'sender_name', 'sender_type',
            'content', 'is_read', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def get_sender_name(self, obj):
        return obj.get_sender_name()

    def get_sender_type(self, obj):
        return obj.get_sender_type()

    def get_sender_id(self, obj):
        return obj.sender_object_id if obj.sender else None


class ConversationSerializer(serializers.ModelSerializer):
    """Serializer for Conversation model"""
    participants_info = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    course_title = serializers.CharField(source='course.title', read_only=True, allow_null=True)
    conversation_title = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = [
            'id', 'course', 'course_title', 'is_group',
            'participants_info', 'last_message', 'unread_count',
            'conversation_title', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_conversation_title(self, obj):
        """Get conversation title based on type"""
        request = self.context.get('request')
        if not request:
            return "Conversation"
        
        # Determine current user
        teacher = None
        student = None
        
        if hasattr(request, 'auth') and request.auth:
            teacher_id = request.auth.get('teacher_id')
            student_id = request.auth.get('student_id')
            
            if teacher_id:
                try:
                    from lms.models import Teacher
                    teacher = Teacher.objects.get(id=teacher_id)
                except:
                    pass
            
            if not teacher and student_id:
                try:
                    from lms.models import Student
                    student = Student.objects.get(id=student_id)
                except:
                    pass
        
        # If it's a group/broadcast conversation
        if obj.is_group and obj.course:
            return f"Thông báo khóa học: {obj.course.title}"
        
        # If it's a private conversation
        if teacher:
            # Teacher sees student name
            students = obj.participants_students.all()
            if students:
                return students[0].full_name
        elif student:
            # Student sees teacher name
            teachers = obj.participants_teachers.all()
            if teachers:
                return teachers[0].full_name
        
        return "Conversation"

    def get_participants_info(self, obj):
        """Get information about participants"""
        teachers = obj.participants_teachers.all()
        students = obj.participants_students.all()
        
        participants = []
        for teacher in teachers:
            participants.append({
                'id': teacher.id,
                'name': teacher.full_name,
                'email': teacher.email,
                'type': 'teacher',
                'avatar': None  # Can add avatar URL if available
            })
        for student in students:
            participants.append({
                'id': student.id,
                'name': student.full_name,
                'email': student.email,
                'type': 'student',
                'avatar': None  # Can add avatar URL if available
            })
        return participants

    def get_last_message(self, obj):
        """Get the last message in the conversation"""
        last_msg = obj.messages.last()
        if last_msg:
            return {
                'id': last_msg.id,
                'content': last_msg.content[:100],  # Preview
                'sender_name': last_msg.get_sender_name(),
                'sender_type': last_msg.get_sender_type(),
                'created_at': last_msg.created_at
            }
        return None

    def get_unread_count(self, obj):
        """Get unread message count for current user"""
        request = self.context.get('request')
        if not request or not hasattr(request, 'user'):
            return 0
        
        # Determine current user
        user = None
        user_type = None
        
        # Try to get from JWT token
        if hasattr(request, 'auth') and request.auth:
            teacher_id = request.auth.get('teacher_id')
            student_id = request.auth.get('student_id')
            
            if teacher_id:
                try:
                    user = Teacher.objects.get(id=teacher_id)
                    user_type = 'teacher'
                except Teacher.DoesNotExist:
                    pass
            
            if not user and student_id:
                try:
                    user = Student.objects.get(id=student_id)
                    user_type = 'student'
                except Student.DoesNotExist:
                    pass
        
        if not user:
            return 0
        
        # Count unread messages where sender is not the current user
        unread = obj.messages.filter(is_read=False).exclude(
            sender_content_type=ContentType.objects.get_for_model(type(user)),
            sender_object_id=user.id
        ).count()
        
        return unread


class CreateMessageSerializer(serializers.Serializer):
    """Serializer for creating a new message"""
    conversation_id = serializers.IntegerField()
    content = serializers.CharField()


class StartPrivateChatSerializer(serializers.Serializer):
    """Serializer for starting a private chat"""
    student_id = serializers.IntegerField(required=False, allow_null=True)
    teacher_id = serializers.IntegerField(required=False, allow_null=True)
    
    def validate(self, data):
        """At least one of student_id or teacher_id must be provided"""
        if not data.get('student_id') and not data.get('teacher_id'):
            raise serializers.ValidationError("Either student_id or teacher_id must be provided")
        return data


class BroadcastMessageSerializer(serializers.Serializer):
    """Serializer for broadcasting a message"""
    course_id = serializers.IntegerField()
    content = serializers.CharField()

