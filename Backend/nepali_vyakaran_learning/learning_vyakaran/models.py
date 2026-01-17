"""
Models for the learning_vyakaran app.
Handles lessons, quizzes, gamification, achievements, and content management.
"""

import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone


# =============================================================================
# LESSON & QUIZ MODELS
# =============================================================================

class Category(models.Model):
    """
    Categories for organizing lessons and quizzes.
    """
    name = models.CharField(max_length=100)
    name_nepali = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)  # Icon class name
    color = models.CharField(max_length=20, default='#667eea')
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'
        ordering = ['order', 'name']
    
    def __str__(self):
        return self.name


class Lesson(models.Model):
    """
    Learning lessons with content and exercises.
    """
    DIFFICULTY_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    title_nepali = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    description_nepali = models.TextField(blank=True)
    
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        related_name='lessons'
    )
    
    # Lesson metadata
    level = models.PositiveIntegerField(default=1)
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='beginner')
    order = models.PositiveIntegerField(default=0)
    
    # Content (JSON structure for flexibility)
    content = models.JSONField(default=dict)  # Main lesson content
    examples = models.JSONField(default=list)  # Example sentences
    explanations = models.JSONField(default=list)  # Grammar explanations
    media = models.JSONField(default=list)  # Media attachments
    
    # Exercise/Quiz questions embedded in lesson
    exercises = models.JSONField(default=list)
    
    # Requirements and rewards
    prerequisites = models.ManyToManyField(
        'self',
        symmetrical=False,
        blank=True,
        related_name='unlocks'
    )
    points_reward = models.PositiveIntegerField(default=10)
    coins_reward = models.PositiveIntegerField(default=5)
    estimated_time = models.PositiveIntegerField(default=10)  # in minutes
    
    # Publishing
    is_published = models.BooleanField(default=False)
    is_premium = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Lesson'
        verbose_name_plural = 'Lessons'
        ordering = ['category', 'order', 'level']
    
    def __str__(self):
        return f"{self.title} ({self.category})"


class LessonProgress(models.Model):
    """
    Tracks user progress through lessons.
    """
    STATUS_CHOICES = [
        ('not_started', 'Not Started'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='lesson_progress'
    )
    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name='user_progress'
    )
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_started')
    score = models.PositiveIntegerField(default=0)
    best_score = models.PositiveIntegerField(default=0)
    time_spent = models.PositiveIntegerField(default=0)  # in seconds
    attempts = models.PositiveIntegerField(default=0)
    
    # Session tracking
    session_id = models.CharField(max_length=100, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Progress data
    progress_data = models.JSONField(default=dict)  # Stores exercise answers, etc.
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Lesson Progress'
        verbose_name_plural = 'Lesson Progress'
        unique_together = ['user', 'lesson']
    
    def __str__(self):
        return f"{self.user.username} - {self.lesson.title} ({self.status})"


class Quiz(models.Model):
    """
    Standalone quizzes or assessments.
    """
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]
    
    QUIZ_TYPE_CHOICES = [
        ('practice', 'Practice'),
        ('assessment', 'Assessment'),
        ('daily', 'Daily Challenge'),
        ('weekly', 'Weekly Challenge'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    title_nepali = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        related_name='quizzes'
    )
    
    quiz_type = models.CharField(max_length=20, choices=QUIZ_TYPE_CHOICES, default='practice')
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='medium')
    
    # Quiz settings
    time_limit = models.PositiveIntegerField(default=0)  # 0 = no limit, in seconds
    pass_percentage = models.PositiveIntegerField(default=60)
    show_answers = models.BooleanField(default=True)  # Show correct answers after quiz
    shuffle_questions = models.BooleanField(default=True)
    
    # Rewards
    points_reward = models.PositiveIntegerField(default=20)
    coins_reward = models.PositiveIntegerField(default=10)
    
    # Publishing
    is_published = models.BooleanField(default=False)
    is_premium = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Quiz'
        verbose_name_plural = 'Quizzes'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    @property
    def question_count(self):
        return self.questions.count()


