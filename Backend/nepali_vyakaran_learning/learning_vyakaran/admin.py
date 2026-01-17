"""
Admin configuration for the learning_vyakaran app.
Comprehensive admin panel for content management.
"""

from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Category, Lesson, LessonProgress, Quiz, Question, QuizResult,
    Village, BuildingType, VillageBuilding,
    Quest, QuestProgress,
    Achievement, UserAchievement, Badge, UserBadge,
    WritingPrompt, WritingSubmission,
    Game, GameSession, Leaderboard
)


# =============================================================================
# INLINE ADMIN CLASSES
# =============================================================================

class QuestionInline(admin.TabularInline):
    """Inline admin for Questions in Quiz."""
    model = Question
    extra = 1
    fields = ['question_type', 'question_text', 'options', 'correct_answer', 'points', 'order', 'is_active']
    ordering = ['order']


class VillageBuildingInline(admin.TabularInline):
    """Inline admin for Buildings in Village."""
    model = VillageBuilding
    extra = 0
    fields = ['building_type', 'position_x', 'position_y', 'level', 'is_upgrading']


# =============================================================================
# CATEGORY & LESSON ADMIN
# =============================================================================

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """Admin for Category model."""
    list_display = ['name', 'name_nepali', 'slug', 'order', 'is_active', 'lesson_count']
    list_filter = ['is_active']
    search_fields = ['name', 'name_nepali', 'slug']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['order', 'name']
    
    def lesson_count(self, obj):
        count = obj.lessons.count()
        return format_html('<strong>{}</strong> lessons', count)
    lesson_count.short_description = 'Lessons'


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    """Admin for Lesson model."""
    list_display = ['title', 'category', 'level', 'difficulty', 'is_published', 'is_premium', 'points_reward', 'estimated_time']
    list_filter = ['category', 'difficulty', 'level', 'is_published', 'is_premium']
    search_fields = ['title', 'title_nepali', 'description']
    prepopulated_fields = {'slug': ('title',)}
    filter_horizontal = ['prerequisites']
    ordering = ['category', 'order', 'level']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('title', 'title_nepali', 'slug', 'description', 'description_nepali', 'category')
        }),
        ('Settings', {
            'fields': ('level', 'difficulty', 'order', 'estimated_time')
        }),
        ('Content', {
            'fields': ('content', 'examples', 'explanations', 'media', 'exercises'),
            'classes': ('collapse',)
        }),
        ('Requirements & Rewards', {
            'fields': ('prerequisites', 'points_reward', 'coins_reward')
        }),
        ('Publishing', {
            'fields': ('is_published', 'is_premium')
        }),
    )
    
    actions = ['publish_lessons', 'unpublish_lessons', 'make_premium', 'remove_premium']
    
    @admin.action(description='Publish selected lessons')
    def publish_lessons(self, request, queryset):
        count = queryset.update(is_published=True)
        self.message_user(request, f'{count} lesson(s) published.')
    
    @admin.action(description='Unpublish selected lessons')
    def unpublish_lessons(self, request, queryset):
        count = queryset.update(is_published=False)
        self.message_user(request, f'{count} lesson(s) unpublished.')
    
    @admin.action(description='Make premium')
    def make_premium(self, request, queryset):
        count = queryset.update(is_premium=True)
        self.message_user(request, f'{count} lesson(s) made premium.')
    
    @admin.action(description='Remove premium status')
    def remove_premium(self, request, queryset):
        count = queryset.update(is_premium=False)
        self.message_user(request, f'{count} lesson(s) premium status removed.')


@admin.register(LessonProgress)
class LessonProgressAdmin(admin.ModelAdmin):
    """Admin for LessonProgress model."""
    list_display = ['user', 'lesson', 'status', 'score', 'best_score', 'attempts', 'completed_at']
    list_filter = ['status', 'completed_at']
    search_fields = ['user__username', 'user__email', 'lesson__title']
    readonly_fields = ['session_id', 'started_at', 'completed_at', 'created_at', 'updated_at']
    ordering = ['-updated_at']


