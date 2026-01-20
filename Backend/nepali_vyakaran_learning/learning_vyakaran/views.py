"""
Views for the learning_vyakaran app.
Handles lessons, quizzes, gamification, and content APIs.
"""

import uuid
from django.utils import timezone
from django.db.models import Q
from rest_framework import status, generics, permissions, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from drf_spectacular.utils import extend_schema, OpenApiParameter

from accounts.utils import success_response, error_response
from accounts.models import GameState, ActivityLog

from .models import (
    Category, Lesson, LessonProgress, Quiz, Question, QuizResult,
    Village, BuildingType, VillageBuilding,
    Quest, QuestProgress,
    Achievement, UserAchievement, Badge, UserBadge,
    WritingPrompt, WritingSubmission,
    Game, GameSession, Leaderboard
)
from .serializers import (
    CategorySerializer,
    LessonListSerializer, LessonDetailSerializer, LessonContentSerializer,
    LessonProgressSerializer, CompleteLessonInputSerializer,
    QuizListSerializer, QuizDetailSerializer, QuestionSerializer,
    QuestionWithAnswerSerializer, SubmitQuizSerializer, QuizResultSerializer,
    QuizResultDetailSerializer, GrammarAssessmentSerializer, VocabularyAssessmentSerializer,
    VillageSerializer, BuildingTypeSerializer, VillageBuildingSerializer,
    AddBuildingSerializer, UpgradeBuildingSerializer, UpdateResourcesSerializer,
    QuestListSerializer, QuestDetailSerializer, QuestProgressSerializer, CompleteQuestSerializer,
    AchievementSerializer, UserAchievementSerializer, BadgeSerializer, UserBadgeSerializer,
    WritingPromptListSerializer, WritingPromptDetailSerializer,
    WritingSubmissionSerializer, SubmitWritingSerializer, SaveDraftSerializer, GrammarCheckSerializer,
    GameListSerializer, GameDetailSerializer, EndGameSerializer, GameSessionSerializer,
    GameLeaderboardSerializer
)


# =============================================================================
# CATEGORY VIEWS
# =============================================================================

class CategoryListView(generics.ListAPIView):
    """
    GET /api/v1/lessons/categories
    Get all lesson categories.
    """
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Get Categories",
        description="Get all lesson categories",
        tags=["Lessons"]
    )
    def get(self, request, *args, **kwargs):
        response = super().get(request, *args, **kwargs)
        return success_response(data={'categories': response.data})


# =============================================================================
# LESSON VIEWS
# =============================================================================

class LessonListView(generics.ListAPIView):
    """
    GET /api/v1/lessons
    Get all available lessons.
    """
    serializer_class = LessonListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category__slug', 'level', 'difficulty', 'is_premium']
    search_fields = ['title', 'title_nepali', 'description']
    ordering_fields = ['order', 'level', 'created_at']
    ordering = ['category', 'order', 'level']
    
    def get_queryset(self):
        return Lesson.objects.filter(is_published=True).select_related('category')
    
    @extend_schema(
        summary="Get Lessons",
        description="Get all available lessons with optional filtering",
        tags=["Lessons"],
        parameters=[
            OpenApiParameter(name='category', description='Filter by category slug'),
            OpenApiParameter(name='level', description='Filter by level', type=int),
        ]
    )
    def get(self, request, *args, **kwargs):
        response = super().get(request, *args, **kwargs)
        return success_response(data=response.data)


class LessonDetailView(generics.RetrieveAPIView):
    """
    GET /api/v1/lessons/{lesson_id}
    Get specific lesson details.
    """
    queryset = Lesson.objects.filter(is_published=True)
    serializer_class = LessonDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'id'
    lookup_url_kwarg = 'lesson_id'
    
    @extend_schema(
        summary="Get Lesson Details",
        description="Get specific lesson details",
        tags=["Lessons"]
    )
    def get(self, request, *args, **kwargs):
        response = super().get(request, *args, **kwargs)
        return success_response(data=response.data)


class LessonContentView(generics.RetrieveAPIView):
    """
    GET /api/v1/lessons/{lesson_id}/content
    Get lesson content.
    """
    queryset = Lesson.objects.filter(is_published=True)
    serializer_class = LessonContentSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'id'
    lookup_url_kwarg = 'lesson_id'
    
    @extend_schema(
        summary="Get Lesson Content",
        description="Get lesson content (sections, examples, explanations, media)",
        tags=["Lessons"]
    )
    def get(self, request, *args, **kwargs):
        response = super().get(request, *args, **kwargs)
        return success_response(data=response.data)


