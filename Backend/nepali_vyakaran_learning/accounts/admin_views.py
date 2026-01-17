"""
Admin content management views.
Handles CRUD operations for lessons, quizzes, quests, and user management.
"""

from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from rest_framework import status, generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiParameter

from accounts.utils import success_response, error_response
from accounts.models import GameState, ActivityLog
from learning_vyakaran.models import (
    Lesson, Quiz, Quest, Category
)
from learning_vyakaran.serializers import (
    LessonDetailSerializer, QuizDetailSerializer, QuestDetailSerializer
)

User = get_user_model()


# =============================================================================
# ADMIN LESSON MANAGEMENT
# =============================================================================

class AdminLessonListCreateView(APIView):
    """
    GET /api/v1/admin/lessons - List all lessons
    POST /api/v1/admin/lessons - Create new lesson
    """
    permission_classes = [permissions.IsAdminUser]
    
    @extend_schema(
        summary="List All Lessons (Admin)",
        description="Get all lessons including unpublished ones",
        tags=["Admin - Content"]
    )
    def get(self, request):
        lessons = Lesson.objects.all().select_related('category')
        serializer = LessonDetailSerializer(lessons, many=True)
        return success_response(data={'lessons': serializer.data})
    
    @extend_schema(
        summary="Create Lesson (Admin)",
        description="Create a new lesson",
        tags=["Admin - Content"],
        request=LessonDetailSerializer
    )
    def post(self, request):
        serializer = LessonDetailSerializer(data=request.data)
        if serializer.is_valid():
            lesson = serializer.save()
            
            # Log activity
            ActivityLog.log_activity(
                request.user, 'admin_lesson_create',
                f'Created lesson: {lesson.title}',
                metadata={'lesson_id': str(lesson.id)},
                request=request
            )
            
            return success_response(
                data={'lesson': LessonDetailSerializer(lesson).data},
                message='Lesson created successfully'
            )
        return error_response('Invalid data', details=serializer.errors, status_code=400)


class AdminLessonDetailView(APIView):
    """
    GET /api/v1/admin/lessons/<id> - Get lesson details
    PUT /api/v1/admin/lessons/<id> - Update lesson
    DELETE /api/v1/admin/lessons/<id> - Delete lesson
    """
    permission_classes = [permissions.IsAdminUser]
    
    @extend_schema(
        summary="Get Lesson (Admin)",
        description="Get lesson details",
        tags=["Admin - Content"]
    )
    def get(self, request, lesson_id):
        try:
            lesson = Lesson.objects.get(id=lesson_id)
        except Lesson.DoesNotExist:
            return error_response('Lesson not found', status_code=404)
        
        serializer = LessonDetailSerializer(lesson)
        return success_response(data={'lesson': serializer.data})
    
    @extend_schema(
        summary="Update Lesson (Admin)",
        description="Update an existing lesson",
        tags=["Admin - Content"],
        request=LessonDetailSerializer
    )
    def put(self, request, lesson_id):
        try:
            lesson = Lesson.objects.get(id=lesson_id)
        except Lesson.DoesNotExist:
            return error_response('Lesson not found', status_code=404)
        
        serializer = LessonDetailSerializer(lesson, data=request.data, partial=True)
        if serializer.is_valid():
            lesson = serializer.save()
            
            # Log activity
            ActivityLog.log_activity(
                request.user, 'admin_lesson_update',
                f'Updated lesson: {lesson.title}',
                metadata={'lesson_id': str(lesson.id)},
                request=request
            )
            
            return success_response(
                data={'lesson': LessonDetailSerializer(lesson).data},
                message='Lesson updated successfully'
            )
        return error_response('Invalid data', details=serializer.errors, status_code=400)
    
    @extend_schema(
        summary="Delete Lesson (Admin)",
        description="Delete a lesson",
        tags=["Admin - Content"]
    )
    def delete(self, request, lesson_id):
        try:
            lesson = Lesson.objects.get(id=lesson_id)
        except Lesson.DoesNotExist:
            return error_response('Lesson not found', status_code=404)
        
        lesson_title = lesson.title
        lesson.delete()
        
        # Log activity
        ActivityLog.log_activity(
            request.user, 'admin_lesson_delete',
            f'Deleted lesson: {lesson_title}',
            metadata={'lesson_id': str(lesson_id)},
            request=request
        )
        
        return success_response(message='Lesson deleted successfully')


# =============================================================================
# ADMIN QUIZ MANAGEMENT
# =============================================================================

