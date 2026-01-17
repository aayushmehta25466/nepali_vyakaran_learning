"""
Views for the accounts app.
Handles authentication, user management, and game state operations.
"""

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status, generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample

from .models import GameState, UserSettings, OTPVerification, ActivityLog
from .serializers import (
    UserSerializer, UserProfileUpdateSerializer,
    GameStateSerializer, GameStateUpdateSerializer,
    AddPointsSerializer, AddCoinsSerializer, SpendCoinsSerializer,
    UnlockZoneSerializer, CompleteLessonSerializer, UpdateStreakSerializer,
    UserSettingsSerializer, NotificationSettingsSerializer, ChangeLanguageSerializer,
    PasswordChangeSerializer, OTPRequestSerializer, OTPVerifySerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    ResetProgressSerializer, ActivityLogSerializer, UserStatsSerializer,
    LeaderboardEntrySerializer
)
from .utils import (
    success_response, error_response,
    generate_otp, send_otp_email
)

User = get_user_model()


# =============================================================================
# AUTHENTICATION VIEWS
# =============================================================================

class CustomTokenObtainPairView(TokenObtainPairView):
    """
    POST /api/v1/auth/login
    User login with email and password.
    """
    
    @extend_schema(
        summary="User Login",
        description="Authenticate user with email and password, returns JWT tokens",
        tags=["Authentication"]
    )
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            # Get user and log activity
            email = request.data.get('email')
            try:
                user = User.objects.get(email=email)
                ActivityLog.log_activity(user, 'login', 'User logged in', request=request)
                
                # Include user data and game state in response
                user_serializer = UserSerializer(user)
                game_state, _ = GameState.objects.get_or_create(user=user)
                game_state_serializer = GameStateSerializer(game_state)
                
                response.data['user'] = user_serializer.data
                response.data['gameState'] = game_state_serializer.data
            except User.DoesNotExist:
                pass
        
        return response