# =============================================================================
# QUIZ & QUESTION ADMIN
# =============================================================================

@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    """Admin for Quiz model."""
    list_display = ['title', 'category', 'quiz_type', 'difficulty', 'question_count', 'is_published', 'points_reward']
    list_filter = ['quiz_type', 'difficulty', 'category', 'is_published', 'is_premium']
    search_fields = ['title', 'title_nepali', 'description']
    inlines = [QuestionInline]
    ordering = ['-created_at']
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('title', 'title_nepali', 'description', 'category')
        }),
        ('Settings', {
            'fields': ('quiz_type', 'difficulty', 'time_limit', 'pass_percentage', 'show_answers', 'shuffle_questions')
        }),
        ('Rewards', {
            'fields': ('points_reward', 'coins_reward')
        }),
        ('Publishing', {
            'fields': ('is_published', 'is_premium')
        }),
    )
    
    actions = ['publish_quizzes', 'unpublish_quizzes']
    
    @admin.action(description='Publish selected quizzes')
    def publish_quizzes(self, request, queryset):
        count = queryset.update(is_published=True)
        self.message_user(request, f'{count} quiz(zes) published.')
    
    @admin.action(description='Unpublish selected quizzes')
    def unpublish_quizzes(self, request, queryset):
        count = queryset.update(is_published=False)
        self.message_user(request, f'{count} quiz(zes) unpublished.')


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    """Admin for Question model."""
    list_display = ['question_text_short', 'quiz', 'question_type', 'points', 'order', 'is_active']
    list_filter = ['question_type', 'is_active', 'quiz']
    search_fields = ['question_text', 'question_text_nepali']
    ordering = ['quiz', 'order']
    
    def question_text_short(self, obj):
        if len(obj.question_text) > 60:
            return obj.question_text[:60] + '...'
        return obj.question_text
    question_text_short.short_description = 'Question'


@admin.register(QuizResult)
class QuizResultAdmin(admin.ModelAdmin):
    """Admin for QuizResult model."""
    list_display = ['user', 'quiz', 'score', 'percentage', 'correct_answers', 'total_questions', 'passed', 'completed_at']
    list_filter = ['passed', 'completed_at', 'quiz']
    search_fields = ['user__username', 'user__email', 'quiz__title']
    readonly_fields = ['session_id', 'started_at', 'completed_at', 'answers', 'feedback']
    ordering = ['-completed_at']


# =============================================================================
# VILLAGE & BUILDING ADMIN
# =============================================================================

@admin.register(Village)
class VillageAdmin(admin.ModelAdmin):
    """Admin for Village model."""
    list_display = ['user', 'name', 'level', 'coins', 'knowledge_points', 'books', 'energy', 'building_count']
    list_filter = ['level']
    search_fields = ['user__username', 'user__email', 'name']
    inlines = [VillageBuildingInline]
    ordering = ['-level']
    
    def building_count(self, obj):
        return obj.buildings.count()
    building_count.short_description = 'Buildings'


@admin.register(BuildingType)
class BuildingTypeAdmin(admin.ModelAdmin):
    """Admin for BuildingType model."""
    list_display = ['name', 'name_nepali', 'slug', 'coin_cost', 'knowledge_cost', 'min_village_level', 'is_active']
    list_filter = ['is_active', 'min_village_level']
    search_fields = ['name', 'name_nepali', 'slug']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['min_village_level', 'name']


@admin.register(VillageBuilding)
class VillageBuildingAdmin(admin.ModelAdmin):
    """Admin for VillageBuilding model."""
    list_display = ['building_type', 'village', 'position_x', 'position_y', 'level', 'is_upgrading']
    list_filter = ['building_type', 'level', 'is_upgrading']
    search_fields = ['village__user__username', 'building_type__name']
    ordering = ['-created_at']