class StartLessonView(APIView):
    """
    POST /api/v1/lessons/{lesson_id}/start
    Start a lesson (track progress).
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Start Lesson",
        description="Start a lesson and begin tracking progress",
        tags=["Lessons"]
    )
    def post(self, request, lesson_id):
        try:
            lesson = Lesson.objects.get(id=lesson_id, is_published=True)
        except Lesson.DoesNotExist:
            return error_response('Lesson not found.', code='NOT_FOUND', status_code=status.HTTP_404_NOT_FOUND)
        
        # Create or update progress
        progress, created = LessonProgress.objects.get_or_create(
            user=request.user,
            lesson=lesson,
            defaults={'status': 'in_progress'}
        )
        
        session_id = str(uuid.uuid4())
        progress.session_id = session_id
        progress.started_at = timezone.now()
        progress.status = 'in_progress'
        progress.attempts += 1
        progress.save()
        
        ActivityLog.log_activity(
            request.user, 'lesson_start',
            f'Started lesson: {lesson.title}',
            metadata={'lesson_id': str(lesson_id)},
            request=request
        )
        
        return success_response(data={
            'sessionId': session_id,
            'startTime': progress.started_at.isoformat(),
            'lessonData': LessonDetailSerializer(lesson, context={'request': request}).data
        })


class CompleteLessonAPIView(APIView):
    """
    POST /api/v1/lessons/{lesson_id}/complete
    Complete a lesson.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Complete Lesson",
        description="Complete a lesson and receive rewards",
        tags=["Lessons"],
        request=CompleteLessonInputSerializer
    )
    def post(self, request, lesson_id):
        serializer = CompleteLessonInputSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response('Invalid data', details=serializer.errors)
        
        try:
            lesson = Lesson.objects.get(id=lesson_id, is_published=True)
        except Lesson.DoesNotExist:
            return error_response('Lesson not found.', code='NOT_FOUND', status_code=status.HTTP_404_NOT_FOUND)
        
        score = serializer.validated_data['score']
        time_spent = serializer.validated_data['time_spent']
        
        # Update progress
        progress, _ = LessonProgress.objects.get_or_create(
            user=request.user, lesson=lesson
        )
        progress.status = 'completed'
        progress.score = score
        progress.best_score = max(progress.best_score, score)
        progress.time_spent += time_spent
        progress.completed_at = timezone.now()
        progress.progress_data = {'answers': serializer.validated_data['answers']}
        progress.save()
        
        # Calculate rewards
        points_earned = int(lesson.points_reward * (score / 100))
        coins_earned = int(lesson.coins_reward * (score / 100))
        
        # Update game state
        game_state, _ = GameState.objects.get_or_create(user=request.user)
        if str(lesson_id) not in game_state.completed_lessons:
            game_state.completed_lessons.append(str(lesson_id))
        game_state.add_points(points_earned, f'Completed lesson: {lesson.title}')
        game_state.coins += coins_earned
        game_state.total_time_spent += time_spent
        game_state.update_streak()
        game_state.save()
        
        ActivityLog.log_activity(
            request.user, 'lesson_complete',
            f'Completed lesson: {lesson.title} with score {score}%',
            metadata={'lesson_id': str(lesson_id), 'score': score},
            request=request
        )
        
        # Find next lesson
        next_lesson = Lesson.objects.filter(
            category=lesson.category,
            order__gt=lesson.order,
            is_published=True
        ).first()
        
        return success_response(data={
            'completed': True,
            'score': score,
            'pointsEarned': points_earned,
            'coinsEarned': coins_earned,
            'nextLesson': LessonListSerializer(next_lesson, context={'request': request}).data if next_lesson else None
        })


class LessonQuestionsView(generics.ListAPIView):
    """
    GET /api/v1/lessons/{lesson_id}/questions/
    Get all questions for a specific lesson.
    """
    serializer_class = QuestionSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        lesson_id = self.kwargs.get('lesson_id')
        
        # Verify lesson exists and is published
        try:
            lesson = Lesson.objects.get(id=lesson_id, is_published=True)
        except Lesson.DoesNotExist:
            return Question.objects.none()
        
        # Return questions for this lesson, ordered
        return Question.objects.filter(
            lesson=lesson
        ).order_by('order')
    
    @extend_schema(
        summary="Get Lesson Questions",
        description="Get all questions/exercises for a specific lesson",
        tags=["Lessons"]
    )
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return success_response(data=serializer.data)


class LessonProgressView(APIView):
    """
    GET /api/v1/lessons/progress
    Get user's lesson progress.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Get Lesson Progress",
        description="Get user's overall lesson progress",
        tags=["Lessons"]
    )
    def get(self, request):
        total_lessons = Lesson.objects.filter(is_published=True).count()
        progress = LessonProgress.objects.filter(user=request.user)
        
        completed = progress.filter(status='completed').count()
        in_progress = progress.filter(status='in_progress').count()
        
        # Category progress
        categories = Category.objects.filter(is_active=True)
        category_progress = []
        for cat in categories:
            cat_lessons = cat.lessons.filter(is_published=True).count()
            cat_completed = progress.filter(
                lesson__category=cat, status='completed'
            ).count()
            category_progress.append({
                'category': cat.name,
                'slug': cat.slug,
                'total': cat_lessons,
                'completed': cat_completed,
                'percentage': round((cat_completed / cat_lessons * 100) if cat_lessons > 0 else 0, 1)
            })
        
        return success_response(data={
            'totalLessons': total_lessons,
            'completedLessons': completed,
            'inProgressLessons': in_progress,
            'lockedLessons': total_lessons - completed - in_progress,
            'categoryProgress': category_progress
        })


# =============================================================================
# QUIZ VIEWS
# =============================================================================

class QuizListView(generics.ListAPIView):
    """
    GET /api/v1/quizzes
    Get available quizzes.
    """
    serializer_class = QuizListSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['category__slug', 'difficulty', 'quiz_type']
    search_fields = ['title', 'title_nepali']
    
    def get_queryset(self):
        return Quiz.objects.filter(is_published=True).select_related('category')
    
    @extend_schema(
        summary="Get Quizzes",
        description="Get available quizzes with optional filtering",
        tags=["Quizzes"]
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class QuizDetailView(generics.RetrieveAPIView):
    """
    GET /api/v1/quizzes/{quiz_id}
    Get specific quiz details.
    """
    queryset = Quiz.objects.filter(is_published=True)
    serializer_class = QuizDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'
    lookup_url_kwarg = 'quiz_id'
    
    @extend_schema(
        summary="Get Quiz Details",
        description="Get specific quiz with questions",
        tags=["Quizzes"]
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class StartQuizView(APIView):
    """
    POST /api/v1/quizzes/{quiz_id}/start
    Start a quiz session.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Start Quiz",
        description="Start a quiz session",
        tags=["Quizzes"]
    )
    def post(self, request, quiz_id):
        try:
            quiz = Quiz.objects.get(id=quiz_id, is_published=True)
        except Quiz.DoesNotExist:
            return error_response('Quiz not found.', code='NOT_FOUND', status_code=status.HTTP_404_NOT_FOUND)
        
        session_id = str(uuid.uuid4())
        start_time = timezone.now()
        
        # Store session in user's session or cache
        request.session[f'quiz_session_{session_id}'] = {
            'quiz_id': str(quiz_id),
            'start_time': start_time.isoformat()
        }
        
        ActivityLog.log_activity(
            request.user, 'quiz_start',
            f'Started quiz: {quiz.title}',
            metadata={'quiz_id': str(quiz_id), 'session_id': session_id},
            request=request
        )
        
        return success_response(data={
            'sessionId': session_id,
            'quiz': QuizDetailSerializer(quiz, context={'request': request}).data,
            'startTime': start_time.isoformat()
        })