class AdminQuizListCreateView(APIView):
    """
    GET /api/v1/admin/quizzes - List all quizzes
    POST /api/v1/admin/quizzes - Create new quiz
    """
    permission_classes = [permissions.IsAdminUser]
    
    @extend_schema(
        summary="List All Quizzes (Admin)",
        description="Get all quizzes",
        tags=["Admin - Content"]
    )
    def get(self, request):
        quizzes = Quiz.objects.all().select_related('category')
        serializer = QuizDetailSerializer(quizzes, many=True)
        return success_response(data={'quizzes': serializer.data})
    
    @extend_schema(
        summary="Create Quiz (Admin)",
        description="Create a new quiz",
        tags=["Admin - Content"],
        request=QuizDetailSerializer
    )
    def post(self, request):
        serializer = QuizDetailSerializer(data=request.data)
        if serializer.is_valid():
            quiz = serializer.save()
            
            ActivityLog.log_activity(
                request.user, 'admin_quiz_create',
                f'Created quiz: {quiz.title}',
                metadata={'quiz_id': str(quiz.id)},
                request=request
            )
            
            return success_response(
                data={'quiz': QuizDetailSerializer(quiz).data},
                message='Quiz created successfully'
            )
        return error_response('Invalid data', details=serializer.errors, status_code=400)


# =============================================================================
# ADMIN QUEST MANAGEMENT
# =============================================================================

class AdminQuestListCreateView(APIView):
    """
    POST /api/v1/admin/quests - Create new quest
    """
    permission_classes = [permissions.IsAdminUser]
    
    @extend_schema(
        summary="Create Quest (Admin)",
        description="Create a new quest",
        tags=["Admin - Content"],
        request=QuestDetailSerializer
    )
    def post(self, request):
        serializer = QuestDetailSerializer(data=request.data)
        if serializer.is_valid():
            quest = serializer.save()
            
            ActivityLog.log_activity(
                request.user, 'admin_quest_create',
                f'Created quest: {quest.name}',
                metadata={'quest_id': str(quest.id)},
                request=request
            )
            
            return success_response(
                data={'quest': QuestDetailSerializer(quest).data},
                message='Quest created successfully'
            )
        return error_response('Invalid data', details=serializer.errors, status_code=400)


# =============================================================================
# ADMIN USER MANAGEMENT
# =============================================================================

class AdminUsersView(APIView):
    """
    GET /api/v1/admin/users - Get all users
    """
    permission_classes = [permissions.IsAdminUser]
    
    @extend_schema(
        summary="List All Users (Admin)",
        description="Get all users with pagination",
        tags=["Admin - Users"],
        parameters=[
            OpenApiParameter(name='page', description='Page number', type=int),
            OpenApiParameter(name='limit', description='Items per page', type=int),
            OpenApiParameter(name='search', description='Search by username or email'),
        ]
    )
    def get(self, request):
        page = int(request.query_params.get('page', 1))
        limit = int(request.query_params.get('limit', 20))
        search = request.query_params.get('search', '')
        
        users_query = User.objects.all()
        
        if search:
            users_query = users_query.filter(
                Q(username__icontains=search) | Q(email__icontains=search)
            )
        
        total = users_query.count()
        start = (page - 1) * limit
        end = start + limit
        
        users = users_query.select_related('gamestate')[start:end]
        
        users_data = []
        for user in users:
            try:
                game_state = user.gamestate
            except:
                game_state = None
            
            users_data.append({
                'id': str(user.id),
                'username': user.username,
                'email': user.email,
                'is_active': user.is_active,
                'is_staff': user.is_staff,
                'date_joined': user.date_joined.isoformat(),
                'level': game_state.level if game_state else 0,
                'points': game_state.points if game_state else 0
            })
        
        return success_response(data={
            'users': users_data,
            'total': total,
            'currentPage': page
        })


# =============================================================================
# ADMIN ANALYTICS
# =============================================================================

class AdminAnalyticsView(APIView):
    """
    GET /api/v1/admin/analytics - Get platform analytics
    """
    permission_classes = [permissions.IsAdminUser]
    
    @extend_schema(
        summary="Platform Analytics (Admin)",
        description="Get comprehensive platform analytics",
        tags=["Admin - Analytics"]
    )
    def get(self, request):
        from datetime import timedelta
        from django.utils import timezone
        from learning_vyakaran.models import LessonProgress, QuizResult
        
        now = timezone.now()
        week_ago = now - timedelta(days=7)
        month_ago = now - timedelta(days=30)
        
        # Total users
        total_users = User.objects.count()
        
        # Active users (logged in last 7 days)
        active_users = ActivityLog.objects.filter(
            created_at__gte=week_ago
        ).values('user').distinct().count()
        
        # Completion rates
        total_lessons = Lesson.objects.filter(is_published=True).count()
        completed_lessons_count = LessonProgress.objects.filter(completed=True).count()
        completion_rate = (completed_lessons_count / (total_users * total_lessons) * 100) if total_users > 0 and total_lessons > 0 else 0
        
        # Popular lessons
        popular_lessons = Lesson.objects.annotate(
            completions=Count('progress', filter=Q(progress__completed=True))
        ).order_by('-completions')[:5]
        
        popular_lessons_data = [
            {
                'id': str(lesson.id),
                'title': lesson.title,
                'completions': lesson.completions
            }
            for lesson in popular_lessons
        ]
        
        # User growth (last 30 days)
        user_growth = []
        for i in range(30):
            day = now - timedelta(days=i)
            count = User.objects.filter(date_joined__date=day.date()).count()
            user_growth.append({
                'date': day.date().isoformat(),
                'count': count
            })
        user_growth.reverse()
        
        analytics = {
            'totalUsers': total_users,
            'activeUsers': active_users,
            'completionRates': {
                'overall': round(completion_rate, 2)
            },
            'popularLessons': popular_lessons_data,
            'userGrowth': user_growth
        }
        
        return success_response(data=analytics)