class CustomTokenRefreshView(TokenRefreshView):
    """
    POST /api/v1/auth/refresh-token
    Refresh the access token using refresh token.
    """
    
    @extend_schema(
        summary="Refresh Token",
        description="Get a new access token using refresh token",
        tags=["Authentication"]
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class LogoutView(APIView):
    """
    POST /api/v1/auth/logout
    Logout user by blacklisting the refresh token.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="User Logout",
        description="Logout user and blacklist refresh token",
        tags=["Authentication"]
    )
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            ActivityLog.log_activity(request.user, 'logout', 'User logged out', request=request)
            return success_response(message='Successfully logged out.')
        except Exception as e:
            return error_response(str(e), status_code=status.HTTP_400_BAD_REQUEST)


class SendOTPView(APIView):
    """
    POST /api/v1/auth/send-otp
    Send OTP to user's email.
    """
    permission_classes = [permissions.AllowAny]
    
    @extend_schema(
        summary="Send OTP",
        description="Send OTP code to user's email for verification or password reset",
        tags=["Authentication"],
        request=OTPRequestSerializer
    )
    def post(self, request):
        serializer = OTPRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response('Invalid data', details=serializer.errors)
        
        email = serializer.validated_data['email']
        purpose = serializer.validated_data['purpose']
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return error_response('User with this email does not exist.', code='USER_NOT_FOUND')
        
        # Create and send OTP
        otp = OTPVerification.create_otp(user, purpose)
        email_sent = send_otp_email(user, otp.otp_code, purpose)
        
        if email_sent:
            return success_response(
                message='OTP sent successfully. Check your email.',
                data={'expires_in': 180}  # 3 minutes in seconds
            )
        else:
            return error_response('Failed to send OTP. Please try again.', code='EMAIL_FAILED')


class VerifyOTPView(APIView):
    """
    POST /api/v1/auth/verify-otp
    Verify OTP code.
    """
    permission_classes = [permissions.AllowAny]
    
    @extend_schema(
        summary="Verify OTP",
        description="Verify the OTP code sent to user's email",
        tags=["Authentication"],
        request=OTPVerifySerializer
    )
    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        if not serializer.is_valid():
            return error_response('Invalid data', details=serializer.errors)
        
        email = serializer.validated_data['email']
        otp_code = serializer.validated_data['otp_code']
        purpose = serializer.validated_data['purpose']
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return error_response('User not found.', code='USER_NOT_FOUND')
        
        # Find valid OTP
        otp = OTPVerification.objects.filter(
            user=user,
            otp_code=otp_code,
            purpose=purpose,
            is_used=False
        ).first()
        
        if not otp:
            return error_response('Invalid OTP code.', code='INVALID_OTP')
        
        if not otp.is_valid:
            return error_response('OTP has expired. Please request a new one.', code='OTP_EXPIRED')
        
        # Mark OTP as used
        otp.is_used = True
        otp.save()
        
        # If verification purpose, mark email as verified
        if purpose == 'verification':
            user.is_email_verified = True
            user.save()
        
        return success_response(message='OTP verified successfully.')


class ForgotPasswordView(APIView):
    """
    POST /api/v1/auth/forgot-password
    Request password reset - sends OTP to email.
    """
    permission_classes = [permissions.AllowAny]
    
    @extend_schema(
        summary="Forgot Password",
        description="Request password reset OTP",
        tags=["Authentication"],
        request=PasswordResetRequestSerializer
    )
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response('Invalid data', details=serializer.errors)
        
        email = serializer.validated_data['email']
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Don't reveal if user exists
            return success_response(message='If an account exists with this email, you will receive a password reset OTP.')
        
        # Create and send OTP
        otp = OTPVerification.create_otp(user, 'password_reset')
        send_otp_email(user, otp.otp_code, 'password_reset')
        
        return success_response(message='If an account exists with this email, you will receive a password reset OTP.')


class ResetPasswordView(APIView):
    """
    POST /api/v1/auth/reset-password
    Reset password using OTP.
    """
    permission_classes = [permissions.AllowAny]
    
    @extend_schema(
        summary="Reset Password",
        description="Reset password using OTP code",
        tags=["Authentication"],
        request=PasswordResetConfirmSerializer
    )
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response('Invalid data', details=serializer.errors)
        
        email = serializer.validated_data['email']
        otp_code = serializer.validated_data['otp_code']
        new_password = serializer.validated_data['new_password']
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return error_response('User not found.', code='USER_NOT_FOUND')
        
        # Verify OTP
        otp = OTPVerification.objects.filter(
            user=user,
            otp_code=otp_code,
            purpose='password_reset',
            is_used=False
        ).first()
        
        if not otp or not otp.is_valid:
            return error_response('Invalid or expired OTP.', code='INVALID_OTP')
        
        # Reset password
        user.set_password(new_password)
        user.save()
        
        # Mark OTP as used
        otp.is_used = True
        otp.save()
        
        return success_response(message='Password reset successfully. You can now login with your new password.')


# =============================================================================
# USER PROFILE VIEWS
# =============================================================================

class UserProfileView(APIView):
    """
    GET /api/v1/users/profile - Get user profile
    PUT /api/v1/users/profile - Update user profile
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Get User Profile",
        description="Get current user's profile information",
        tags=["User Management"],
        responses={200: UserSerializer}
    )
    def get(self, request):
        serializer = UserSerializer(request.user)
        return success_response(data=serializer.data)
    
    @extend_schema(
        summary="Update User Profile",
        description="Update current user's profile information",
        tags=["User Management"],
        request=UserProfileUpdateSerializer,
        responses={200: UserSerializer}
    )
    def put(self, request):
        serializer = UserProfileUpdateSerializer(
            request.user,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            ActivityLog.log_activity(request.user, 'profile_updated', 'Profile updated', request=request)
            return success_response(
                data=UserSerializer(request.user).data,
                message='Profile updated successfully.'
            )
        return error_response('Invalid data', details=serializer.errors)


class DeleteAccountView(APIView):
    """
    DELETE /api/v1/users/account
    Delete user account.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Delete Account",
        description="Permanently delete user account",
        tags=["User Management"]
    )
    def delete(self, request):
        user = request.user
        user.delete()
        return success_response(message='Account deleted successfully.')


# =============================================================================
# GAME STATE VIEWS
# =============================================================================

class GameStateView(APIView):
    """
    GET /api/v1/users/game-state - Get game state
    PUT /api/v1/users/game-state - Update game state
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Get Game State",
        description="Get user's complete game state",
        tags=["User Progress"],
        responses={200: GameStateSerializer}
    )
    def get(self, request):
        game_state, _ = GameState.objects.get_or_create(user=request.user)
        serializer = GameStateSerializer(game_state)
        return success_response(data=serializer.data)
    
    @extend_schema(
        summary="Update Game State",
        description="Update user's game state",
        tags=["User Progress"],
        request=GameStateUpdateSerializer,
        responses={200: GameStateSerializer}
    )
    def put(self, request):
        game_state, _ = GameState.objects.get_or_create(user=request.user)
        serializer = GameStateUpdateSerializer(game_state, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return success_response(
                data=GameStateSerializer(game_state).data,
                message='Game state updated.'
            )
        return error_response('Invalid data', details=serializer.errors)


class AddPointsView(APIView):
    """
    POST /api/v1/users/add-points
    Add points to user's account.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Add Points",
        description="Add points to user's account",
        tags=["User Progress"],
        request=AddPointsSerializer
    )
    def post(self, request):
        serializer = AddPointsSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response('Invalid data', details=serializer.errors)
        
        points = serializer.validated_data['points']
        reason = serializer.validated_data['reason']
        
        game_state, _ = GameState.objects.get_or_create(user=request.user)
        level_up, new_level = game_state.add_points(points, reason)
        
        ActivityLog.log_activity(
            request.user, 'points_earned',
            f'Earned {points} points: {reason}',
            metadata={'points': points, 'reason': reason},
            request=request
        )
        
        if level_up:
            ActivityLog.log_activity(
                request.user, 'level_up',
                f'Reached level {new_level}',
                metadata={'new_level': new_level},
                request=request
            )
        
        return success_response(data={
            'newPoints': points,
            'totalPoints': game_state.points,
            'levelUp': level_up,
            'newLevel': new_level if level_up else game_state.level
        })


class AddCoinsView(APIView):
    """
    POST /api/v1/users/add-coins
    Add coins to user's account.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Add Coins",
        description="Add coins to user's account",
        tags=["User Progress"],
        request=AddCoinsSerializer
    )
    def post(self, request):
        serializer = AddCoinsSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response('Invalid data', details=serializer.errors)
        
        coins = serializer.validated_data['coins']
        source = serializer.validated_data['source']
        
        game_state, _ = GameState.objects.get_or_create(user=request.user)
        game_state.coins += coins
        game_state.save()
        
        ActivityLog.log_activity(
            request.user, 'coins_earned',
            f'Earned {coins} coins from {source}',
            metadata={'coins': coins, 'source': source},
            request=request
        )
        
        return success_response(data={
            'newCoins': coins,
            'totalCoins': game_state.coins
        })