class SubmitQuizView(APIView):
    """
    POST /api/v1/quizzes/{quiz_id}/submit
    Submit quiz answers.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Submit Quiz",
        description="Submit quiz answers and receive results",
        tags=["Quizzes"],
        request=SubmitQuizSerializer
    )
    def post(self, request, quiz_id):
        serializer = SubmitQuizSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response('Invalid data', details=serializer.errors)
        
        try:
            quiz = Quiz.objects.get(id=quiz_id, is_published=True)
        except Quiz.DoesNotExist:
            return error_response('Quiz not found.', code='NOT_FOUND', status_code=status.HTTP_404_NOT_FOUND)
        
        session_id = serializer.validated_data['session_id']
        answers = serializer.validated_data['answers']
        time_spent = serializer.validated_data['time_spent']
        
        # Grade the quiz
        questions = quiz.questions.filter(is_active=True)
        total_questions = questions.count()
        correct_count = 0
        feedback = []
        
        for i, question in enumerate(questions):
            user_answer = answers[i] if i < len(answers) else None
            is_correct = self._check_answer(question, user_answer)
            
            if is_correct:
                correct_count += 1
            
            feedback.append({
                'question_id': str(question.id),
                'correct': is_correct,
                'user_answer': user_answer,
                'correct_answer': question.correct_answer if quiz.show_answers else None,
                'explanation': question.explanation if quiz.show_answers else None
            })
        
        # Calculate score
        score = correct_count * (100 // total_questions) if total_questions > 0 else 0
        percentage = (correct_count / total_questions * 100) if total_questions > 0 else 0
        passed = percentage >= quiz.pass_percentage
        
        # Calculate rewards
        points_earned = int(quiz.points_reward * (percentage / 100))
        coins_earned = int(quiz.coins_reward * (percentage / 100))
        
        # Create result record
        result = QuizResult.objects.create(
            user=request.user,
            quiz=quiz,
            score=score,
            percentage=percentage,
            correct_answers=correct_count,
            total_questions=total_questions,
            time_spent=time_spent,
            session_id=session_id,
            started_at=timezone.now() - timezone.timedelta(seconds=time_spent),
            answers=answers,
            feedback=feedback,
            passed=passed,
            points_earned=points_earned,
            coins_earned=coins_earned
        )
        
        # Update game state
        game_state, _ = GameState.objects.get_or_create(user=request.user)
        game_state.add_points(points_earned, f'Completed quiz: {quiz.title}')
        game_state.coins += coins_earned
        game_state.total_correct_answers += correct_count
        game_state.total_questions_attempted += total_questions
        game_state.total_time_spent += time_spent
        game_state.update_streak()
        game_state.save()
        
        ActivityLog.log_activity(
            request.user, 'quiz_complete',
            f'Completed quiz: {quiz.title} with score {score}%',
            metadata={'quiz_id': str(quiz_id), 'score': score, 'passed': passed},
            request=request
        )
        
        return success_response(data={
            'score': score,
            'correctAnswers': correct_count,
            'totalQuestions': total_questions,
            'pointsEarned': points_earned,
            'coinsEarned': coins_earned,
            'passed': passed,
            'feedback': feedback if quiz.show_answers else []
        })
    
    def _check_answer(self, question, user_answer):
        """Check if the user's answer is correct."""
        correct = question.correct_answer
        
        if question.question_type == 'multiple_choice':
            return str(user_answer) == str(correct.get('answer', ''))
        elif question.question_type == 'true_false':
            return str(user_answer).lower() == str(correct.get('answer', '')).lower()
        elif question.question_type == 'fill_blank':
            correct_answers = correct.get('answers', [correct.get('answer', '')])
            return str(user_answer).strip().lower() in [a.lower() for a in correct_answers]
        else:
            return str(user_answer) == str(correct.get('answer', ''))


class QuizResultsView(APIView):
    """
    GET /api/v1/quizzes/{quiz_id}/results
    Get quiz results.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Get Quiz Results",
        description="Get results for a specific quiz session",
        tags=["Quizzes"],
        parameters=[
            OpenApiParameter(name='session_id', description='Quiz session ID', required=True),
        ]
    )
    def get(self, request, quiz_id):
        session_id = request.query_params.get('session_id')
        
        if not session_id:
            return error_response('Session ID is required.', code='MISSING_PARAM')
        
        try:
            result = QuizResult.objects.get(
                user=request.user,
                quiz_id=quiz_id,
                session_id=session_id
            )
        except QuizResult.DoesNotExist:
            return error_response('Result not found.', code='NOT_FOUND', status_code=status.HTTP_404_NOT_FOUND)
        
        return success_response(data=QuizResultDetailSerializer(result).data)


# =============================================================================
# ASSESSMENT VIEWS
# =============================================================================

class GrammarAssessmentView(APIView):
    """
    POST /api/v1/assessments/grammar
    Grammar assessment.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Grammar Assessment",
        description="Submit answer for grammar assessment",
        tags=["Assessments"],
        request=GrammarAssessmentSerializer
    )
    def post(self, request):
        serializer = GrammarAssessmentSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response('Invalid data', details=serializer.errors)
        
        question_id = serializer.validated_data['question_id']
        answer = serializer.validated_data['answer']
        
        try:
            question = Question.objects.get(id=question_id)
        except Question.DoesNotExist:
            return error_response('Question not found.', code='NOT_FOUND', status_code=status.HTTP_404_NOT_FOUND)
        
        # Check answer
        correct = str(answer).strip().lower() == str(question.correct_answer.get('answer', '')).strip().lower()
        points = question.points if correct else 0
        
        # Update stats
        game_state, _ = GameState.objects.get_or_create(user=request.user)
        if correct:
            game_state.total_correct_answers += 1
            game_state.add_points(points, 'Grammar assessment')
        game_state.total_questions_attempted += 1
        game_state.save()
        
        return success_response(data={
            'correct': correct,
            'explanation': question.explanation,
            'points': points
        })


