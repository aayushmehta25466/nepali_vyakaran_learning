"""
Models for the accounts app.
Handles user management, authentication, game state, and user settings.
"""

import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from django.conf import settings


class CustomUser(AbstractUser):
    """
    Extended user model with additional fields for the learning platform.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(max_length=500, blank=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_email_verified = models.BooleanField(default=False)
    
    # Make email the primary login field
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-date_joined']
    
    def __str__(self):
        return self.email
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.username


class GameState(models.Model):
    """
    Stores the user's complete game state including progress, points, and achievements.
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='game_state'
    )
    
    # Core game metrics
    level = models.PositiveIntegerField(default=1)
    points = models.PositiveIntegerField(default=0)
    coins = models.PositiveIntegerField(default=0)
    
    # Experience system
    experience = models.PositiveIntegerField(default=0)
    experience_to_next_level = models.PositiveIntegerField(default=100)
    
    # Streak tracking
    current_streak = models.PositiveIntegerField(default=0)
    longest_streak = models.PositiveIntegerField(default=0)
    last_activity_date = models.DateField(null=True, blank=True)
    
    # Progress tracking
    total_correct_answers = models.PositiveIntegerField(default=0)
    total_questions_attempted = models.PositiveIntegerField(default=0)
    total_time_spent = models.PositiveIntegerField(default=0)  # in seconds
    
    # JSON fields for flexible data storage
    unlocked_zones = models.JSONField(default=list, blank=True)
    completed_lessons = models.JSONField(default=list, blank=True)
    achievements = models.JSONField(default=list, blank=True)
    badges = models.JSONField(default=list, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Game State'
        verbose_name_plural = 'Game States'
    
    def __str__(self):
        return f"{self.user.username}'s Game State - Level {self.level}"
    
    @property
    def accuracy(self):
        """Calculate user's answer accuracy percentage."""
        if self.total_questions_attempted == 0:
            return 0
        return round((self.total_correct_answers / self.total_questions_attempted) * 100, 2)
    
    def add_points(self, points, reason=''):
        """Add points and check for level up."""
        self.points += points
        self.experience += points
        
        # Check for level up
        level_up = False
        while self.experience >= self.experience_to_next_level:
            self.experience -= self.experience_to_next_level
            self.level += 1
            self.experience_to_next_level = self.calculate_next_level_exp()
            level_up = True
        
        self.save()
        return level_up, self.level
    
    def calculate_next_level_exp(self):
        """Calculate experience needed for next level."""
        return int(100 * (1.5 ** (self.level - 1)))
    
    def update_streak(self):
        """Update the user's learning streak."""
        today = timezone.now().date()
        
        if self.last_activity_date is None:
            self.current_streak = 1
        elif self.last_activity_date == today:
            # Already active today, no change
            return self.current_streak
        elif (today - self.last_activity_date).days == 1:
            # Consecutive day
            self.current_streak += 1
        else:
            # Streak broken
            self.current_streak = 1
        
        self.last_activity_date = today
        
        if self.current_streak > self.longest_streak:
            self.longest_streak = self.current_streak
        
        self.save()
        return self.current_streak


class UserSettings(models.Model):
    """
    Stores user preferences and settings.
    """
    LANGUAGE_CHOICES = [
        ('ne', 'नेपाली'),
        ('en', 'English'),
    ]
    
    THEME_CHOICES = [
        ('light', 'Light'),
        ('dark', 'Dark'),
        ('system', 'System'),
    ]
    
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
        ('adaptive', 'Adaptive'),
    ]
    
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='settings'
    )
    
    # Display preferences
    language = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, default='ne')
    theme = models.CharField(max_length=10, choices=THEME_CHOICES, default='light')
    
    # Learning preferences
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='adaptive')
    daily_goal_minutes = models.PositiveIntegerField(default=15)
    
    # Audio/Visual settings
    sound_enabled = models.BooleanField(default=True)
    music_enabled = models.BooleanField(default=True)
    animations_enabled = models.BooleanField(default=True)
    
    # Notification preferences
    email_notifications = models.BooleanField(default=True)
    push_notifications = models.BooleanField(default=True)
    reminder_notifications = models.BooleanField(default=True)
    achievement_notifications = models.BooleanField(default=True)
    
    # Privacy settings
    profile_public = models.BooleanField(default=True)
    show_on_leaderboard = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'User Settings'
        verbose_name_plural = 'User Settings'
    
    def __str__(self):
        return f"{self.user.username}'s Settings"


class OTPVerification(models.Model):
    """
    Stores OTP codes for email verification and password reset.
    """
    PURPOSE_CHOICES = [
        ('verification', 'Email Verification'),
        ('password_reset', 'Password Reset'),
        ('login', 'Login Verification'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='otp_codes'
    )
    otp_code = models.CharField(max_length=6)
    purpose = models.CharField(max_length=20, choices=PURPOSE_CHOICES)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    class Meta:
        verbose_name = 'OTP Verification'
        verbose_name_plural = 'OTP Verifications'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"OTP for {self.user.email} - {self.purpose}"
    
    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timezone.timedelta(
                minutes=settings.OTP_EXPIRY_MINUTES
            )
        super().save(*args, **kwargs)
    
    @property
    def is_valid(self):
        """Check if the OTP is still valid (not expired and not used)."""
        return not self.is_used and timezone.now() < self.expires_at
    
    @classmethod
    def create_otp(cls, user, purpose):
        """Create a new OTP for the user."""
        from .utils import generate_otp
        
        # Invalidate previous OTPs for the same purpose
        cls.objects.filter(user=user, purpose=purpose, is_used=False).update(is_used=True)
        
        otp_code = generate_otp()
        otp = cls.objects.create(
            user=user,
            otp_code=otp_code,
            purpose=purpose
        )
        return otp


class ActivityLog(models.Model):
    """
    Logs user activities for analytics and tracking.
    """
    ACTIVITY_TYPES = [
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('lesson_start', 'Lesson Started'),
        ('lesson_complete', 'Lesson Completed'),
        ('quiz_start', 'Quiz Started'),
        ('quiz_complete', 'Quiz Completed'),
        ('achievement_earned', 'Achievement Earned'),
        ('badge_earned', 'Badge Earned'),
        ('level_up', 'Level Up'),
        ('streak_milestone', 'Streak Milestone'),
        ('points_earned', 'Points Earned'),
        ('coins_earned', 'Coins Earned'),
        ('coins_spent', 'Coins Spent'),
        ('zone_unlocked', 'Zone Unlocked'),
        ('profile_updated', 'Profile Updated'),
        ('settings_changed', 'Settings Changed'),
        ('game_played', 'Game Played'),
        ('writing_submitted', 'Writing Submitted'),
        ('quest_started', 'Quest Started'),
        ('quest_completed', 'Quest Completed'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='activity_logs'
    )
    activity_type = models.CharField(max_length=30, choices=ACTIVITY_TYPES)
    description = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Activity Log'
        verbose_name_plural = 'Activity Logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'activity_type']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.activity_type} at {self.created_at}"
    
    @classmethod
    def log_activity(cls, user, activity_type, description='', metadata=None, request=None):
        """Create a new activity log entry."""
        ip_address = None
        user_agent = ''
        
        if request:
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip_address = x_forwarded_for.split(',')[0]
            else:
                ip_address = request.META.get('REMOTE_ADDR')
            user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        return cls.objects.create(
            user=user,
            activity_type=activity_type,
            description=description,
            metadata=metadata or {},
            ip_address=ip_address,
            user_agent=user_agent
        )