# =============================================================================
# ADMIN BULK UPLOAD
# =============================================================================

class AdminBulkUploadView(APIView):
    """
    POST /api/v1/admin/content/bulk-upload - Bulk upload content
    """
    permission_classes = [permissions.IsAdminUser]
    
    @extend_schema(
        summary="Bulk Upload Content (Admin)",
        description="Bulk upload lessons, quizzes, or questions",
        tags=["Admin - Content"]
    )
    def post(self, request):
        content_type = request.data.get('type')
        data = request.data.get('data', [])
        
        if not content_type or not data:
            return error_response('Type and data are required', status_code=400)
        
        uploaded = 0
        failed = 0
        errors = []
        
        if content_type == 'lessons':
            for item in data:
                try:
                    serializer = LessonDetailSerializer(data=item)
                    if serializer.is_valid():
                        serializer.save()
                        uploaded += 1
                    else:
                        failed += 1
                        errors.append({
                            'item': item.get('title', 'Unknown'),
                            'errors': serializer.errors
                        })
                except Exception as e:
                    failed += 1
                    errors.append({
                        'item': item.get('title', 'Unknown'),
                        'error': str(e)
                    })
        
        # Log bulk upload
        ActivityLog.log_activity(
            request.user, 'admin_bulk_upload',
            f'Bulk uploaded {uploaded} {content_type}',
            metadata={'type': content_type, 'uploaded': uploaded, 'failed': failed},
            request=request
        )
        
        return success_response(data={
            'uploaded': uploaded,
            'failed': failed,
            'errors': errors
        })


# =============================================================================
# ADMIN BADGE MANAGEMENT
# =============================================================================

class AdminAwardBadgeView(APIView):
    """
    POST /api/v1/admin/badges/award
    Award a badge to a user (admin only).
    """
    permission_classes = [permissions.IsAdminUser]
    
    @extend_schema(
        summary="Award Badge (Admin)",
        description="Award a badge to a user",
        tags=["Admin - Badges"],
        request={
            'type': 'object',
            'properties': {
                'userId': {'type': 'string', 'format': 'uuid'},
                'badgeId': {'type': 'string', 'format': 'uuid'},
                'reason': {'type': 'string'}
            },
            'required': ['userId', 'badgeId']
        }
    )
    def post(self, request):
        from learning_vyakaran.models import Badge, UserBadge
        
        try:
            user_id = request.data.get('userId')
            badge_id = request.data.get('badgeId')
            reason = request.data.get('reason', 'Admin awarded')
            
            if not user_id or not badge_id:
                return error_response('userId and badgeId are required.')
            
            # Get user and badge
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return error_response('User not found.', code='NOT_FOUND')
            
            try:
                badge = Badge.objects.get(id=badge_id, is_active=True)
            except Badge.DoesNotExist:
                return error_response('Badge not found.', code='NOT_FOUND')
            
            # Create user badge
            user_badge, created = UserBadge.objects.get_or_create(
                user=user,
                badge=badge
            )
            
            if not created:
                return error_response('User already has this badge.', code='ALREADY_EXISTS')
            
            # Log activity
            ActivityLog.log_activity(
                request.user, 'admin_award_badge',
                f'Awarded badge {badge.name} to {user.username}: {reason}',
                metadata={
                    'user_id': str(user_id),
                    'badge_id': str(badge_id),
                    'reason': reason
                },
                request=request
            )
            
            return success_response(
                data={
                    'success': True,
                    'badge': {
                        'id': str(badge.id),
                        'name': badge.name,
                        'icon': badge.icon,
                        'badge_type': badge.badge_type
                    }
                },
                message=f'Badge {badge.name} awarded to {user.username}'
            )
        except Exception as e:
            return error_response(f'Error awarding badge: {str(e)}')