# =============================================================================
# QUEST ADMIN
# =============================================================================

@admin.register(Quest)
class QuestAdmin(admin.ModelAdmin):
    """Admin for Quest model."""
    list_display = ['name', 'quest_type', 'category', 'difficulty', 'min_level', 'points_reward', 'is_active']
    list_filter = ['quest_type', 'category', 'difficulty', 'is_active']
    search_fields = ['name', 'name_nepali', 'description']
    ordering = ['quest_type', '-created_at']
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('name', 'name_nepali', 'description', 'description_nepali')
        }),
        ('Settings', {
            'fields': ('quest_type', 'category', 'difficulty', 'min_level', 'prerequisite_quest')
        }),
        ('Requirements', {
            'fields': ('requirements',),
            'classes': ('collapse',)
        }),
        ('Rewards', {
            'fields': ('points_reward', 'coins_reward', 'experience_reward', 'additional_rewards')
        }),
        ('Scheduling', {
            'fields': ('is_active', 'start_date', 'end_date')
        }),
    )
    
    actions = ['activate_quests', 'deactivate_quests']
    
    @admin.action(description='Activate selected quests')
    def activate_quests(self, request, queryset):
        count = queryset.update(is_active=True)
        self.message_user(request, f'{count} quest(s) activated.')
    
    @admin.action(description='Deactivate selected quests')
    def deactivate_quests(self, request, queryset):
        count = queryset.update(is_active=False)
        self.message_user(request, f'{count} quest(s) deactivated.')


@admin.register(QuestProgress)
class QuestProgressAdmin(admin.ModelAdmin):
    """Admin for QuestProgress model."""
    list_display = ['user', 'quest', 'status', 'progress_percentage', 'rewards_claimed', 'completed_at']
    list_filter = ['status', 'rewards_claimed']
    search_fields = ['user__username', 'user__email', 'quest__name']
    readonly_fields = ['started_at', 'completed_at', 'created_at', 'updated_at']
    ordering = ['-updated_at']


# =============================================================================
# ACHIEVEMENT & BADGE ADMIN
# =============================================================================

@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    """Admin for Achievement model."""
    list_display = ['name', 'rarity', 'rarity_color', 'points_reward', 'coins_reward', 'is_hidden', 'is_active']
    list_filter = ['rarity', 'is_hidden', 'is_active']
    search_fields = ['name', 'name_nepali', 'description']
    ordering = ['rarity', 'name']
    
    def rarity_color(self, obj):
        colors = {
            'common': '#9e9e9e',
            'uncommon': '#4caf50',
            'rare': '#2196f3',
            'epic': '#9c27b0',
            'legendary': '#ff9800',
        }
        color = colors.get(obj.rarity, '#000')
        return format_html('<span style="color: {}; font-weight: bold;">●</span>', color)
    rarity_color.short_description = ''


@admin.register(UserAchievement)
class UserAchievementAdmin(admin.ModelAdmin):
    """Admin for UserAchievement model."""
    list_display = ['user', 'achievement', 'earned_at', 'rewards_claimed', 'claimed_at']
    list_filter = ['rewards_claimed', 'earned_at']
    search_fields = ['user__username', 'user__email', 'achievement__name']
    ordering = ['-earned_at']


@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    """Admin for Badge model."""
    list_display = ['name', 'badge_type', 'is_active', 'created_at']
    list_filter = ['badge_type', 'is_active']
    search_fields = ['name', 'name_nepali', 'description']
    ordering = ['badge_type', 'name']


@admin.register(UserBadge)
class UserBadgeAdmin(admin.ModelAdmin):
    """Admin for UserBadge model."""
    list_display = ['user', 'badge', 'earned_at']
    list_filter = ['earned_at', 'badge']
    search_fields = ['user__username', 'user__email', 'badge__name']
    ordering = ['-earned_at']


# =============================================================================
# WRITING ADMIN
# =============================================================================