class Question(models.Model):
    """
    Questions for quizzes and assessments.
    """
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]

    QUESTION_TYPE_CHOICES = [
        ('multiple_choice', 'Multiple Choice'),
        ('true_false', 'True/False'),
        ('fill_blank', 'Fill in the Blank'),
        ('matching', 'Matching'),
        ('ordering', 'Ordering'),
        ('short_answer', 'Short Answer'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name='questions'
    )
    
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='medium')
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPE_CHOICES, default='multiple_choice')
    question_text = models.TextField()
    question_text_nepali = models.TextField(blank=True)
    
    # For multiple choice, matching, etc.
    options = models.JSONField(default=list)
    correct_answer = models.JSONField(default=dict)  # Can be string, list, or dict based on type
    
    # Additional content
    explanation = models.TextField(blank=True)
    explanation_nepali = models.TextField(blank=True)
    hint = models.TextField(blank=True)
    media = models.JSONField(default=dict)  # Image, audio, etc.
    
    # Scoring
    points = models.PositiveIntegerField(default=1)
    order = models.PositiveIntegerField(default=0)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Question'
        verbose_name_plural = 'Questions'
        ordering = ['quiz', 'order']
    
    def __str__(self):
        return f"Q: {self.question_text[:50]}..."


class QuizResult(models.Model):
    """
    Stores user quiz results and attempts.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='quiz_results'
    )
    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name='results'
    )
    
    # Results
    score = models.PositiveIntegerField(default=0)
    percentage = models.FloatField(default=0)
    correct_answers = models.PositiveIntegerField(default=0)
    total_questions = models.PositiveIntegerField(default=0)
    time_spent = models.PositiveIntegerField(default=0)  # in seconds
    
    # Session tracking
    session_id = models.CharField(max_length=100)
    started_at = models.DateTimeField()
    completed_at = models.DateTimeField(auto_now_add=True)
    
    # Answer data
    answers = models.JSONField(default=list)  # User's answers
    feedback = models.JSONField(default=list)  # Feedback for each answer
    
    # Rewards
    points_earned = models.PositiveIntegerField(default=0)
    coins_earned = models.PositiveIntegerField(default=0)
    
    passed = models.BooleanField(default=False)
    
    class Meta:
        verbose_name = 'Quiz Result'
        verbose_name_plural = 'Quiz Results'
        ordering = ['-completed_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.quiz.title}: {self.score}%"


# =============================================================================
# GAMIFICATION MODELS - VILLAGE SYSTEM
# =============================================================================

class Village(models.Model):
    """
    User's village for gamification.
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='village'
    )
    
    name = models.CharField(max_length=100, default='My Village')
    level = models.PositiveIntegerField(default=1)
    experience = models.PositiveIntegerField(default=0)
    
    # Grid settings
    grid_width = models.PositiveIntegerField(default=10)
    grid_height = models.PositiveIntegerField(default=10)
    
    # Resources
    coins = models.PositiveIntegerField(default=100)
    knowledge_points = models.PositiveIntegerField(default=0)
    books = models.PositiveIntegerField(default=0)
    energy = models.PositiveIntegerField(default=100)
    max_energy = models.PositiveIntegerField(default=100)
    
    # Village data
    building_data = models.JSONField(default=list)  # List of placed buildings
    decorations = models.JSONField(default=list)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Village'
        verbose_name_plural = 'Villages'
    
    def __str__(self):
        return f"{self.user.username}'s Village - Level {self.level}"


