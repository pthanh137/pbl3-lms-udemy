from django.db import models
from .teacher import Teacher
from .student import Student
from .course import Course


class Conversation(models.Model):
    """
    Represents a conversation between participants.
    Can be a private chat (1-on-1) or a group chat (broadcast).
    """
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='conversations',
        null=True,
        blank=True,
        help_text="Course for group/broadcast conversations. Null for private chats."
    )
    participants_teachers = models.ManyToManyField(
        Teacher,
        related_name='conversations',
        blank=True
    )
    participants_students = models.ManyToManyField(
        Student,
        related_name='conversations',
        blank=True
    )
    is_group = models.BooleanField(
        default=False,
        help_text="True for broadcast/group conversations, False for private chats"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        if self.is_group and self.course:
            return f"Group: {self.course.title}"
        participants = list(self.participants_teachers.all()) + list(self.participants_students.all())
        if len(participants) == 2:
            return f"Chat: {participants[0]} ↔ {participants[1]}"
        return f"Conversation {self.id}"

    def get_participants(self):
        """Get all participants (teachers + students)"""
        return list(self.participants_teachers.all()) + list(self.participants_students.all())

    def get_other_participant(self, user):
        """Get the other participant in a private conversation"""
        if self.is_group:
            return None
        participants = self.get_participants()
        for participant in participants:
            if participant != user:
                return participant
        return None

    class Meta:
        verbose_name = 'Conversation'
        verbose_name_plural = 'Conversations'
        ordering = ['-updated_at']


