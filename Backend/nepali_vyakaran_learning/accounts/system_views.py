"""
System monitoring and health check views.
"""

from django.utils import timezone
from django.db import connection
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from drf_spectacular.utils import extend_schema

from accounts.utils import success_response


class HealthCheckView(APIView):
    """
    GET /api/health
    Basic health check endpoint.
    """
    permission_classes = []  # Public endpoint
    authentication_classes = []
    
    @extend_schema(
        summary="Health Check",
        description="Basic health check to verify API is running",
        tags=["Monitoring"]
    )
    def get(self, request):
        return Response({
            'status': 'healthy',
            'timestamp': timezone.now().isoformat()
        }, status=status.HTTP_200_OK)


class StatusView(APIView):
    """
    GET /api/status
    Detailed status endpoint with system information.
    """
    permission_classes = []  # Public endpoint
    authentication_classes = []
    
    @extend_schema(
        summary="System Status",
        description="Get detailed system status and health information",
        tags=["Monitoring"]
    )
    def get(self, request):
        # Check database connection
        db_healthy = True
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
        except Exception:
            db_healthy = False
        
        # Get system info
        from django.contrib.auth import get_user_model
        from learning_vyakaran.models import Lesson, Quiz
        
        User = get_user_model()
        
        system_info = {
            'status': 'operational' if db_healthy else 'degraded',
            'timestamp': timezone.now().isoformat(),
            'version': '1.0.0',
            'environment': 'development' if settings.DEBUG else 'production',
            'services': {
                'database': 'healthy' if db_healthy else 'unhealthy',
                'api': 'healthy'
            },
            'stats': {
                'totalUsers': User.objects.count(),
                'totalLessons': Lesson.objects.count(),
                'totalQuizzes': Quiz.objects.count()
            }
        }
        
        return Response(system_info, status=status.HTTP_200_OK)


class MetricsView(APIView):
    """
    GET /api/metrics
    Performance metrics endpoint.
    """
    permission_classes = [permissions.IsAdminUser]
    
    @extend_schema(
        summary="System Metrics",
        description="Get system performance metrics (admin only)",
        tags=["Monitoring"]
    )
    def get(self, request):
        from django.contrib.auth import get_user_model
        from accounts.models import GameState, ActivityLog
        from learning_vyakaran.models import Lesson, Quiz, LessonProgress, QuizResult
        from datetime import timedelta
        
        User = get_user_model()
        now = timezone.now()
        week_ago = now - timedelta(days=7)
        
        metrics = {
            'timestamp': now.isoformat(),
            'users': {
                'total': User.objects.count(),
                'active_last_7_days': ActivityLog.objects.filter(
                    created_at__gte=week_ago
                ).values('user').distinct().count()
            },
            'content': {
                'lessons': Lesson.objects.count(),
                'quizzes': Quiz.objects.count(),
                'published_lessons': Lesson.objects.filter(is_published=True).count()
            },
            'engagement': {
                'lessons_completed_last_7_days': LessonProgress.objects.filter(
                    completed=True,
                    completed_at__gte=week_ago
                ).count(),
                'quizzes_taken_last_7_days': QuizResult.objects.filter(
                    created_at__gte=week_ago
                ).count(),
                'total_activities_last_7_days': ActivityLog.objects.filter(
                    created_at__gte=week_ago
                ).count()
            },
            'gamification': {
                'total_points_awarded': GameState.objects.aggregate(
                    total=sum('points' for _ in [0])
                ),
                'average_user_level': GameState.objects.aggregate(
                    avg_level=sum('level' for _ in [0]) / max(GameState.objects.count(), 1)
                )
            }
        }
        
        return success_response(data=metrics)