class BuildingType(models.Model):
    """
    Types of buildings available for villages.
    """
    name = models.CharField(max_length=100)
    name_nepali = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    
    # Visual
    icon = models.CharField(max_length=100)  # Icon/sprite name
    size_width = models.PositiveIntegerField(default=1)
    size_height = models.PositiveIntegerField(default=1)
    
    # Cost to build
    coin_cost = models.PositiveIntegerField(default=0)
    knowledge_cost = models.PositiveIntegerField(default=0)
    
    # Benefits
    benefits = models.JSONField(default=dict)
    
    # Requirements
    min_village_level = models.PositiveIntegerField(default=1)
    max_count = models.PositiveIntegerField(default=0)  # 0 = unlimited
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Building Type'
        verbose_name_plural = 'Building Types'
        ordering = ['min_village_level', 'name']
    
    def __str__(self):
        return self.name


class VillageBuilding(models.Model):
    """
    Buildings placed in user's village.
    """
    village = models.ForeignKey(
        Village,
        on_delete=models.CASCADE,
        related_name='buildings'
    )
    building_type = models.ForeignKey(
        BuildingType,
        on_delete=models.CASCADE,
        related_name='instances'
    )
    
    # Position on grid
    position_x = models.PositiveIntegerField(default=0)
    position_y = models.PositiveIntegerField(default=0)
    
    level = models.PositiveIntegerField(default=1)
    is_upgrading = models.BooleanField(default=False)
    upgrade_complete_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Village Building'
        verbose_name_plural = 'Village Buildings'
    
    def __str__(self):
        return f"{self.building_type.name} in {self.village.user.username}'s village"


# =============================================================================
# QUEST SYSTEM
# =============================================================================

class Quest(models.Model):
    """
    Quests for users to complete.
    """
    QUEST_TYPE_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('story', 'Story'),
        ('special', 'Special Event'),
    ]
    
    QUEST_CATEGORY_CHOICES = [
        ('grammar', 'Grammar'),
        ('vocabulary', 'Vocabulary'),
        ('writing', 'Writing'),
        ('reading', 'Reading'),
        ('general', 'General'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    name_nepali = models.CharField(max_length=255, blank=True)
    description = models.TextField()
    description_nepali = models.TextField(blank=True)
    
    quest_type = models.CharField(max_length=20, choices=QUEST_TYPE_CHOICES, default='daily')
    category = models.CharField(max_length=20, choices=QUEST_CATEGORY_CHOICES, default='general')
    difficulty = models.CharField(max_length=20, default='medium')
    
    # Requirements
    requirements = models.JSONField(default=dict)
    min_level = models.PositiveIntegerField(default=1)
    
    # Rewards
    points_reward = models.PositiveIntegerField(default=50)
    coins_reward = models.PositiveIntegerField(default=25)
    experience_reward = models.PositiveIntegerField(default=20)
    additional_rewards = models.JSONField(default=dict)
    
    # Quest chain
    prerequisite_quest = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='next_quests'
    )
    
    # Scheduling
    is_active = models.BooleanField(default=True)
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Quest'
        verbose_name_plural = 'Quests'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.quest_type})"


class QuestProgress(models.Model):
    """
    Tracks user progress on quests.
    """
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('expired', 'Expired'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='quest_progress'
    )
    quest = models.ForeignKey(
        Quest,
        on_delete=models.CASCADE,
        related_name='user_progress'
    )
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    progress = models.JSONField(default=dict)  # Progress on each requirement
    progress_percentage = models.FloatField(default=0)
    
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    rewards_claimed = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Quest Progress'
        verbose_name_plural = 'Quest Progress'
        unique_together = ['user', 'quest']
    
    def __str__(self):
        return f"{self.user.username} - {self.quest.name} ({self.status})"


# =============================================================================
# ACHIEVEMENTS & BADGES
# =============================================================================