class SpendCoinsView(APIView):
    """
    POST /api/v1/users/spend-coins
    Spend user coins.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Spend Coins",
        description="Spend coins on items",
        tags=["User Progress"],
        request=SpendCoinsSerializer
    )
    def post(self, request):
        serializer = SpendCoinsSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response('Invalid data', details=serializer.errors)
        
        amount = serializer.validated_data['amount']
        item_id = serializer.validated_data['item_id']
        item_type = serializer.validated_data['item_type']
        
        game_state, _ = GameState.objects.get_or_create(user=request.user)
        
        if game_state.coins < amount:
            return error_response('Insufficient coins.', code='INSUFFICIENT_COINS')
        
        game_state.coins -= amount
        game_state.save()
        
        ActivityLog.log_activity(
            request.user, 'coins_spent',
            f'Spent {amount} coins on {item_type}',
            metadata={'amount': amount, 'item_id': item_id, 'item_type': item_type},
            request=request
        )
        
        return success_response(data={
            'remainingCoins': game_state.coins,
            'success': True
        })


class UnlockZoneView(APIView):
    """
    POST /api/v1/users/unlock-zone
    Unlock a new learning zone.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Unlock Zone",
        description="Unlock a new learning zone",
        tags=["User Progress"],
        request=UnlockZoneSerializer
    )
    def post(self, request):
        serializer = UnlockZoneSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response('Invalid data', details=serializer.errors)
        
        zone_id = serializer.validated_data['zone_id']
        
        game_state, _ = GameState.objects.get_or_create(user=request.user)
        
        if zone_id in game_state.unlocked_zones:
            return error_response('Zone already unlocked.', code='ALREADY_UNLOCKED')
        
        game_state.unlocked_zones.append(zone_id)
        game_state.save()
        
        ActivityLog.log_activity(
            request.user, 'zone_unlocked',
            f'Unlocked zone: {zone_id}',
            metadata={'zone_id': zone_id},
            request=request
        )
        
        return success_response(data={
            'unlockedZones': game_state.unlocked_zones,
            'success': True
        })


