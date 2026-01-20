"""
Serializers for the learning_vyakaran app.
Handles lessons, quizzes, gamification, and content.
"""

from rest_framework import serializers
from .models import (
    Category, Lesson, LessonProgress, Quiz, Question, QuizResult,
    Village, BuildingType, VillageBuilding,
    Quest, QuestProgress,
    Achievement, UserAchievement, Badge, UserBadge,
    WritingPrompt, WritingSubmission,
    Game, GameSession, Leaderboard
)


# =============================================================================
# CATEGORY & LESSON SERIALIZERS
# =============================================================================

class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model."""
    lesson_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'name_nepali', 'slug', 'description', 'icon', 'color', 'order', 'lesson_count']
    
    def get_lesson_count(self, obj):
        return obj.lessons.filter(is_published=True).count()


class LessonListSerializer(serializers.ModelSerializer):
    """Serializer for listing lessons."""
    category = CategorySerializer(read_only=True)
    is_locked = serializers.SerializerMethodField()
    user_progress = serializers.SerializerMethodField()
    
    class Meta:
        model = Lesson
        fields = [
            'id', 'title', 'title_nepali', 'slug', 'description', 'description_nepali',
            'category', 'level', 'difficulty', 'order',
            'points_reward', 'coins_reward', 'estimated_time',
            'is_published', 'is_premium', 'is_locked', 'user_progress'
        ]
    
    def get_is_locked(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return True
        
        # Check if all prerequisites are completed
        user_game_state = getattr(request.user, 'game_state', None)
        if not user_game_state:
            return obj.prerequisites.exists()
        
        completed = user_game_state.completed_lessons or []
        for prereq in obj.prerequisites.all():
            if str(prereq.id) not in completed:
                return True
        return False
    
    def get_user_progress(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        
        try:
            progress = LessonProgress.objects.get(user=request.user, lesson=obj)
            return {
                'status': progress.status,
                'score': progress.score,
                'best_score': progress.best_score,
                'attempts': progress.attempts
            }
        except LessonProgress.DoesNotExist:
            return None


class LessonDetailSerializer(serializers.ModelSerializer):
    """Serializer for lesson details."""
    category = CategorySerializer(read_only=True)
    prerequisites = LessonListSerializer(many=True, read_only=True)
    is_locked = serializers.SerializerMethodField()
    
    class Meta:
        model = Lesson
        fields = [
            'id', 'title', 'title_nepali', 'slug', 'description', 'description_nepali',
            'category', 'level', 'difficulty', 'order',
            'content', 'examples', 'explanations', 'media', 'exercises',
            'prerequisites', 'points_reward', 'coins_reward', 'estimated_time',
            'is_published', 'is_premium', 'is_locked',
            'created_at', 'updated_at'
        ]
    
    def get_is_locked(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return True
        
        user_game_state = getattr(request.user, 'game_state', None)
        if not user_game_state:
            return obj.prerequisites.exists()
        
        completed = user_game_state.completed_lessons or []
        for prereq in obj.prerequisites.all():
            if str(prereq.id) not in completed:
                return True
        return False


class LessonContentSerializer(serializers.ModelSerializer):
    """Serializer for lesson content only."""
    
    class Meta:
        model = Lesson
        fields = ['id', 'content', 'examples', 'explanations', 'media']


class LessonProgressSerializer(serializers.ModelSerializer):
    """Serializer for LessonProgress model."""
    lesson = LessonListSerializer(read_only=True)
    
    class Meta:
        model = LessonProgress
        fields = [
            'id', 'lesson', 'status', 'score', 'best_score',
            'time_spent', 'attempts', 'started_at', 'completed_at',
            'created_at', 'updated_at'
        ]


class StartLessonSerializer(serializers.Serializer):
    """Serializer for starting a lesson."""
    session_id = serializers.CharField(read_only=True)
    start_time = serializers.DateTimeField(read_only=True)


class CompleteLessonInputSerializer(serializers.Serializer):
    """Serializer for completing a lesson."""
    session_id = serializers.CharField(required=False, allow_blank=True)
    score = serializers.IntegerField(min_value=0, max_value=100, required=True)
    time_spent = serializers.IntegerField(min_value=0, required=True)
    answers = serializers.ListField(required=True)


# =============================================================================
# QUIZ SERIALIZERS
# =============================================================================

class QuestionSerializer(serializers.ModelSerializer):
    """Serializer for Question model."""
    
    class Meta:
        model = Question
        fields = [
            'id', 'question_type', 'question_text', 'question_text_nepali',
            'options', 'hint', 'media', 'points', 'order'
        ]
        # Don't expose correct_answer in list view


class QuestionWithAnswerSerializer(serializers.ModelSerializer):
    """Serializer for Question with correct answer (for results)."""
    
    class Meta:
        model = Question
        fields = [
            'id', 'question_type', 'question_text', 'question_text_nepali',
            'options', 'correct_answer', 'explanation', 'explanation_nepali',
            'hint', 'media', 'points', 'order'
        ]


class QuizListSerializer(serializers.ModelSerializer):
    """Serializer for listing quizzes."""
    category = CategorySerializer(read_only=True)
    question_count = serializers.ReadOnlyField()
    
    class Meta:
        model = Quiz
        fields = [
            'id', 'title', 'title_nepali', 'description',
            'category', 'quiz_type', 'difficulty',
            'time_limit', 'pass_percentage', 'question_count',
            'points_reward', 'coins_reward',
            'is_published', 'is_premium'
        ]


class QuizDetailSerializer(serializers.ModelSerializer):
    """Serializer for quiz details with questions."""
    category = CategorySerializer(read_only=True)
    questions = QuestionSerializer(many=True, read_only=True)
    question_count = serializers.ReadOnlyField()
    
    class Meta:
        model = Quiz
        fields = [
            'id', 'title', 'title_nepali', 'description',
            'category', 'quiz_type', 'difficulty',
            'time_limit', 'pass_percentage', 'show_answers', 'shuffle_questions',
            'question_count', 'questions',
            'points_reward', 'coins_reward',
            'is_published', 'is_premium',
            'created_at', 'updated_at'
        ]


class StartQuizSerializer(serializers.Serializer):
    """Serializer for starting a quiz."""
    session_id = serializers.CharField(read_only=True)
    start_time = serializers.DateTimeField(read_only=True)


class SubmitQuizSerializer(serializers.Serializer):
    """Serializer for submitting quiz answers."""
    session_id = serializers.CharField(required=True)
    answers = serializers.ListField(required=True)
    time_spent = serializers.IntegerField(min_value=0, required=True)


class QuizResultSerializer(serializers.ModelSerializer):
    """Serializer for QuizResult model."""
    quiz = QuizListSerializer(read_only=True)
    
    class Meta:
        model = QuizResult
        fields = [
            'id', 'quiz', 'score', 'percentage',
            'correct_answers', 'total_questions', 'time_spent',
            'passed', 'points_earned', 'coins_earned',
            'started_at', 'completed_at'
        ]


class QuizResultDetailSerializer(serializers.ModelSerializer):
    """Serializer for detailed quiz results with answers."""
    quiz = QuizDetailSerializer(read_only=True)
    
    class Meta:
        model = QuizResult
        fields = [
            'id', 'quiz', 'score', 'percentage',
            'correct_answers', 'total_questions', 'time_spent',
            'answers', 'feedback', 'passed',
            'points_earned', 'coins_earned',
            'started_at', 'completed_at'
        ]


# =============================================================================
# ASSESSMENT SERIALIZERS
# =============================================================================

class GrammarAssessmentSerializer(serializers.Serializer):
    """Serializer for grammar assessment."""
    question_id = serializers.UUIDField(required=True)
    answer = serializers.CharField(required=True)


class VocabularyAssessmentSerializer(serializers.Serializer):
    """Serializer for vocabulary assessment."""
    question_id = serializers.UUIDField(required=True)
    answer = serializers.CharField(required=True)


# =============================================================================
# VILLAGE SERIALIZERS
# =============================================================================

class BuildingTypeSerializer(serializers.ModelSerializer):
    """Serializer for BuildingType model."""
    
    class Meta:
        model = BuildingType
        fields = [
            'id', 'name', 'name_nepali', 'slug', 'description',
            'icon', 'size_width', 'size_height',
            'coin_cost', 'knowledge_cost', 'benefits',
            'min_village_level', 'max_count', 'is_active'
        ]


class VillageBuildingSerializer(serializers.ModelSerializer):
    """Serializer for VillageBuilding model."""
    building_type = BuildingTypeSerializer(read_only=True)
    
    class Meta:
        model = VillageBuilding
        fields = [
            'id', 'building_type', 'position_x', 'position_y',
            'level', 'is_upgrading', 'upgrade_complete_at',
            'created_at', 'updated_at'
        ]


class VillageSerializer(serializers.ModelSerializer):
    """Serializer for Village model."""
    buildings = VillageBuildingSerializer(many=True, read_only=True)
    
    class Meta:
        model = Village
        fields = [
            'id', 'name', 'level', 'experience',
            'grid_width', 'grid_height',
            'coins', 'knowledge_points', 'books', 'energy', 'max_energy',
            'buildings', 'building_data', 'decorations',
            'created_at', 'updated_at'
        ]


class AddBuildingSerializer(serializers.Serializer):
    """Serializer for adding a building."""
    building_type = serializers.SlugField(required=True)
    position = serializers.DictField(required=True)  # {x, y}
    level = serializers.IntegerField(default=1)


class UpgradeBuildingSerializer(serializers.Serializer):
    """Serializer for upgrading a building."""
    target_level = serializers.IntegerField(required=True)


class UpdateResourcesSerializer(serializers.Serializer):
    """Serializer for updating village resources."""
    coins = serializers.IntegerField(required=False)
    knowledge = serializers.IntegerField(required=False)
    books = serializers.IntegerField(required=False)
    energy = serializers.IntegerField(required=False)
    operation = serializers.ChoiceField(choices=['add', 'subtract'], required=True)


# =============================================================================
# QUEST SERIALIZERS
# =============================================================================

class QuestListSerializer(serializers.ModelSerializer):
    """Serializer for listing quests."""
    user_progress = serializers.SerializerMethodField()
    
    class Meta:
        model = Quest
        fields = [
            'id', 'name', 'name_nepali', 'description',
            'quest_type', 'category', 'difficulty', 'min_level',
            'points_reward', 'coins_reward', 'experience_reward',
            'is_active', 'start_date', 'end_date', 'user_progress'
        ]
    
    def get_user_progress(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        
        try:
            progress = QuestProgress.objects.get(user=request.user, quest=obj)
            return {
                'status': progress.status,
                'progress_percentage': progress.progress_percentage,
                'rewards_claimed': progress.rewards_claimed
            }
        except QuestProgress.DoesNotExist:
            return None


class QuestDetailSerializer(serializers.ModelSerializer):
    """Serializer for quest details."""
    prerequisite_quest = QuestListSerializer(read_only=True)
    
    class Meta:
        model = Quest
        fields = [
            'id', 'name', 'name_nepali', 'description', 'description_nepali',
            'quest_type', 'category', 'difficulty', 'min_level',
            'requirements', 'points_reward', 'coins_reward',
            'experience_reward', 'additional_rewards',
            'prerequisite_quest', 'is_active', 'start_date', 'end_date',
            'created_at', 'updated_at'
        ]


class QuestProgressSerializer(serializers.ModelSerializer):
    """Serializer for QuestProgress model."""
    quest = QuestListSerializer(read_only=True)
    
    class Meta:
        model = QuestProgress
        fields = [
            'id', 'quest', 'status', 'progress', 'progress_percentage',
            'started_at', 'completed_at', 'rewards_claimed',
            'created_at', 'updated_at'
        ]


class CompleteQuestSerializer(serializers.Serializer):
    """Serializer for completing a quest."""
    session_id = serializers.CharField(required=True)
    results = serializers.DictField(required=True)


# =============================================================================
# ACHIEVEMENT & BADGE SERIALIZERS
# =============================================================================

class AchievementSerializer(serializers.ModelSerializer):
    """Serializer for Achievement model."""
    is_earned = serializers.SerializerMethodField()
    
    class Meta:
        model = Achievement
        fields = [
            'id', 'name', 'name_nepali', 'description', 'description_nepali',
            'icon', 'rarity', 'criteria',
            'points_reward', 'coins_reward',
            'is_hidden', 'is_active', 'is_earned'
        ]
    
    def get_is_earned(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return UserAchievement.objects.filter(user=request.user, achievement=obj).exists()


class UserAchievementSerializer(serializers.ModelSerializer):
    """Serializer for UserAchievement model."""
    achievement = AchievementSerializer(read_only=True)
    
    class Meta:
        model = UserAchievement
        fields = ['id', 'achievement', 'earned_at', 'rewards_claimed', 'claimed_at']


class BadgeSerializer(serializers.ModelSerializer):
    """Serializer for Badge model."""
    is_earned = serializers.SerializerMethodField()
    
    class Meta:
        model = Badge
        fields = [
            'id', 'name', 'name_nepali', 'description',
            'icon', 'badge_type', 'criteria', 'is_active', 'is_earned'
        ]
    
    def get_is_earned(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return UserBadge.objects.filter(user=request.user, badge=obj).exists()


class UserBadgeSerializer(serializers.ModelSerializer):
    """Serializer for UserBadge model."""
    badge = BadgeSerializer(read_only=True)
    
    class Meta:
        model = UserBadge
        fields = ['id', 'badge', 'earned_at']


# =============================================================================
# WRITING SERIALIZERS
# =============================================================================

class WritingPromptListSerializer(serializers.ModelSerializer):
    """Serializer for listing writing prompts."""
    
    class Meta:
        model = WritingPrompt
        fields = [
            'id', 'title', 'title_nepali', 'description', 'description_nepali',
            'prompt_type', 'difficulty', 'min_words', 'max_words',
            'points_reward', 'coins_reward', 'is_active'
        ]


class WritingPromptDetailSerializer(serializers.ModelSerializer):
    """Serializer for writing prompt details."""
    
    class Meta:
        model = WritingPrompt
        fields = [
            'id', 'title', 'title_nepali', 'description', 'description_nepali',
            'prompt_type', 'difficulty', 'guidelines', 'examples',
            'min_words', 'max_words', 'points_reward', 'coins_reward',
            'is_active', 'created_at'
        ]


class WritingSubmissionSerializer(serializers.ModelSerializer):
    """Serializer for WritingSubmission model."""
    prompt = WritingPromptListSerializer(read_only=True)
    
    class Meta:
        model = WritingSubmission
        fields = [
            'id', 'prompt', 'title', 'content', 'word_count',
            'status', 'score', 'grammar_score', 'vocabulary_score',
            'structure_score', 'creativity_score',
            'feedback', 'suggestions', 'corrections',
            'points_earned', 'coins_earned', 'time_spent',
            'submitted_at', 'reviewed_at', 'created_at', 'updated_at'
        ]


class SubmitWritingSerializer(serializers.Serializer):
    """Serializer for submitting writing."""
    prompt_id = serializers.UUIDField(required=True)
    content = serializers.CharField(required=True)
    word_count = serializers.IntegerField(min_value=0, required=True)
    time_spent = serializers.IntegerField(min_value=0, required=True)


class SaveDraftSerializer(serializers.Serializer):
    """Serializer for saving draft."""
    prompt_id = serializers.UUIDField(required=True)
    content = serializers.CharField(required=True)
    title = serializers.CharField(required=False, allow_blank=True)


class GrammarCheckSerializer(serializers.Serializer):
    """Serializer for grammar check."""
    text = serializers.CharField(required=True)


# =============================================================================
# GAME SERIALIZERS
# =============================================================================

class GameListSerializer(serializers.ModelSerializer):
    """Serializer for listing games."""
    user_high_score = serializers.SerializerMethodField()
    
    class Meta:
        model = Game
        fields = [
            'id', 'name', 'name_nepali', 'description',
            'game_type', 'difficulty', 'instructions',
            'base_points', 'base_coins',
            'is_active', 'is_featured', 'user_high_score'
        ]
    
    def get_user_high_score(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 0
        
        session = GameSession.objects.filter(
            user=request.user, game=obj
        ).order_by('-score').first()
        
        return session.score if session else 0


class GameDetailSerializer(serializers.ModelSerializer):
    """Serializer for game details."""
    
    class Meta:
        model = Game
        fields = [
            'id', 'name', 'name_nepali', 'description',
            'game_type', 'difficulty',
            'instructions', 'instructions_nepali', 'settings',
            'base_points', 'base_coins',
            'is_active', 'is_featured', 'created_at'
        ]


class StartGameSerializer(serializers.Serializer):
    """Serializer for starting a game."""
    session_id = serializers.CharField(read_only=True)
    start_time = serializers.DateTimeField(read_only=True)


class EndGameSerializer(serializers.Serializer):
    """Serializer for ending a game."""
    session_id = serializers.UUIDField(required=True)
    score = serializers.IntegerField(min_value=0, required=True)
    stats = serializers.DictField(required=True)
    time_spent = serializers.IntegerField(min_value=0, required=True)


class GameSessionSerializer(serializers.ModelSerializer):
    """Serializer for GameSession model."""
    game = GameListSerializer(read_only=True)
    
    class Meta:
        model = GameSession
        fields = [
            'id', 'game', 'score', 'high_score', 'stats',
            'time_spent', 'points_earned', 'coins_earned',
            'started_at', 'ended_at'
        ]


class GameLeaderboardSerializer(serializers.Serializer):
    """Serializer for game leaderboard entries."""
    rank = serializers.IntegerField()
    user_id = serializers.UUIDField()
    username = serializers.CharField()
    avatar = serializers.CharField(allow_null=True)
    score = serializers.IntegerField()


# =============================================================================
# ADMIN SERIALIZERS
# =============================================================================

class BulkUploadSerializer(serializers.Serializer):
    """Serializer for bulk upload."""
    type = serializers.ChoiceField(choices=['lessons', 'quizzes', 'questions'])
    data = serializers.ListField(child=serializers.DictField())