class VocabularyAssessmentView(APIView):
    """
    POST /api/v1/assessments/vocabulary
    Vocabulary assessment.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Vocabulary Assessment",
        description="Submit answer for vocabulary assessment",
        tags=["Assessments"],
        request=VocabularyAssessmentSerializer
    )
    def post(self, request):
        serializer = VocabularyAssessmentSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response('Invalid data', details=serializer.errors)
        
        question_id = serializer.validated_data['question_id']
        answer = serializer.validated_data['answer']
        
        try:
            question = Question.objects.get(id=question_id)
        except Question.DoesNotExist:
            return error_response('Question not found.', code='NOT_FOUND', status_code=status.HTTP_404_NOT_FOUND)
        
        # Check answer
        correct = str(answer).strip().lower() == str(question.correct_answer.get('answer', '')).strip().lower()
        points = question.points if correct else 0
        
        # Update stats
        game_state, _ = GameState.objects.get_or_create(user=request.user)
        if correct:
            game_state.total_correct_answers += 1
            game_state.add_points(points, 'Vocabulary assessment')
        game_state.total_questions_attempted += 1
        game_state.save()
        
        return success_response(data={
            'correct': correct,
            'translation': question.correct_answer.get('translation', ''),
            'usage': question.explanation,
            'points': points
        })


# =============================================================================
# VILLAGE VIEWS
# =============================================================================

class VillageView(APIView):
    """
    GET /api/v1/village - Get user's village
    PUT /api/v1/village - Update village
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Get Village",
        description="Get user's village data",
        tags=["Village"]
    )
    def get(self, request):
        village, _ = Village.objects.get_or_create(user=request.user)
        return success_response(data=VillageSerializer(village).data)
    
    @extend_schema(
        summary="Update Village",
        description="Update village data",
        tags=["Village"]
    )
    def put(self, request):
        village, _ = Village.objects.get_or_create(user=request.user)
        serializer = VillageSerializer(village, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return success_response(data=serializer.data, message='Village updated.')
        return error_response('Invalid data', details=serializer.errors)


class BuildingTypesView(generics.ListAPIView):
    """
    GET /api/v1/village/buildings/types
    Get available building types.
    """
    queryset = BuildingType.objects.filter(is_active=True)
    serializer_class = BuildingTypeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Get Building Types",
        description="Get all available building types",
        tags=["Village"]
    )
    def get(self, request, *args, **kwargs):
        response = super().get(request, *args, **kwargs)
        return success_response(data={'buildingTypes': response.data})


class AddBuildingView(APIView):
    """
    POST /api/v1/village/buildings/add
    Add a new building.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Add Building",
        description="Add a new building to the village",
        tags=["Village"],
        request=AddBuildingSerializer
    )
    def post(self, request):
        serializer = AddBuildingSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response('Invalid data', details=serializer.errors)
        
        village, _ = Village.objects.get_or_create(user=request.user)
        
        try:
            building_type = BuildingType.objects.get(slug=serializer.validated_data['building_type'])
        except BuildingType.DoesNotExist:
            return error_response('Building type not found.', code='NOT_FOUND')
        
        # Check requirements
        if village.level < building_type.min_village_level:
            return error_response(f'Village level {building_type.min_village_level} required.')
        
        if village.coins < building_type.coin_cost:
            return error_response('Insufficient coins.')
        
        # Create building
        position = serializer.validated_data['position']
        building = VillageBuilding.objects.create(
            village=village,
            building_type=building_type,
            position_x=position.get('x', 0),
            position_y=position.get('y', 0),
            level=serializer.validated_data.get('level', 1)
        )
        
        # Deduct cost
        village.coins -= building_type.coin_cost
        village.knowledge_points -= building_type.knowledge_cost
        village.save()
        
        return success_response(data={
            'building': VillageBuildingSerializer(building).data,
            'remainingResources': {
                'coins': village.coins,
                'knowledge': village.knowledge_points
            },
            'success': True
        })


class UpgradeBuildingView(APIView):
    """
    PUT /api/v1/village/buildings/{building_id}/upgrade
    Upgrade a building.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Upgrade Building",
        description="Upgrade a village building",
        tags=["Village"],
        request=UpgradeBuildingSerializer
    )
    def put(self, request, building_id):
        serializer = UpgradeBuildingSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response('Invalid data', details=serializer.errors)
        
        try:
            building = VillageBuilding.objects.get(
                id=building_id,
                village__user=request.user
            )
        except VillageBuilding.DoesNotExist:
            return error_response('Building not found.', code='NOT_FOUND')
        
        target_level = serializer.validated_data['target_level']
        
        if target_level <= building.level:
            return error_response('Target level must be higher than current level.')
        
        # Calculate upgrade cost (simple formula)
        upgrade_cost = building.building_type.coin_cost * (target_level - building.level)
        
        village = building.village
        if village.coins < upgrade_cost:
            return error_response('Insufficient coins for upgrade.')
        
        # Perform upgrade
        village.coins -= upgrade_cost
        village.save()
        
        building.level = target_level
        building.save()
        
        return success_response(data={
            'building': VillageBuildingSerializer(building).data,
            'remainingResources': {'coins': village.coins},
            'success': True
        })