class CompleteLessonView(APIView):
    """
    POST /api/v1/users/complete-lesson
    Mark a lesson as completed.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Complete Lesson",
        description="Mark a lesson as completed and award rewards",
        tags=["User Progress"],
        request=CompleteLessonSerializer
    )
    def post(self, request):
        serializer = CompleteLessonSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response('Invalid data', details=serializer.errors)
        
        lesson_id = serializer.validated_data['lesson_id']
        score = serializer.validated_data['score']
        time_spent = serializer.validated_data['time_spent']
        
        game_state, _ = GameState.objects.get_or_create(user=request.user)
        
        # Calculate rewards based on score
        points_awarded = int(10 * (score / 100))
        coins_awarded = int(5 * (score / 100))
        
        # Update game state
        if lesson_id not in game_state.completed_lessons:
            game_state.completed_lessons.append(lesson_id)
        
        game_state.total_time_spent += time_spent
        game_state.add_points(points_awarded, f'Completed lesson {lesson_id}')
        game_state.coins += coins_awarded
        game_state.update_streak()
        game_state.save()
        
        ActivityLog.log_activity(
            request.user, 'lesson_complete',
            f'Completed lesson with score {score}%',
            metadata={'lesson_id': lesson_id, 'score': score, 'time_spent': time_spent},
            request=request
        )
        
        return success_response(data={
            'completedLessons': game_state.completed_lessons,
            'pointsAwarded': points_awarded,
            'coinsAwarded': coins_awarded,
            'newAchievements': []  # TODO: Check for new achievements
        })


class UpdateStreakView(APIView):
    """
    POST /api/v1/users/update-streak
    Update user's learning streak.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Update Streak",
        description="Update user's learning streak",
        tags=["User Progress"],
        request=UpdateStreakSerializer
    )
    def post(self, request):
        serializer = UpdateStreakSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response('Invalid data', details=serializer.errors)
        
        action = serializer.validated_data['action']
        
        game_state, _ = GameState.objects.get_or_create(user=request.user)
        
        if action == 'increment':
            current_streak = game_state.update_streak()
        else:  # reset
            game_state.current_streak = 0
            game_state.save()
            current_streak = 0
        
        # Check for streak milestones (7, 30, 100 days)
        streak_reward = None
        milestones = {7: 50, 30: 200, 100: 500}
        if current_streak in milestones:
            streak_reward = {
                'milestone': current_streak,
                'coinsAwarded': milestones[current_streak]
            }
            game_state.coins += milestones[current_streak]
            game_state.save()
            
            ActivityLog.log_activity(
                request.user, 'streak_milestone',
                f'Reached {current_streak}-day streak!',
                metadata={'streak': current_streak, 'coins_awarded': milestones[current_streak]},
                request=request
            )
        
        return success_response(data={
            'currentStreak': current_streak,
            'longestStreak': game_state.longest_streak,
            'streakReward': streak_reward
        })


# =============================================================================
# USER SETTINGS VIEWS
# =============================================================================

