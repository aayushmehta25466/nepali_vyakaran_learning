"""
Admin configuration for the accounts app.
Customized admin panel for user management.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from .models import CustomUser, GameState, UserSettings, OTPVerification, ActivityLog


# =============================================================================
# CUSTOM ADMIN SITE CONFIGURATION
# =============================================================================

admin.site.site_header = "नेपाली व्याकरण सिक्नुहोस् - Admin"
admin.site.site_title = "Nepali Vyakaran Learning Admin"
admin.site.index_title = "Welcome to Nepali Vyakaran Learning Administration"


# =============================================================================
# INLINE ADMIN CLASSES
# =============================================================================

class GameStateInline(admin.StackedInline):
    """Inline admin for GameState."""
    model = GameState
    can_delete = False
    verbose_name_plural = 'Game State'
    readonly_fields = ['accuracy', 'created_at', 'updated_at']
    fieldsets = (
        ('Core Metrics', {
            'fields': ('level', 'points', 'coins', 'experience', 'experience_to_next_level')
        }),
        ('Streak', {
            'fields': ('current_streak', 'longest_streak', 'last_activity_date')
        }),
        ('Progress', {
            'fields': ('total_correct_answers', 'total_questions_attempted', 'total_time_spent', 'accuracy')
        }),
        ('Data', {
            'fields': ('unlocked_zones', 'completed_lessons', 'achievements', 'badges'),
            'classes': ('collapse',)
        }),
    )


class UserSettingsInline(admin.StackedInline):
    """Inline admin for UserSettings."""
    model = UserSettings
    can_delete = False
    verbose_name_plural = 'Settings'
    fieldsets = (
        ('Display', {
            'fields': ('language', 'theme', 'difficulty', 'daily_goal_minutes')
        }),
        ('Audio/Visual', {
            'fields': ('sound_enabled', 'music_enabled', 'animations_enabled')
        }),
        ('Notifications', {
            'fields': ('email_notifications', 'push_notifications', 'reminder_notifications', 'achievement_notifications')
        }),
        ('Privacy', {
            'fields': ('profile_public', 'show_on_leaderboard')
        }),
    )


# =============================================================================
# MODEL ADMIN CLASSES
# =============================================================================

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    """
    Custom admin for the CustomUser model.
    """
    list_display = ['email', 'username', 'get_avatar', 'is_email_verified', 'is_active', 'is_staff', 'date_joined']
    list_filter = ['is_active', 'is_staff', 'is_superuser', 'is_email_verified', 'date_joined']
    search_fields = ['email', 'username', 'first_name', 'last_name']
    ordering = ['-date_joined']
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('username', 'first_name', 'last_name', 'avatar', 'bio')}),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'is_email_verified', 'groups', 'user_permissions'),
        }),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2'),
        }),
    )
    
    readonly_fields = ['date_joined', 'last_login']
    inlines = [GameStateInline, UserSettingsInline]
    
    actions = ['activate_users', 'deactivate_users', 'verify_emails']
    
    def get_avatar(self, obj):
        if obj.avatar:
            return format_html('<img src="{}" width="30" height="30" style="border-radius: 50%;" />', obj.avatar.url)
        return format_html('<span style="color: #999;">No avatar</span>')
    get_avatar.short_description = 'Avatar'
    
    @admin.action(description='Activate selected users')
    def activate_users(self, request, queryset):
        count = queryset.update(is_active=True)
        self.message_user(request, f'{count} user(s) activated successfully.')
    
    @admin.action(description='Deactivate selected users')
    def deactivate_users(self, request, queryset):
        count = queryset.update(is_active=False)
        self.message_user(request, f'{count} user(s) deactivated successfully.')
    
    @admin.action(description='Mark emails as verified')
    def verify_emails(self, request, queryset):
        count = queryset.update(is_email_verified=True)
        self.message_user(request, f'{count} user(s) email verified successfully.')


@admin.register(GameState)
class GameStateAdmin(admin.ModelAdmin):
    """Admin for GameState model."""
    list_display = ['user', 'level', 'points', 'coins', 'current_streak', 'accuracy', 'updated_at']
    list_filter = ['level', 'current_streak']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['accuracy', 'created_at', 'updated_at']
    ordering = ['-points']
    
    fieldsets = (
        ('User', {'fields': ('user',)}),
        ('Core Metrics', {'fields': ('level', 'points', 'coins', 'experience', 'experience_to_next_level')}),
        ('Streak', {'fields': ('current_streak', 'longest_streak', 'last_activity_date')}),
        ('Progress', {'fields': ('total_correct_answers', 'total_questions_attempted', 'total_time_spent', 'accuracy')}),
        ('Data', {'fields': ('unlocked_zones', 'completed_lessons', 'achievements', 'badges'), 'classes': ('collapse',)}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )
    
    actions = ['reset_streak', 'add_bonus_points', 'add_bonus_coins']
    
    @admin.action(description='Reset streak for selected users')
    def reset_streak(self, request, queryset):
        count = queryset.update(current_streak=0)
        self.message_user(request, f'Streak reset for {count} user(s).')
    
    @admin.action(description='Add 100 bonus points')
    def add_bonus_points(self, request, queryset):
        for game_state in queryset:
            game_state.points += 100
            game_state.save()
        self.message_user(request, f'Added 100 bonus points to {queryset.count()} user(s).')
    
    @admin.action(description='Add 50 bonus coins')
    def add_bonus_coins(self, request, queryset):
        for game_state in queryset:
            game_state.coins += 50
            game_state.save()
        self.message_user(request, f'Added 50 bonus coins to {queryset.count()} user(s).')


@admin.register(UserSettings)
class UserSettingsAdmin(admin.ModelAdmin):
    """Admin for UserSettings model."""
    list_display = ['user', 'language', 'theme', 'difficulty', 'sound_enabled', 'email_notifications']
    list_filter = ['language', 'theme', 'difficulty', 'sound_enabled', 'email_notifications']
    search_fields = ['user__username', 'user__email']
    
    fieldsets = (
        ('User', {'fields': ('user',)}),
        ('Display', {'fields': ('language', 'theme', 'difficulty', 'daily_goal_minutes')}),
        ('Audio/Visual', {'fields': ('sound_enabled', 'music_enabled', 'animations_enabled')}),
        ('Notifications', {'fields': ('email_notifications', 'push_notifications', 'reminder_notifications', 'achievement_notifications')}),
        ('Privacy', {'fields': ('profile_public', 'show_on_leaderboard')}),
    )


@admin.register(OTPVerification)
class OTPVerificationAdmin(admin.ModelAdmin):
    """Admin for OTPVerification model."""
    list_display = ['user', 'purpose', 'otp_code', 'is_used', 'is_valid_display', 'created_at', 'expires_at']
    list_filter = ['purpose', 'is_used', 'created_at']
    search_fields = ['user__username', 'user__email', 'otp_code']
    readonly_fields = ['created_at']
    ordering = ['-created_at']
    
    def is_valid_display(self, obj):
        if obj.is_valid:
            return format_html('<span style="color: green;">✓ Valid</span>')
        return format_html('<span style="color: red;">✗ Invalid</span>')
    is_valid_display.short_description = 'Status'
    
    actions = ['invalidate_otps']
    
    @admin.action(description='Invalidate selected OTPs')
    def invalidate_otps(self, request, queryset):
        count = queryset.update(is_used=True)
        self.message_user(request, f'{count} OTP(s) invalidated.')


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    """Admin for ActivityLog model."""
    list_display = ['user', 'activity_type', 'description_short', 'ip_address', 'created_at']
    list_filter = ['activity_type', 'created_at']
    search_fields = ['user__username', 'user__email', 'description', 'ip_address']
    readonly_fields = ['user', 'activity_type', 'description', 'metadata', 'ip_address', 'user_agent', 'created_at']
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    
    def description_short(self, obj):
        if len(obj.description) > 50:
            return obj.description[:50] + '...'
        return obj.description or '-'
    description_short.short_description = 'Description'
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False