class RemoveBuildingView(APIView):
    """
    DELETE /api/v1/village/buildings/{building_id}
    Remove a building.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Remove Building",
        description="Remove a building from the village",
        tags=["Village"]
    )
    def delete(self, request, building_id):
        try:
            building = VillageBuilding.objects.get(
                id=building_id,
                village__user=request.user
            )
        except VillageBuilding.DoesNotExist:
            return error_response('Building not found.', code='NOT_FOUND')
        
        # Calculate refund (50% of original cost)
        refund = building.building_type.coin_cost // 2
        
        village = building.village
        village.coins += refund
        village.save()
        
        building.delete()
        
        return success_response(data={
            'success': True,
            'refundedResources': {'coins': refund}
        })


class VillageResourcesView(APIView):
    """
    GET /api/v1/village/resources
    POST /api/v1/village/resources/update
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Get Village Resources",
        description="Get village resources",
        tags=["Village"]
    )
    def get(self, request):
        village, _ = Village.objects.get_or_create(user=request.user)
        return success_response(data={
            'coins': village.coins,
            'knowledge': village.knowledge_points,
            'books': village.books,
            'energy': village.energy
        })
    
    @extend_schema(
        summary="Update Village Resources",
        description="Update village resources",
        tags=["Village"],
        request=UpdateResourcesSerializer
    )
    def post(self, request):
        serializer = UpdateResourcesSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response('Invalid data', details=serializer.errors)
        
        village, _ = Village.objects.get_or_create(user=request.user)
        operation = serializer.validated_data['operation']
        
        if 'coins' in serializer.validated_data:
            if operation == 'add':
                village.coins += serializer.validated_data['coins']
            else:
                village.coins = max(0, village.coins - serializer.validated_data['coins'])
        
        if 'knowledge' in serializer.validated_data:
            if operation == 'add':
                village.knowledge_points += serializer.validated_data['knowledge']
            else:
                village.knowledge_points = max(0, village.knowledge_points - serializer.validated_data['knowledge'])
        
        if 'books' in serializer.validated_data:
            if operation == 'add':
                village.books += serializer.validated_data['books']
            else:
                village.books = max(0, village.books - serializer.validated_data['books'])
        
        if 'energy' in serializer.validated_data:
            if operation == 'add':
                village.energy = min(village.max_energy, village.energy + serializer.validated_data['energy'])
            else:
                village.energy = max(0, village.energy - serializer.validated_data['energy'])
        
        village.save()
        
        return success_response(data={
            'resources': {
                'coins': village.coins,
                'knowledge': village.knowledge_points,
                'books': village.books,
                'energy': village.energy
            },
            'success': True
        })


# =============================================================================
# QUEST VIEWS
# =============================================================================

class QuestListView(generics.ListAPIView):
    """
    GET /api/v1/quests
    Get available quests.
    """
    serializer_class = QuestListSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['quest_type', 'category', 'difficulty']
    
    def get_queryset(self):
        return Quest.objects.filter(is_active=True)
    
    @extend_schema(
        summary="Get Quests",
        description="Get available quests",
        tags=["Quests"]
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class QuestDetailView(generics.RetrieveAPIView):
    """
    GET /api/v1/quests/{quest_id}
    Get specific quest details.
    """
    queryset = Quest.objects.filter(is_active=True)
    serializer_class = QuestDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'
    lookup_url_kwarg = 'quest_id'


class StartQuestView(APIView):
    """
    POST /api/v1/quests/{quest_id}/start
    Start a quest.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Start Quest",
        description="Start a quest",
        tags=["Quests"]
    )
    def post(self, request, quest_id):
        try:
            quest = Quest.objects.get(id=quest_id, is_active=True)
        except Quest.DoesNotExist:
            return error_response('Quest not found.', code='NOT_FOUND')
        
        # Check level requirement
        game_state, _ = GameState.objects.get_or_create(user=request.user)
        if game_state.level < quest.min_level:
            return error_response(f'Level {quest.min_level} required.')
        
        progress, created = QuestProgress.objects.get_or_create(
            user=request.user,
            quest=quest,
            defaults={'status': 'active', 'started_at': timezone.now()}
        )
        
        if not created and progress.status == 'active':
            return error_response('Quest already in progress.')
        
        progress.status = 'active'
        progress.started_at = timezone.now()
        progress.save()
        
        ActivityLog.log_activity(
            request.user, 'quest_started',
            f'Started quest: {quest.name}',
            metadata={'quest_id': str(quest_id)},
            request=request
        )
        
        session_id = str(uuid.uuid4())
        
        return success_response(data={
            'quest': QuestDetailSerializer(quest, context={'request': request}).data,
            'startTime': progress.started_at.isoformat(),
            'sessionId': session_id
        })


class CompleteQuestView(APIView):
    """
    POST /api/v1/quests/{quest_id}/complete
    Complete a quest.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Complete Quest",
        description="Complete a quest",
        tags=["Quests"],
        request=CompleteQuestSerializer
    )
    def post(self, request, quest_id):
        try:
            quest = Quest.objects.get(id=quest_id)
            progress = QuestProgress.objects.get(user=request.user, quest=quest, status='active')
        except (Quest.DoesNotExist, QuestProgress.DoesNotExist):
            return error_response('Quest or progress not found.', code='NOT_FOUND')
        
        # Mark completed
        progress.status = 'completed'
        progress.completed_at = timezone.now()
        progress.progress_percentage = 100
        progress.save()
        
        # Award rewards
        game_state, _ = GameState.objects.get_or_create(user=request.user)
        game_state.add_points(quest.points_reward, f'Completed quest: {quest.name}')
        game_state.coins += quest.coins_reward
        game_state.experience += quest.experience_reward
        game_state.save()
        
        ActivityLog.log_activity(
            request.user, 'quest_completed',
            f'Completed quest: {quest.name}',
            metadata={'quest_id': str(quest_id)},
            request=request
        )
        
        return success_response(data={
            'completed': True,
            'rewards': {
                'points': quest.points_reward,
                'coins': quest.coins_reward,
                'experience': quest.experience_reward
            },
            'achievements': [],
            'nextQuest': None  # TODO: Find next quest in chain
        })


