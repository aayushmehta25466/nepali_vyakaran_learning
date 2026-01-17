"""
Serializers for the accounts app.
Handles user registration, authentication, and profile management.
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from dj_rest_auth.registration.serializers import RegisterSerializer
from .models import GameState, UserSettings, OTPVerification, ActivityLog

User = get_user_model()


class CustomRegisterSerializer(RegisterSerializer):
    """
    Custom registration serializer with additional fields.
    Sends custom verification email after registration.
    """
    username = serializers.CharField(required=True, max_length=150)
    email = serializers.EmailField(required=True)
    password1 = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=True)
    
    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value
    
    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()
    
    def validate(self, data):
        if data['password1'] != data['password2']:
            raise serializers.ValidationError({"password2": "Password fields didn't match."})
        validate_password(data['password1'])
        return data
    
    def get_cleaned_data(self):
        return {
            'username': self.validated_data.get('username', ''),
            'email': self.validated_data.get('email', '').lower(),
            'password1': self.validated_data.get('password1', ''),
        }
    
    def save(self, request):
        user = super().save(request)
        # Create associated GameState and UserSettings
        GameState.objects.get_or_create(user=user)
        UserSettings.objects.get_or_create(user=user)
        
        # Send custom verification email with beautiful template
        from .utils import send_otp_email, generate_otp
        otp = OTPVerification.create_otp(user, 'verification')
        send_otp_email(user, otp.otp_code, 'verification')
        
        return user


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile data.
    """
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'full_name', 'avatar', 'bio', 'date_joined', 'is_email_verified'
        ]
        read_only_fields = ['id', 'email', 'date_joined', 'is_email_verified']


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user profile.
    """
    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'avatar', 'bio']
    
    def validate_username(self, value):
        user = self.context['request'].user
        if User.objects.filter(username__iexact=value).exclude(id=user.id).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value


class GameStateSerializer(serializers.ModelSerializer):
    """
    Serializer for user's game state.
    """
    accuracy = serializers.ReadOnlyField()
    
    class Meta:
        model = GameState
        fields = [
            'level', 'points', 'coins', 'experience', 'experience_to_next_level',
            'current_streak', 'longest_streak', 'last_activity_date',
            'total_correct_answers', 'total_questions_attempted', 'total_time_spent',
            'unlocked_zones', 'completed_lessons', 'achievements', 'badges',
            'accuracy', 'created_at', 'updated_at'
        ]
        read_only_fields = ['accuracy', 'created_at', 'updated_at']


class GameStateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating game state.
    """
    class Meta:
        model = GameState
        fields = [
            'level', 'points', 'coins', 'experience',
            'current_streak', 'unlocked_zones', 'completed_lessons',
            'achievements', 'badges'
        ]


class AddPointsSerializer(serializers.Serializer):
    """
    Serializer for adding points.
    """
    points = serializers.IntegerField(min_value=1, required=True)
    reason = serializers.CharField(max_length=255, required=True)


class AddCoinsSerializer(serializers.Serializer):
    """
    Serializer for adding coins.
    """
    coins = serializers.IntegerField(min_value=1, required=True)
    source = serializers.CharField(max_length=255, required=True)


class SpendCoinsSerializer(serializers.Serializer):
    """
    Serializer for spending coins.
    """
    amount = serializers.IntegerField(min_value=1, required=True)
    item_id = serializers.CharField(max_length=255, required=True)
    item_type = serializers.CharField(max_length=50, required=True)


class UnlockZoneSerializer(serializers.Serializer):
    """
    Serializer for unlocking a zone.
    """
    zone_id = serializers.CharField(max_length=255, required=True)


class CompleteLessonSerializer(serializers.Serializer):
    """
    Serializer for completing a lesson.
    """
    lesson_id = serializers.CharField(max_length=255, required=True)
    score = serializers.IntegerField(min_value=0, max_value=100, required=True)
    time_spent = serializers.IntegerField(min_value=0, required=True)  # in seconds


class UpdateStreakSerializer(serializers.Serializer):
    """
    Serializer for updating streak.
    """
    action = serializers.ChoiceField(choices=['increment', 'reset'], required=True)


