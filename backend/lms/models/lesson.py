from django.db import models
import re
from .section import Section


def extract_youtube_video_id(url):
    """
    Extract YouTube video ID from various URL formats:
    - https://youtu.be/xxx
    - https://www.youtube.com/watch?v=xxx
    - https://www.youtube.com/embed/xxx
    - https://youtube.com/watch?v=xxx
    """
    if not url:
        return None
    
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})',
        r'youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    
    return None


class Lesson(models.Model):
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    video_url = models.CharField(blank=True, null=True, max_length=500, help_text="YouTube URL or direct MP4 file URL")
    video_file = models.FileField(upload_to='lessons/videos/', blank=True, null=True, help_text="Upload MP4 video file")
    duration_seconds = models.IntegerField(blank=True, null=True, help_text="Video duration in seconds")
    order = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.section.title} - {self.title}"

    @property
    def is_youtube(self):
        """Check if video_url is a YouTube link"""
        if not self.video_url:
            return False
        return bool(extract_youtube_video_id(self.video_url))

    @property
    def youtube_video_id(self):
        """Extract YouTube video ID if video_url is a YouTube link"""
        if not self.video_url:
            return None
        return extract_youtube_video_id(self.video_url)

    @property
    def is_mp4(self):
        """Check if video_url is an MP4 file"""
        if not self.video_url:
            return False
        return self.video_url.lower().endswith('.mp4') or '.mp4' in self.video_url.lower()

    class Meta:
        verbose_name = 'Lesson'
        verbose_name_plural = 'Lessons'
        ordering = ['order', 'id']