class DailyQuestsView(APIView):
    """
    GET /api/v1/quests/daily
    Get daily quests.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Get Daily Quests",
        description="Get daily quests",
        tags=["Quests"]
    )
    def get(self, request):
        today = timezone.now().date()
        quests = Quest.objects.filter(quest_type='daily', is_active=True)
        
        # Get completed today
        completed_today = QuestProgress.objects.filter(
            user=request.user,
            quest__quest_type='daily',
            status='completed',
            completed_at__date=today
        ).count()
        
        # Reset time (midnight)
        reset_time = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
        reset_time += timezone.timedelta(days=1)
        
        return success_response(data={
            'quests': QuestListSerializer(quests, many=True, context={'request': request}).data,
            'resetTime': reset_time.isoformat(),
            'completedToday': completed_today
        })


class QuestProgressView(APIView):
    """
    GET /api/v1/quests/progress
    Get quest progress.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Get Quest Progress",
        description="Get user's quest progress",
        tags=["Quests"]
    )
    def get(self, request):
        active = QuestProgress.objects.filter(user=request.user, status='active')
        completed = QuestProgress.objects.filter(user=request.user, status='completed').count()
        total = Quest.objects.filter(is_active=True).count()
        
        return success_response(data={
            'activeQuests': QuestProgressSerializer(active, many=True).data,
            'completedQuests': completed,
            'totalQuests': total
        })


# =============================================================================
# ACHIEVEMENT & BADGE VIEWS
# =============================================================================

class AchievementListView(generics.ListAPIView):
    """
    GET /api/v1/achievements
    Get all achievements.
    """
    serializer_class = AchievementSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Show non-hidden or earned hidden achievements
        user = self.request.user
        earned_ids = UserAchievement.objects.filter(user=user).values_list('achievement_id', flat=True)
        return Achievement.objects.filter(
            Q(is_hidden=False) | Q(id__in=earned_ids),
            is_active=True
        )
    
    @extend_schema(
        summary="Get Achievements",
        description="Get all achievements",
        tags=["Achievements"]
    )
    def get(self, request, *args, **kwargs):
        response = super().get(request, *args, **kwargs)
        
        earned = UserAchievement.objects.filter(user=request.user)
        locked = Achievement.objects.filter(is_active=True).exclude(
            id__in=earned.values_list('achievement_id', flat=True)
        )
        
        return success_response(data={
            'achievements': response.data,
            'earned': UserAchievementSerializer(earned, many=True).data,
            'locked': AchievementSerializer(locked, many=True, context={'request': request}).data
        })


class AchievementDetailView(generics.RetrieveAPIView):
    """
    GET /api/v1/achievements/{achievement_id}
    Get achievement details.
    """
    queryset = Achievement.objects.filter(is_active=True)
    serializer_class = AchievementSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'
    lookup_url_kwarg = 'achievement_id'


class ClaimAchievementView(APIView):
    """
    POST /api/v1/achievements/{achievement_id}/claim
    Claim achievement reward.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Claim Achievement",
        description="Claim achievement reward",
        tags=["Achievements"]
    )
    def post(self, request, achievement_id):
        try:
            user_achievement = UserAchievement.objects.get(
                user=request.user,
                achievement_id=achievement_id
            )
        except UserAchievement.DoesNotExist:
            return error_response('Achievement not earned.', code='NOT_EARNED')
        
        if user_achievement.rewards_claimed:
            return error_response('Rewards already claimed.', code='ALREADY_CLAIMED')
        
        achievement = user_achievement.achievement
        
        # Award rewards
        game_state, _ = GameState.objects.get_or_create(user=request.user)
        game_state.add_points(achievement.points_reward, f'Achievement: {achievement.name}')
        game_state.coins += achievement.coins_reward
        game_state.save()
        
        user_achievement.rewards_claimed = True
        user_achievement.claimed_at = timezone.now()
        user_achievement.save()
        
        return success_response(data={
            'claimed': True,
            'reward': {
                'points': achievement.points_reward,
                'coins': achievement.coins_reward
            }
        })


class BadgeListView(generics.ListAPIView):
    """
    GET /api/v1/badges
    Get user's badges.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Get Badges",
        description="Get user's badges",
        tags=["Badges"]
    )
    def get(self, request, *args, **kwargs):
        badges = UserBadge.objects.filter(user=request.user).select_related('badge')
        all_badges = Badge.objects.filter(is_active=True)
        
        return success_response(data={
            'badges': UserBadgeSerializer(badges, many=True).data,
            'totalBadges': all_badges.count(),
            'recentBadges': UserBadgeSerializer(badges[:5], many=True).data
        })


# =============================================================================
# WRITING VIEWS
# =============================================================================

class WritingPromptListView(generics.ListAPIView):
    """
    GET /api/v1/writing/prompts
    Get writing prompts.
    """
    serializer_class = WritingPromptListSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['prompt_type', 'difficulty']
    
    def get_queryset(self):
        return WritingPrompt.objects.filter(is_active=True)


class WritingPromptDetailView(generics.RetrieveAPIView):
    """
    GET /api/v1/writing/prompts/{prompt_id}
    Get specific writing prompt.
    """
    queryset = WritingPrompt.objects.filter(is_active=True)
    serializer_class = WritingPromptDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'
    lookup_url_kwarg = 'prompt_id'