class UserSettingsSerializer(serializers.ModelSerializer):
    """
    Serializer for user settings.
    """
    class Meta:
        model = UserSettings
        fields = [
            'language', 'theme', 'difficulty', 'daily_goal_minutes',
            'sound_enabled', 'music_enabled', 'animations_enabled',
            'email_notifications', 'push_notifications',
            'reminder_notifications', 'achievement_notifications',
            'profile_public', 'show_on_leaderboard',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class NotificationSettingsSerializer(serializers.ModelSerializer):
    """
    Serializer for notification settings only.
    """
    class Meta:
        model = UserSettings
        fields = [
            'email_notifications', 'push_notifications',
            'reminder_notifications', 'achievement_notifications'
        ]


class ChangeLanguageSerializer(serializers.Serializer):
    """
    Serializer for changing language.
    """
    language = serializers.ChoiceField(choices=['ne', 'en'], required=True)


class PasswordChangeSerializer(serializers.Serializer):
    """
    Serializer for changing password.
    """
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)
    confirm_password = serializers.CharField(required=True, write_only=True)
    
    def validate_new_password(self, value):
        validate_password(value)
        return value
    
    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({
                "confirm_password": "New passwords don't match."
            })
        return data


class OTPRequestSerializer(serializers.Serializer):
    """
    Serializer for requesting OTP.
    """
    email = serializers.EmailField(required=True)
    purpose = serializers.ChoiceField(
        choices=['verification', 'password_reset', 'login'],
        required=True
    )


class OTPVerifySerializer(serializers.Serializer):
    """
    Serializer for verifying OTP.
    """
    email = serializers.EmailField(required=True)
    otp_code = serializers.CharField(max_length=6, min_length=6, required=True)
    purpose = serializers.ChoiceField(
        choices=['verification', 'password_reset', 'login'],
        required=True
    )


class PasswordResetRequestSerializer(serializers.Serializer):
    """
    Serializer for requesting password reset.
    """
    email = serializers.EmailField(required=True)


class PasswordResetConfirmSerializer(serializers.Serializer):
    """
    Serializer for confirming password reset with OTP.
    """
    email = serializers.EmailField(required=True)
    otp_code = serializers.CharField(max_length=6, min_length=6, required=True)
    new_password = serializers.CharField(required=True, write_only=True)
    confirm_password = serializers.CharField(required=True, write_only=True)
    
    def validate_new_password(self, value):
        validate_password(value)
        return value
    
    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({
                "confirm_password": "Passwords don't match."
            })
        return data


class ResetProgressSerializer(serializers.Serializer):
    """
    Serializer for resetting user progress (dangerous operation).
    """
    confirmation = serializers.CharField(required=True)
    
    def validate_confirmation(self, value):
        if value != 'RESET_MY_PROGRESS':
            raise serializers.ValidationError(
                "Please type 'RESET_MY_PROGRESS' to confirm."
            )
        return value


class ActivityLogSerializer(serializers.ModelSerializer):
    """
    Serializer for activity logs.
    """
    class Meta:
        model = ActivityLog
        fields = [
            'id', 'activity_type', 'description', 'metadata', 'created_at'
        ]
        read_only_fields = fields


class UserStatsSerializer(serializers.Serializer):
    """
    Serializer for user statistics overview.
    """
    total_points = serializers.IntegerField()
    total_coins = serializers.IntegerField()
    level = serializers.IntegerField()
    completed_lessons = serializers.IntegerField()
    current_streak = serializers.IntegerField()
    longest_streak = serializers.IntegerField()
    total_time_spent = serializers.IntegerField()
    accuracy = serializers.FloatField()
    achievements_count = serializers.IntegerField()
    badges_count = serializers.IntegerField()


class LeaderboardEntrySerializer(serializers.Serializer):
    """
    Serializer for leaderboard entries.
    """
    rank = serializers.IntegerField()
    user_id = serializers.UUIDField()
    username = serializers.CharField()
    avatar = serializers.ImageField(allow_null=True)
    value = serializers.IntegerField()  # points, level, or streak based on type