class UserSettingsView(APIView):
    """
    GET /api/v1/settings - Get user settings
    PUT /api/v1/settings - Update user settings
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Get Settings",
        description="Get user settings and preferences",
        tags=["Settings"],
        responses={200: UserSettingsSerializer}
    )
    def get(self, request):
        settings, _ = UserSettings.objects.get_or_create(user=request.user)
        serializer = UserSettingsSerializer(settings)
        return success_response(data=serializer.data)
    
    @extend_schema(
        summary="Update Settings",
        description="Update user settings and preferences",
        tags=["Settings"],
        request=UserSettingsSerializer
    )
    def put(self, request):
        settings, _ = UserSettings.objects.get_or_create(user=request.user)
        serializer = UserSettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            ActivityLog.log_activity(request.user, 'settings_changed', 'Settings updated', request=request)
            return success_response(data=serializer.data, message='Settings updated successfully.')
        return error_response('Invalid data', details=serializer.errors)


class ChangeLanguageView(APIView):
    """
    PUT /api/v1/settings/language
    Change interface language.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Change Language",
        description="Change interface language",
        tags=["Settings"],
        request=ChangeLanguageSerializer
    )
    def put(self, request):
        serializer = ChangeLanguageSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response('Invalid data', details=serializer.errors)
        
        language = serializer.validated_data['language']
        settings, _ = UserSettings.objects.get_or_create(user=request.user)
        settings.language = language
        settings.save()
        
        return success_response(data={'language': language}, message='Language changed successfully.')


class NotificationSettingsView(APIView):
    """
    PUT /api/v1/settings/notifications
    Update notification preferences.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Update Notification Settings",
        description="Update notification preferences",
        tags=["Settings"],
        request=NotificationSettingsSerializer
    )
    def put(self, request):
        settings, _ = UserSettings.objects.get_or_create(user=request.user)
        serializer = NotificationSettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return success_response(data=serializer.data, message='Notification settings updated.')
        return error_response('Invalid data', details=serializer.errors)


class ResetSettingsView(APIView):
    """
    POST /api/v1/settings/reset
    Reset all settings to default.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Reset Settings",
        description="Reset all settings to default values",
        tags=["Settings"]
    )
    def post(self, request):
        # Delete existing settings and create new with defaults
        UserSettings.objects.filter(user=request.user).delete()
        settings = UserSettings.objects.create(user=request.user)
        serializer = UserSettingsSerializer(settings)
        return success_response(data=serializer.data, message='Settings reset to defaults.')


class ResetProgressView(APIView):
    """
    POST /api/v1/settings/reset-progress
    Reset user progress (dangerous).
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Reset Progress",
        description="Reset all user progress - DANGEROUS",
        tags=["Settings"],
        request=ResetProgressSerializer
    )
    def post(self, request):
        serializer = ResetProgressSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response('Invalid data', details=serializer.errors)
        
        # Reset game state
        GameState.objects.filter(user=request.user).delete()
        GameState.objects.create(user=request.user)
        
        ActivityLog.log_activity(request.user, 'profile_updated', 'Progress reset', request=request)
        
        return success_response(message='Progress has been reset.')


# =============================================================================
# STATISTICS VIEWS
# =============================================================================

class StatsOverviewView(APIView):
    """
    GET /api/v1/stats/overview
    Get user statistics overview.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Statistics Overview",
        description="Get user's statistics overview",
        tags=["Analytics"],
        responses={200: UserStatsSerializer}
    )
    def get(self, request):
        game_state, _ = GameState.objects.get_or_create(user=request.user)
        
        stats = {
            'total_points': game_state.points,
            'total_coins': game_state.coins,
            'level': game_state.level,
            'completed_lessons': len(game_state.completed_lessons),
            'current_streak': game_state.current_streak,
            'longest_streak': game_state.longest_streak,
            'total_time_spent': game_state.total_time_spent,
            'accuracy': game_state.accuracy,
            'achievements_count': len(game_state.achievements),
            'badges_count': len(game_state.badges),
        }
        
        return success_response(data=stats)


