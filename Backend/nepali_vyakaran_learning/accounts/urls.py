"""
URL configuration for the accounts app.
"""

from django.urls import path, include
from .views import (
    # Authentication
    CustomTokenObtainPairView, CustomTokenRefreshView, LogoutView,
    SendOTPView, VerifyOTPView, ForgotPasswordView, ResetPasswordView,
    
    # User Profile
    UserProfileView, DeleteAccountView,
    
    # Game State
    GameStateView, AddPointsView, AddCoinsView, SpendCoinsView,
    UnlockZoneView, CompleteLessonView, UpdateStreakView,
    
    # Settings
    UserSettingsView, ChangeLanguageView, NotificationSettingsView,
    ResetSettingsView, ResetProgressView,
    
    # Statistics
    StatsOverviewView, ActivityHistoryView, LeaderboardView,
    StatsProgressView, StatsCategoryView, StatsComparisonView,
)

app_name = 'accounts'

# Authentication URLs
auth_urlpatterns = [
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('refresh-token/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('send-otp/', SendOTPView.as_view(), name='send_otp'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify_otp'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset_password'),
    
    # Include dj-rest-auth for registration
    path('register/', include('dj_rest_auth.registration.urls')),
]

# User URLs
user_urlpatterns = [
    path('me/', UserProfileView.as_view(), name='me'),
    path('me/game-state/', GameStateView.as_view(), name='me_game_state'),
    path('me/game-state/add-points/', AddPointsView.as_view(), name='me_add_points'),
    path('me/game-state/add-coins/', AddCoinsView.as_view(), name='me_add_coins'),
    path('me/game-state/spend-coins/', SpendCoinsView.as_view(), name='me_spend_coins'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('account/', DeleteAccountView.as_view(), name='delete_account'),
    path('game-state/', GameStateView.as_view(), name='game_state'),
    path('add-points/', AddPointsView.as_view(), name='add_points'),
    path('add-coins/', AddCoinsView.as_view(), name='add_coins'),
    path('spend-coins/', SpendCoinsView.as_view(), name='spend_coins'),
    path('unlock-zone/', UnlockZoneView.as_view(), name='unlock_zone'),
    path('complete-lesson/', CompleteLessonView.as_view(), name='complete_lesson'),
    path('update-streak/', UpdateStreakView.as_view(), name='update_streak'),
]

# Settings URLs
settings_urlpatterns = [
    path('', UserSettingsView.as_view(), name='settings'),
    path('language/', ChangeLanguageView.as_view(), name='change_language'),
    path('notifications/', NotificationSettingsView.as_view(), name='notification_settings'),
    path('reset/', ResetSettingsView.as_view(), name='reset_settings'),
    path('reset-progress/', ResetProgressView.as_view(), name='reset_progress'),
]

# Statistics URLs
stats_urlpatterns = [
    path('progress/', StatsProgressView.as_view(), name='stats_progress'),
    path('activity/', ActivityHistoryView.as_view(), name='activity_history'),
    path('leaderboard/', LeaderboardView.as_view(), name='leaderboard'),
    path('category/<str:category>/', StatsCategoryView.as_view(), name='stats_category'),
    path('comparison/', StatsComparisonView.as_view(), name='stats_comparisonistory'),
    path('leaderboard/', LeaderboardView.as_view(), name='leaderboard'),
]

urlpatterns = [
    path('auth/', include(auth_urlpatterns)),
    path('users/', include(user_urlpatterns)),
    path('settings/', include(settings_urlpatterns)),
    path('stats/', include(stats_urlpatterns)),
]