class SubmitWritingView(APIView):
    """
    POST /api/v1/writing/submit
    Submit writing for evaluation.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Submit Writing",
        description="Submit writing for evaluation",
        tags=["Writing"],
        request=SubmitWritingSerializer
    )
    def post(self, request):
        serializer = SubmitWritingSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response('Invalid data', details=serializer.errors)
        
        try:
            prompt = WritingPrompt.objects.get(id=serializer.validated_data['prompt_id'])
        except WritingPrompt.DoesNotExist:
            return error_response('Prompt not found.', code='NOT_FOUND')
        
        content = serializer.validated_data['content']
        word_count = serializer.validated_data['word_count']
        time_spent = serializer.validated_data['time_spent']
        
        # Basic scoring (can be enhanced with AI)
        score = min(100, int((word_count / prompt.min_words) * 50) + 50)
        
        submission = WritingSubmission.objects.create(
            user=request.user,
            prompt=prompt,
            content=content,
            word_count=word_count,
            status='submitted',
            score=score,
            grammar_score=score,
            vocabulary_score=score,
            structure_score=score,
            creativity_score=score,
            time_spent=time_spent,
            submitted_at=timezone.now()
        )
        
        # Calculate rewards
        points = int(prompt.points_reward * (score / 100))
        coins = int(prompt.coins_reward * (score / 100))
        
        submission.points_earned = points
        submission.coins_earned = coins
        submission.save()
        
        # Update game state
        game_state, _ = GameState.objects.get_or_create(user=request.user)
        game_state.add_points(points, 'Writing submission')
        game_state.coins += coins
        game_state.save()
        
        ActivityLog.log_activity(
            request.user, 'writing_submitted',
            f'Submitted writing for: {prompt.title}',
            metadata={'prompt_id': str(prompt.id), 'word_count': word_count},
            request=request
        )
        
        return success_response(data={
            'submissionId': str(submission.id),
            'feedback': {'message': 'Submission received.'},
            'score': score,
            'suggestions': [],
            'pointsEarned': points
        })


class WritingSubmissionsView(generics.ListAPIView):
    """
    GET /api/v1/writing/submissions
    Get user's writing submissions.
    """
    serializer_class = WritingSubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return WritingSubmission.objects.filter(user=self.request.user)


class WritingSubmissionDetailView(generics.RetrieveAPIView):
    """
    GET /api/v1/writing/submissions/{submission_id}
    Get specific submission details.
    """
    serializer_class = WritingSubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'
    lookup_url_kwarg = 'submission_id'
    
    def get_queryset(self):
        return WritingSubmission.objects.filter(user=self.request.user)


class SaveDraftView(APIView):
    """
    POST /api/v1/writing/save-draft
    Save writing draft.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Save Draft",
        description="Save writing draft",
        tags=["Writing"],
        request=SaveDraftSerializer
    )
    def post(self, request):
        serializer = SaveDraftSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response('Invalid data', details=serializer.errors)
        
        try:
            prompt = WritingPrompt.objects.get(id=serializer.validated_data['prompt_id'])
        except WritingPrompt.DoesNotExist:
            return error_response('Prompt not found.', code='NOT_FOUND')
        
        # Get or create draft
        draft, created = WritingSubmission.objects.get_or_create(
            user=request.user,
            prompt=prompt,
            status='draft',
            defaults={
                'content': serializer.validated_data['content'],
                'title': serializer.validated_data.get('title', ''),
                'word_count': len(serializer.validated_data['content'].split())
            }
        )
        
        if not created:
            draft.content = serializer.validated_data['content']
            draft.title = serializer.validated_data.get('title', draft.title)
            draft.word_count = len(serializer.validated_data['content'].split())
            draft.save()
        
        return success_response(data={
            'draftId': str(draft.id),
            'savedAt': draft.updated_at.isoformat()
        })


class DraftsListView(generics.ListAPIView):
    """
    GET /api/v1/writing/drafts
    Get saved drafts.
    """
    serializer_class = WritingSubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return WritingSubmission.objects.filter(user=self.request.user, status='draft')


class DeleteDraftView(APIView):
    """
    DELETE /api/v1/writing/drafts/{draft_id}
    Delete a draft.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def delete(self, request, draft_id):
        try:
            draft = WritingSubmission.objects.get(
                id=draft_id,
                user=request.user,
                status='draft'
            )
        except WritingSubmission.DoesNotExist:
            return error_response('Draft not found.', code='NOT_FOUND')
        
        draft.delete()
        return success_response(message='Draft deleted.')


class GrammarCheckView(APIView):
    """
    POST /api/v1/writing/grammar-check
    Check grammar in text.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Grammar Check",
        description="Check grammar in text",
        tags=["Writing"],
        request=GrammarCheckSerializer
    )
    def post(self, request):
        serializer = GrammarCheckSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response('Invalid data', details=serializer.errors)
        
        text = serializer.validated_data['text']
        
        # Basic grammar check (placeholder - can integrate with AI)
        corrections = []
        suggestions = []
        score = 85  # Placeholder score
        
        return success_response(data={
            'corrections': corrections,
            'suggestions': suggestions,
            'score': score
        })


# =============================================================================
# GAME VIEWS
# =============================================================================

class GameListView(generics.ListAPIView):
    """
    GET /api/v1/games
    Get available games.
    """
    serializer_class = GameListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Game.objects.filter(is_active=True)
    
    @extend_schema(
        summary="Get Games",
        description="Get available games",
        tags=["Games"]
    )
    def get(self, request, *args, **kwargs):
        response = super().get(request, *args, **kwargs)
        featured = Game.objects.filter(is_active=True, is_featured=True)
        
        return success_response(data={
            'games': response.data,
            'featured': GameListSerializer(featured, many=True, context={'request': request}).data
        })


class GameDetailView(generics.RetrieveAPIView):
    """
    GET /api/v1/games/{game_id}
    Get specific game details.
    """
    queryset = Game.objects.filter(is_active=True)
    serializer_class = GameDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'
    lookup_url_kwarg = 'game_id'