class Achievement(models.Model):
    """
    Achievements that users can earn.
    """
    RARITY_CHOICES = [
        ('common', 'Common'),
        ('uncommon', 'Uncommon'),
        ('rare', 'Rare'),
        ('epic', 'Epic'),
        ('legendary', 'Legendary'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    name_nepali = models.CharField(max_length=100, blank=True)
    description = models.TextField()
    description_nepali = models.TextField(blank=True)
    
    icon = models.CharField(max_length=100)
    rarity = models.CharField(max_length=20, choices=RARITY_CHOICES, default='common')
    
    # Criteria (JSON for flexibility)
    criteria = models.JSONField(default=dict)
    
    # Rewards
    points_reward = models.PositiveIntegerField(default=100)
    coins_reward = models.PositiveIntegerField(default=50)
    
    # Hidden achievements (surprise unlocks)
    is_hidden = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Achievement'
        verbose_name_plural = 'Achievements'
        ordering = ['rarity', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.rarity})"


class UserAchievement(models.Model):
    """
    Achievements earned by users.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='earned_achievements'
    )
    achievement = models.ForeignKey(
        Achievement,
        on_delete=models.CASCADE,
        related_name='earned_by'
    )
    
    earned_at = models.DateTimeField(auto_now_add=True)
    rewards_claimed = models.BooleanField(default=False)
    claimed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = 'User Achievement'
        verbose_name_plural = 'User Achievements'
        unique_together = ['user', 'achievement']
    
    def __str__(self):
        return f"{self.user.username} earned {self.achievement.name}"


class Badge(models.Model):
    """
    Badges for special accomplishments.
    """
    BADGE_TYPE_CHOICES = [
        ('skill', 'Skill Badge'),
        ('milestone', 'Milestone Badge'),
        ('special', 'Special Badge'),
        ('event', 'Event Badge'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    name_nepali = models.CharField(max_length=100, blank=True)
    description = models.TextField()
    
    icon = models.CharField(max_length=100)
    badge_type = models.CharField(max_length=20, choices=BADGE_TYPE_CHOICES, default='skill')
    
    # Criteria
    criteria = models.JSONField(default=dict)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Badge'
        verbose_name_plural = 'Badges'
        ordering = ['badge_type', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.badge_type})"


class UserBadge(models.Model):
    """
    Badges earned by users.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='earned_badges'
    )
    badge = models.ForeignKey(
        Badge,
        on_delete=models.CASCADE,
        related_name='earned_by'
    )
    
    earned_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'User Badge'
        verbose_name_plural = 'User Badges'
        unique_together = ['user', 'badge']
    
    def __str__(self):
        return f"{self.user.username} earned {self.badge.name}"


# =============================================================================
# WRITING PRACTICE
# =============================================================================

