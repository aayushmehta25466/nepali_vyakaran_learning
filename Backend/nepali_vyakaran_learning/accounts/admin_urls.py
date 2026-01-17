"""
URL configuration for admin APIs.
"""

from django.urls import path
from accounts.admin_views import (
    AdminLessonListCreateView, AdminLessonDetailView,
    AdminQuizListCreateView, AdminQuestListCreateView,
    AdminUsersView, AdminAnalyticsView, AdminBulkUploadView,
    AdminAwardBadgeView
)

app_name = 'admin_api'

urlpatterns = [
    # Lessons
    path('lessons/', AdminLessonListCreateView.as_view(), name='admin-lessons'),
    path('lessons/<uuid:lesson_id>/', AdminLessonDetailView.as_view(), name='admin-lesson-detail'),
    
    # Quizzes
    path('quizzes/', AdminQuizListCreateView.as_view(), name='admin-quizzes'),
    
    # Quests
    path('quests/', AdminQuestListCreateView.as_view(), name='admin-quests'),
    
    # Badges
    path('badges/award/', AdminAwardBadgeView.as_view(), name='admin-award-badge'),
    
    # Users
    path('users/', AdminUsersView.as_view(), name='admin-users'),
    
    # Analytics
    path('analytics/', AdminAnalyticsView.as_view(), name='admin-analytics'),
    
    # Bulk Upload
    path('content/bulk-upload/', AdminBulkUploadView.as_view(), name='admin-bulk-upload'),
]