class ActivityHistoryView(APIView):
    """
    GET /api/v1/stats/activity
    Get activity history.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Activity History",
        description="Get user's activity history",
        tags=["Analytics"]
    )
    def get(self, request):
        activities = ActivityLog.objects.filter(user=request.user)[:50]
        serializer = ActivityLogSerializer(activities, many=True)
        
        # Calculate stats
        total_active_days = activities.dates('created_at', 'day').count()
        # Compute total_active_days on full queryset before slicing
        activities_qs = ActivityLog.objects.filter(user=request.user)
        total_active_days = activities_qs.dates('created_at', 'day').count()
    
        # Get last 50 activities for serialization
        activities = activities_qs[:50]
        serializer = ActivityLogSerializer(activities, many=True)
        
        return success_response(data={
            'activities': serializer.data,
            'totalActiveDays': total_active_days,
        })


class LeaderboardView(APIView):
    """
    GET /api/v1/stats/leaderboard
    Get global leaderboard.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Global Leaderboard",
        description="Get global leaderboard by points, level, or streak",
        tags=["Analytics"],
        parameters=[
            OpenApiParameter(name='type', description='Leaderboard type', required=True, enum=['points', 'level', 'streak']),
            OpenApiParameter(name='limit', description='Number of entries', required=False, type=int),
        ]
    )
    def get(self, request):
        leaderboard_type = request.query_params.get('type', 'points')
        limit = int(request.query_params.get('limit', 10))
        
        field_map = {
            'points': '-points',
            'level': '-level',
            'streak': '-current_streak'
        }
        
        order_by = field_map.get(leaderboard_type, '-points')
        
        game_states = GameState.objects.select_related('user').order_by(order_by)[:limit]
        
        leaderboard = []
        for rank, gs in enumerate(game_states, 1):
            value = getattr(gs, leaderboard_type if leaderboard_type != 'streak' else 'current_streak')
            leaderboard.append({
                'rank': rank,
                'user_id': str(gs.user.id),
                'username': gs.user.username,
                'avatar': gs.user.avatar.url if gs.user.avatar else None,
                'value': value
            })
        
        # Find user's rank
        user_game_state = GameState.objects.filter(user=request.user).first()
        user_rank = 0
        if user_game_state:
            field_name = 'points' if leaderboard_type == 'points' else ('level' if leaderboard_type == 'level' else 'current_streak')
            user_value = getattr(user_game_state, field_name)
            user_rank = GameState.objects.filter(**{f'{field_name}__gt': user_value}).count() + 1
        
        return success_response(data={
            'leaderboard': leaderboard,
            'userRank': user_rank
        })