class WritingPrompt(models.Model):
    """
    Writing prompts for practice.
    """
    PROMPT_TYPE_CHOICES = [
        ('story', 'Story Writing'),
        ('essay', 'Essay'),
        ('application', 'Application/Letter'),
        ('creative', 'Creative Writing'),
        ('descriptive', 'Descriptive'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    title_nepali = models.CharField(max_length=255, blank=True)
    description = models.TextField()
    description_nepali = models.TextField(blank=True)
    
    prompt_type = models.CharField(max_length=20, choices=PROMPT_TYPE_CHOICES, default='essay')
    difficulty = models.CharField(max_length=20, default='medium')
    
    # Guidelines
    guidelines = models.JSONField(default=list)
    examples = models.JSONField(default=list)
    
    # Requirements
    min_words = models.PositiveIntegerField(default=100)
    max_words = models.PositiveIntegerField(default=500)
    
    # Rewards
    points_reward = models.PositiveIntegerField(default=30)
    coins_reward = models.PositiveIntegerField(default=15)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Writing Prompt'
        verbose_name_plural = 'Writing Prompts'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title


class WritingSubmission(models.Model):
    """
    User writing submissions.
    """
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('reviewed', 'Reviewed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='writing_submissions'
    )
    prompt = models.ForeignKey(
        WritingPrompt,
        on_delete=models.CASCADE,
        related_name='submissions'
    )
    
    title = models.CharField(max_length=255, blank=True)
    content = models.TextField()
    word_count = models.PositiveIntegerField(default=0)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # Scoring
    score = models.PositiveIntegerField(default=0)
    grammar_score = models.PositiveIntegerField(default=0)
    vocabulary_score = models.PositiveIntegerField(default=0)
    structure_score = models.PositiveIntegerField(default=0)
    creativity_score = models.PositiveIntegerField(default=0)
    
    # Feedback
    feedback = models.TextField(blank=True)
    suggestions = models.JSONField(default=list)
    corrections = models.JSONField(default=list)
    
    # Rewards
    points_earned = models.PositiveIntegerField(default=0)
    coins_earned = models.PositiveIntegerField(default=0)
    
    time_spent = models.PositiveIntegerField(default=0)  # in seconds
    
    submitted_at = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Writing Submission'
        verbose_name_plural = 'Writing Submissions'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.prompt.title}"


# =============================================================================
# GAMES
# =============================================================================

class Game(models.Model):
    """
    Mini-games for learning.
    """
    GAME_TYPE_CHOICES = [
        ('grammar_shooter', 'Grammar Shooter'),
        ('word_match', 'Word Match'),
        ('sentence_builder', 'Sentence Builder'),
        ('quiz_race', 'Quiz Race'),
        ('memory_game', 'Memory Game'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    name_nepali = models.CharField(max_length=100, blank=True)
    description = models.TextField()
    
    game_type = models.CharField(max_length=30, choices=GAME_TYPE_CHOICES)
    difficulty = models.CharField(max_length=20, default='medium')
    
    instructions = models.TextField()
    instructions_nepali = models.TextField(blank=True)
    
    # Game settings
    settings = models.JSONField(default=dict)
    
    # Rewards
    base_points = models.PositiveIntegerField(default=10)
    base_coins = models.PositiveIntegerField(default=5)
    
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Game'
        verbose_name_plural = 'Games'
        ordering = ['-is_featured', 'name']
    
    def __str__(self):
        return self.name


class GameSession(models.Model):
    """
    User game sessions.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='game_sessions'
    )
    game = models.ForeignKey(
        Game,
        on_delete=models.CASCADE,
        related_name='sessions'
    )
    
    score = models.PositiveIntegerField(default=0)
    high_score = models.BooleanField(default=False)
    
    # Stats
    stats = models.JSONField(default=dict)
    time_spent = models.PositiveIntegerField(default=0)  # in seconds
    
    # Rewards
    points_earned = models.PositiveIntegerField(default=0)
    coins_earned = models.PositiveIntegerField(default=0)
    
    started_at = models.DateTimeField()
    ended_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Game Session'
        verbose_name_plural = 'Game Sessions'
        ordering = ['-ended_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.game.name}: {self.score}"


class Leaderboard(models.Model):
    """
    Leaderboard entries.
    """
    LEADERBOARD_TYPE_CHOICES = [
        ('points', 'Points'),
        ('level', 'Level'),
        ('streak', 'Streak'),
        ('game', 'Game Score'),
    ]
    
    PERIOD_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('all_time', 'All Time'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='leaderboard_entries'
    )
    
    leaderboard_type = models.CharField(max_length=20, choices=LEADERBOARD_TYPE_CHOICES)
    period = models.CharField(max_length=20, choices=PERIOD_CHOICES)
    
    # For game-specific leaderboards
    game = models.ForeignKey(
        Game,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='leaderboard_entries'
    )
    
    score = models.PositiveIntegerField(default=0)
    rank = models.PositiveIntegerField(default=0)
    
    period_start = models.DateField()
    period_end = models.DateField()
    
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Leaderboard Entry'
        verbose_name_plural = 'Leaderboard Entries'
        ordering = ['rank']
        indexes = [
            models.Index(fields=['leaderboard_type', 'period', 'rank']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - Rank {self.rank} ({self.leaderboard_type})"