@admin.register(WritingPrompt)
class WritingPromptAdmin(admin.ModelAdmin):
    """Admin for WritingPrompt model."""
    list_display = ['title', 'prompt_type', 'difficulty', 'min_words', 'max_words', 'is_active']
    list_filter = ['prompt_type', 'difficulty', 'is_active']
    search_fields = ['title', 'title_nepali', 'description']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('title', 'title_nepali', 'description', 'description_nepali')
        }),
        ('Settings', {
            'fields': ('prompt_type', 'difficulty', 'min_words', 'max_words')
        }),
        ('Content', {
            'fields': ('guidelines', 'examples'),
            'classes': ('collapse',)
        }),
        ('Rewards', {
            'fields': ('points_reward', 'coins_reward')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )


@admin.register(WritingSubmission)
class WritingSubmissionAdmin(admin.ModelAdmin):
    """Admin for WritingSubmission model."""
    list_display = ['user', 'prompt', 'title', 'status', 'score', 'word_count', 'submitted_at']
    list_filter = ['status', 'submitted_at']
    search_fields = ['user__username', 'user__email', 'prompt__title', 'title']
    readonly_fields = ['submitted_at', 'reviewed_at', 'created_at', 'updated_at']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Submission Info', {
            'fields': ('user', 'prompt', 'title', 'status')
        }),
        ('Content', {
            'fields': ('content', 'word_count', 'time_spent')
        }),
        ('Scoring', {
            'fields': ('score', 'grammar_score', 'vocabulary_score', 'structure_score', 'creativity_score')
        }),
        ('Feedback', {
            'fields': ('feedback', 'suggestions', 'corrections'),
            'classes': ('collapse',)
        }),
        ('Rewards', {
            'fields': ('points_earned', 'coins_earned')
        }),
        ('Timestamps', {
            'fields': ('submitted_at', 'reviewed_at', 'created_at', 'updated_at')
        }),
    )
    
    actions = ['mark_as_reviewed']
    
    @admin.action(description='Mark as reviewed')
    def mark_as_reviewed(self, request, queryset):
        from django.utils import timezone
        count = queryset.update(status='reviewed', reviewed_at=timezone.now())
        self.message_user(request, f'{count} submission(s) marked as reviewed.')


# =============================================================================
# GAME ADMIN
# =============================================================================

@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    """Admin for Game model."""
    list_display = ['name', 'game_type', 'difficulty', 'base_points', 'base_coins', 'is_featured', 'is_active']
    list_filter = ['game_type', 'difficulty', 'is_featured', 'is_active']
    search_fields = ['name', 'name_nepali', 'description']
    ordering = ['-is_featured', 'name']
    
    actions = ['feature_games', 'unfeature_games']
    
    @admin.action(description='Feature selected games')
    def feature_games(self, request, queryset):
        count = queryset.update(is_featured=True)
        self.message_user(request, f'{count} game(s) featured.')
    
    @admin.action(description='Unfeature selected games')
    def unfeature_games(self, request, queryset):
        count = queryset.update(is_featured=False)
        self.message_user(request, f'{count} game(s) unfeatured.')


@admin.register(GameSession)
class GameSessionAdmin(admin.ModelAdmin):
    """Admin for GameSession model."""
    list_display = ['user', 'game', 'score', 'high_score', 'points_earned', 'coins_earned', 'ended_at']
    list_filter = ['game', 'high_score', 'ended_at']
    search_fields = ['user__username', 'user__email', 'game__name']
    readonly_fields = ['started_at', 'ended_at']
    ordering = ['-ended_at']


@admin.register(Leaderboard)
class LeaderboardAdmin(admin.ModelAdmin):
    """Admin for Leaderboard model."""
    list_display = ['user', 'leaderboard_type', 'period', 'rank', 'score', 'period_start', 'period_end']
    list_filter = ['leaderboard_type', 'period']
    search_fields = ['user__username', 'user__email']
    ordering = ['leaderboard_type', 'period', 'rank']