class StatsProgressView(APIView):
    """
    GET /api/v1/stats/progress
    Get detailed progress statistics with time-based breakdown.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Progress Statistics",
        description="Get detailed progress statistics by period",
        tags=["Analytics"],
        parameters=[
            OpenApiParameter(name='period', description='Time period', required=False, enum=['week', 'month', 'year']),
        ]
    )
    def get(self, request):
        from django.db.models import Count, Sum
        from django.db.models.functions import TruncDate
        from datetime import timedelta
        from learning_vyakaran.models import LessonProgress, QuizResult
        
        period = request.query_params.get('period', 'week')
        now = timezone.now()
        
        # Calculate date range
        if period == 'week':
            start_date = now - timedelta(days=7)
        elif period == 'month':
            start_date = now - timedelta(days=30)
        else:  # year
            start_date = now - timedelta(days=365)
        
        # Get activity data
        activities = (
            ActivityLog.objects.filter(
                user=request.user,
                created_at__gte=start_date
            )
            .annotate(day=TruncDate('created_at'))
            .values('day')
            .annotate(count=Count('id'))
            .order_by('day')
        )
        
        daily_progress = [
            {'date': item['day'], 'activities': item['count']}
            for item in activities
        ]
        
        # Get lessons completed
        lessons_completed = LessonProgress.objects.filter(
            user=request.user,
            status='completed',
            completed_at__gte=start_date
        ).count()
        
        # Get quizzes taken
        quizzes_taken = QuizResult.objects.filter(
            user=request.user,
            completed_at__gte=start_date
        ).count()
        
        # Category breakdown
        from learning_vyakaran.models import Category
        categories = {}
        for category in Category.objects.all():
            category_lessons = LessonProgress.objects.filter(
                user=request.user,
                lesson__category=category,
                status='completed',
                completed_at__gte=start_date
            ).count()
            categories[category.name] = category_lessons
        
        return success_response(data={
            'dailyProgress': daily_progress,
            'weeklyProgress': [],  # Aggregate daily into weekly
            'monthlyProgress': [],  # Aggregate daily into monthly
            'lessonsCompleted': lessons_completed,
            'quizzesTaken': quizzes_taken,
            'categories': categories
        })


class StatsCategoryView(APIView):
    """
    GET /api/v1/stats/category/<category>
    Get statistics for specific category.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Category Statistics",
        description="Get statistics for a specific learning category",
        tags=["Analytics"]
    )
    def get(self, request, category):
        from learning_vyakaran.models import Category, LessonProgress, QuizResult
        from django.db.models import Avg, Sum
        
        try:
            category_obj = Category.objects.get(slug=category)
        except Category.DoesNotExist:
            return error_response('Category not found', status_code=404)
        
        # Get lesson progress
        lesson_progress = LessonProgress.objects.filter(
            user=request.user,
            lesson__category=category_obj
        )
        
        total_lessons = category_obj.lessons.count()
        completed_lessons = lesson_progress.filter(status='completed').count()
        progress = (completed_lessons / total_lessons * 100) if total_lessons > 0 else 0
        
        # Calculate accuracy
        quiz_results = QuizResult.objects.filter(
            user=request.user,
            quiz__category=category_obj,
            completed_at__isnull=False
        )
        
        avg_score = quiz_results.aggregate(Avg('score'))['score__avg'] or 0
        
        # Calculate time spent
        time_spent = lesson_progress.aggregate(Sum('time_spent'))['time_spent__sum'] or 0
        
        return success_response(data={
            'category': category_obj.name,
            'progress': round(progress, 2),
            'accuracy': round(avg_score, 2),
            'timeSpent': time_spent,
            'completedItems': completed_lessons,
            'totalItems': total_lessons
        })


class StatsComparisonView(APIView):
    """
    GET /api/v1/stats/comparison
    Compare user stats with another user or average.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Stats Comparison",
        description="Compare your stats with other users",
        tags=["Analytics"],
        parameters=[
            OpenApiParameter(name='userId', description='User ID to compare with (optional)', required=False),
        ]
    )
    def get(self, request):
        from django.db.models import Avg
        
        user_id = request.query_params.get('userId')
        user_game_state = GameState.objects.get(user=request.user)
        
        if user_id:
            try:
                compare_user = User.objects.get(id=user_id)
                compare_game_state = GameState.objects.get(user=compare_user)
                comparison_type = 'user'
                comparison_label = compare_user.username
            except (User.DoesNotExist, GameState.DoesNotExist):
                return error_response('User not found', status_code=404)
        else:
            # Compare with platform average
            avg_stats = GameState.objects.aggregate(
                avg_points=Avg('points'),
                avg_level=Avg('level'),
                avg_streak=Avg('current_streak')
            )
            comparison_type = 'average'
            comparison_label = 'Platform Average'
            compare_game_state = type('obj', (object,), {
                'points': avg_stats['avg_points'] or 0,
                'level': avg_stats['avg_level'] or 0,
                'current_streak': avg_stats['avg_streak'] or 0
            })
        
        # Build comparison
        comparison = {
            'type': comparison_type,
            'label': comparison_label,
            'you': {
                'points': user_game_state.points,
                'level': user_game_state.level,
                'streak': user_game_state.current_streak
            },
            'them': {
                'points': int(compare_game_state.points),
                'level': int(compare_game_state.level),
                'streak': int(compare_game_state.current_streak)
            }
        }
        
        # Identify strengths and improvements
        strengths = []
        improvements = []
        
        if user_game_state.points > compare_game_state.points:
            strengths.append('points')
        else:
            improvements.append('points')
            
        if user_game_state.level > compare_game_state.level:
            strengths.append('level')
        else:
            improvements.append('level')
            
        if user_game_state.current_streak > compare_game_state.current_streak:
            strengths.append('streak')
        else:
            improvements.append('streak')
        
        return success_response(data={
            'comparison': comparison,
            'strengths': strengths,
            'improvements': improvements
        })