class StartGameView(APIView):
    """
    POST /api/v1/games/{game_id}/start
    Start a game session.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Start Game",
        description="Start a game session",
        tags=["Games"]
    )
    def post(self, request, game_id):
        try:
            game = Game.objects.get(id=game_id, is_active=True)
        except Game.DoesNotExist:
            return error_response('Game not found.', code='NOT_FOUND')
        
        session_id = str(uuid.uuid4())
        start_time = timezone.now()
        
        ActivityLog.log_activity(
            request.user, 'game_played',
            f'Started game: {game.name}',
            metadata={'game_id': str(game_id)},
            request=request
        )
        
        return success_response(data={
            'sessionId': session_id,
            'gameData': GameDetailSerializer(game).data,
            'startTime': start_time.isoformat()
        })


class EndGameView(APIView):
    """
    POST /api/v1/games/{game_id}/end
    End a game session.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="End Game",
        description="End game session and submit score",
        tags=["Games"],
        request=EndGameSerializer
    )
    def post(self, request, game_id):
        serializer = EndGameSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response('Invalid data', details=serializer.errors)
        
        try:
            game = Game.objects.get(id=game_id, is_active=True)
        except Game.DoesNotExist:
            return error_response('Game not found.', code='NOT_FOUND')
        
        score = serializer.validated_data['score']
        stats = serializer.validated_data['stats']
        time_spent = serializer.validated_data['time_spent']
        
        # Check for high score
        previous_best = GameSession.objects.filter(
            user=request.user, game=game
        ).order_by('-score').first()
        
        is_high_score = previous_best is None or score > previous_best.score
        
        # Calculate rewards
        points_earned = game.base_points + (score // 10)
        coins_earned = game.base_coins + (score // 20)
        
        # Create session record
        session = GameSession.objects.create(
            user=request.user,
            game=game,
            score=score,
            high_score=is_high_score,
            stats=stats,
            time_spent=time_spent,
            points_earned=points_earned,
            coins_earned=coins_earned,
            started_at=timezone.now() - timezone.timedelta(seconds=time_spent)
        )
        
        # Update game state
        game_state, _ = GameState.objects.get_or_create(user=request.user)
        game_state.add_points(points_earned, f'Game: {game.name}')
        game_state.coins += coins_earned
        game_state.total_time_spent += time_spent
        game_state.save()
        
        # Get ranking
        rank = GameSession.objects.filter(
            game=game, score__gt=score
        ).values('user').distinct().count() + 1
        
        return success_response(data={
            'finalScore': score,
            'pointsEarned': points_earned,
            'coinsEarned': coins_earned,
            'newHighScore': is_high_score,
            'ranking': rank
        })


class GameLeaderboardView(APIView):
    """
    GET /api/v1/games/{game_id}/leaderboard
    Get game leaderboard.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Game Leaderboard",
        description="Get game leaderboard",
        tags=["Games"],
        parameters=[
            OpenApiParameter(name='period', description='Time period', enum=['daily', 'weekly', 'monthly', 'all-time']),
            OpenApiParameter(name='limit', description='Number of entries', type=int),
        ]
    )
    def get(self, request, game_id):
        period = request.query_params.get('period', 'all-time')
        limit = int(request.query_params.get('limit', 10))
        
        try:
            game = Game.objects.get(id=game_id)
        except Game.DoesNotExist:
            return error_response('Game not found.', code='NOT_FOUND')
        
        # Filter by period
        sessions = GameSession.objects.filter(game=game)
        
        if period == 'daily':
            sessions = sessions.filter(ended_at__date=timezone.now().date())
        elif period == 'weekly':
            week_ago = timezone.now() - timezone.timedelta(days=7)
            sessions = sessions.filter(ended_at__gte=week_ago)
        elif period == 'monthly':
            month_ago = timezone.now() - timezone.timedelta(days=30)
            sessions = sessions.filter(ended_at__gte=month_ago)
        
        # Get top scores per user
        from django.db.models import Max
        top_scores = sessions.values('user').annotate(
            max_score=Max('score')
        ).order_by('-max_score')[:limit]
        
        leaderboard = []
        for rank, entry in enumerate(top_scores, 1):
            from django.contrib.auth import get_user_model
            User = get_user_model()
            user = User.objects.get(id=entry['user'])
            leaderboard.append({
                'rank': rank,
                'user_id': str(user.id),
                'username': user.username,
                'avatar': user.avatar.url if user.avatar else None,
                'score': entry['max_score']
            })
        
        # Get user's rank
        user_best = sessions.filter(user=request.user).order_by('-score').first()
        user_rank = 0
        user_score = 0
        if user_best:
            user_score = user_best.score
            user_rank = sessions.filter(score__gt=user_score).values('user').distinct().count() + 1
        
        return success_response(data={
            'leaderboard': leaderboard,
            'userRank': user_rank,
            'userScore': user_score
        })


# =============================================================================
# GRAMMAR SHOOTER SPECIFIC VIEWS
# =============================================================================

class GrammarShooterQuestionsView(APIView):
    """
    GET /api/v1/games/grammar-shooter/questions
    Get grammar shooter questions.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Grammar Shooter Questions",
        description="Get questions for grammar shooter game",
        tags=["Games"],
        parameters=[
            OpenApiParameter(name='difficulty', description='Question difficulty', enum=['easy', 'medium', 'hard']),
            OpenApiParameter(name='count', description='Number of questions', type=int),
        ]
    )
    def get(self, request):
        difficulty = request.query_params.get('difficulty')
        count = int(request.query_params.get('count', 10))
        
        # Get questions from quizzes
        questions_query = Question.objects.filter(is_active=True)
        
        if difficulty:
            questions_query = questions_query.filter(difficulty=difficulty)
        
        questions = questions_query.order_by('?')[:count]
        serializer = QuestionWithAnswerSerializer(questions, many=True, context={'include_correct': False})
        
        return success_response(data={
            'questions': serializer.data
        })


class GrammarShooterValidateView(APIView):
    """
    POST /api/v1/games/grammar-shooter/validate
    Validate answer in grammar shooter.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Validate Grammar Shooter Answer",
        description="Validate answer in grammar shooter game",
        tags=["Games"]
    )
    def post(self, request):
        question_id = request.data.get('questionId')
        answer = request.data.get('answer')
        
        if not question_id or not answer:
            return error_response('Question ID and answer are required')
        
        try:
            question = Question.objects.get(id=question_id)
        except Question.DoesNotExist:
            return error_response('Question not found', status_code=404)
        
        # Check if answer is correct
        correct_answer = question.correct_answer
        normalized_answer = str(answer).strip().lower()

        if isinstance(correct_answer, dict):
            expected = correct_answer.get('answer') or correct_answer.get('value') or correct_answer.get('option')
            correct = normalized_answer == str(expected).strip().lower() if expected is not None else False
        elif isinstance(correct_answer, list):
            correct = normalized_answer in {str(item).strip().lower() for item in correct_answer}
        else:
            correct = normalized_answer == str(correct_answer).strip().lower()
        
        # Award points if correct
        points = 0
        if correct:
            points_map = {'easy': 10, 'medium': 20, 'hard': 30}
            points = points_map.get(getattr(question, 'difficulty', None), 10)
            
            # Add to game state
            game_state, _ = GameState.objects.get_or_create(user=request.user)
            game_state.add_points(points, 'grammar_shooter')
        
        return success_response(data={
            'correct': correct,
            'explanation': question.explanation or '',
            'points': points
        })
