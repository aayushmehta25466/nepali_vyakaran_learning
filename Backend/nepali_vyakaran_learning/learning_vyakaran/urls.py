"""
URL configuration for learning_vyakaran app.
"""

from django.urls import path
from . import views

app_name = 'learning_vyakaran'

urlpatterns = [
    # ==========================================================================
    # LESSONS
    # ==========================================================================
    path('lessons/', views.LessonListView.as_view(), name='lesson-list'),
    path('lessons/categories/', views.CategoryListView.as_view(), name='category-list'),
    path('lessons/progress/', views.LessonProgressView.as_view(), name='lesson-progress'),
    path('lessons/<uuid:lesson_id>/', views.LessonDetailView.as_view(), name='lesson-detail'),
    path('lessons/<uuid:lesson_id>/content/', views.LessonContentView.as_view(), name='lesson-content'),
    path('lessons/<uuid:lesson_id>/start/', views.StartLessonView.as_view(), name='lesson-start'),
    path('lessons/<uuid:lesson_id>/complete/', views.CompleteLessonAPIView.as_view(), name='lesson-complete'),

    # ==========================================================================
    # QUIZZES
    # ==========================================================================
    path('quizzes/', views.QuizListView.as_view(), name='quiz-list'),
    path('quizzes/<uuid:quiz_id>/', views.QuizDetailView.as_view(), name='quiz-detail'),
    path('quizzes/<uuid:quiz_id>/start/', views.StartQuizView.as_view(), name='quiz-start'),
    path('quizzes/<uuid:quiz_id>/submit/', views.SubmitQuizView.as_view(), name='quiz-submit'),
    path('quizzes/<uuid:quiz_id>/results/', views.QuizResultsView.as_view(), name='quiz-results'),

    # ==========================================================================
    # ASSESSMENTS
    # ==========================================================================
    path('assessments/grammar/', views.GrammarAssessmentView.as_view(), name='grammar-assessment'),
    path('assessments/vocabulary/', views.VocabularyAssessmentView.as_view(), name='vocabulary-assessment'),

    # ==========================================================================
    # VILLAGE
    # ==========================================================================
    path('village/', views.VillageView.as_view(), name='village'),
    path('village/buildings/types/', views.BuildingTypesView.as_view(), name='building-types'),
    path('village/buildings/add/', views.AddBuildingView.as_view(), name='add-building'),
    path('village/buildings/<uuid:building_id>/upgrade/', views.UpgradeBuildingView.as_view(), name='upgrade-building'),
    path('village/buildings/<uuid:building_id>/', views.RemoveBuildingView.as_view(), name='remove-building'),
    path('village/resources/', views.VillageResourcesView.as_view(), name='village-resources'),
    path('village/resources/update/', views.VillageResourcesView.as_view(), name='village-resources-update'),

    # ==========================================================================
    # QUESTS
    # ==========================================================================
    path('quests/', views.QuestListView.as_view(), name='quest-list'),
    path('quests/daily/', views.DailyQuestsView.as_view(), name='daily-quests'),
    path('quests/progress/', views.QuestProgressView.as_view(), name='quest-progress'),
    path('quests/<uuid:quest_id>/', views.QuestDetailView.as_view(), name='quest-detail'),
    path('quests/<uuid:quest_id>/start/', views.StartQuestView.as_view(), name='quest-start'),
    path('quests/<uuid:quest_id>/complete/', views.CompleteQuestView.as_view(), name='quest-complete'),

    # ==========================================================================
    # ACHIEVEMENTS & BADGES
    # ==========================================================================
    path('achievements/', views.AchievementListView.as_view(), name='achievement-list'),
    path('achievements/<uuid:achievement_id>/', views.AchievementDetailView.as_view(), name='achievement-detail'),
    path('achievements/<uuid:achievement_id>/claim/', views.ClaimAchievementView.as_view(), name='claim-achievement'),
    path('badges/', views.BadgeListView.as_view(), name='badge-list'),

    # ==========================================================================
    # WRITING
    # ==========================================================================
    path('writing/prompts/', views.WritingPromptListView.as_view(), name='writing-prompts'),
    path('writing/prompts/<uuid:prompt_id>/', views.WritingPromptDetailView.as_view(), name='writing-prompt-detail'),
    path('writing/submit/', views.SubmitWritingView.as_view(), name='submit-writing'),
    path('writing/submissions/', views.WritingSubmissionsView.as_view(), name='writing-submissions'),
    path('writing/submissions/<uuid:submission_id>/', views.WritingSubmissionDetailView.as_view(), name='writing-submission-detail'),
    path('writing/save-draft/', views.SaveDraftView.as_view(), name='save-draft'),
    path('writing/drafts/', views.DraftsListView.as_view(), name='drafts-list'),
    path('writing/drafts/<uuid:draft_id>/', views.DeleteDraftView.as_view(), name='delete-draft'),
    path('writing/grammar-check/', views.GrammarCheckView.as_view(), name='grammar-check'),

    # ==========================================================================
    # GAMES
    # ==========================================================================
    path('games/grammar-shooter/questions/', views.GrammarShooterQuestionsView.as_view(), name='grammar-shooter-questions'),
    path('games/grammar-shooter/validate/', views.GrammarShooterValidateView.as_view(), name='grammar-shooter-validate'),
    path('games/', views.GameListView.as_view(), name='game-list'),
    path('games/<uuid:game_id>/', views.GameDetailView.as_view(), name='game-detail'),
    path('games/<uuid:game_id>/start/', views.StartGameView.as_view(), name='game-start'),
    path('games/<uuid:game_id>/end/', views.EndGameView.as_view(), name='game-end'),
    path('games/<uuid:game_id>/leaderboard/', views.GameLeaderboardView.as_view(), name='game-leaderboard'),
]
