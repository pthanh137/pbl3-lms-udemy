from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from .conversation import Conversation


class Message(models.Model):
    """
    Represents a message in a conversation.
    Sender can be either a Teacher or a Student.
    """
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    
    # Generic foreign key to support both Teacher and Student
    sender_content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    sender_object_id = models.PositiveIntegerField()
    sender = GenericForeignKey('sender_content_type', 'sender_object_id')
    
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        sender_name = self.get_sender_name()
        return f"{sender_name}: {self.content[:50]}..."

    def get_sender_name(self):
        """Get sender's name"""
        if self.sender:
            if hasattr(self.sender, 'full_name'):
                return self.sender.full_name
            elif hasattr(self.sender, 'email'):
                return self.sender.email
        return "Unknown"

    def get_sender_type(self):
        """Get sender type: 'teacher' or 'student'"""
        if self.sender_content_type.model == 'teacher':
            return 'teacher'
        elif self.sender_content_type.model == 'student':
            return 'student'
        return 'unknown'

    class Meta:
        verbose_name = 'Message'
        verbose_name_plural = 'Messages'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['conversation', 'created_at']),
        ]


