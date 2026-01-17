"""
Generate comprehensive synthetic data for testing.
This script populates the database with realistic test data.
"""

import os
import django
import random
from datetime import datetime, timedelta
from decimal import Decimal
import argparse

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nepali_vyakaran_learning.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.utils import timezone
from accounts.models import GameState, UserSettings, ActivityLog
from learning_vyakaran.models import (
    Category, Lesson, LessonProgress, Quiz, Question, QuizResult,
    Village, BuildingType, VillageBuilding,
    Quest, QuestProgress, Achievement, UserAchievement,
    Badge, UserBadge, WritingPrompt, WritingSubmission,
    Game, GameSession
)

User = get_user_model()

# Color codes for output
GREEN = '\033[92m'
BLUE = '\033[94m'
YELLOW = '\033[93m'
RESET = '\033[0m'

def print_section(title):
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}{title}{RESET}")
    print(f"{BLUE}{'='*80}{RESET}")

def print_success(message):
    print(f"{GREEN}✓ {message}{RESET}")

class DataGenerator:
    def __init__(self):
        self.users = []
        self.categories = []
        self.lessons = []
        self.quizzes = []
        self.questions = []
        self.quests = []
        self.achievements = []
        self.badges = []
        self.games = []
        self.writing_prompts = []
        self.building_types = []
    
    def clear_existing_data(self):
        """Clear existing test data"""
        print_section("Clearing Existing Data")
        
        # Keep superuser, delete test users
        User.objects.filter(is_superuser=False).delete()
        print_success("Cleared test users")
        
        # Clear all learning data
        LessonProgress.objects.all().delete()
        QuizResult.objects.all().delete()
        Question.objects.all().delete()
        Quiz.objects.all().delete()
        Lesson.objects.all().delete()
        Category.objects.all().delete()
        
        # Clear gamification
        VillageBuilding.objects.all().delete()
        Village.objects.all().delete()
        BuildingType.objects.all().delete()
        QuestProgress.objects.all().delete()
        Quest.objects.all().delete()
        UserAchievement.objects.all().delete()
        Achievement.objects.all().delete()
        UserBadge.objects.all().delete()
        Badge.objects.all().delete()
        
        # Clear games
        GameSession.objects.all().delete()
        Game.objects.all().delete()
        
        # Clear writing
        WritingSubmission.objects.all().delete()
        WritingPrompt.objects.all().delete()
        
        print_success("Database cleared")
    
    def create_users(self, count=10):
        """Create test users with varying levels"""
        print_section(f"Creating {count} Test Users")
        
        for i in range(count):
            username = f"testuser{i+1}"
            email = f"testuser{i+1}@test.com"
            
            user = User.objects.create_user(
                username=username,
                email=email,
                password="TestPass123!",
                first_name=f"Test",
                last_name=f"User{i+1}",
                bio=f"I'm test user number {i+1}, learning Nepali grammar!"
            )
            
            # Create game state with varying progress
            level = random.randint(1, 10)
            points = level * random.randint(100, 500)
            
            game_state = GameState.objects.create(
                user=user,
                level=level,
                points=points,
                coins=random.randint(50, 500),
                experience=points,
                current_streak=random.randint(0, 30),
                longest_streak=random.randint(0, 50),
                total_correct_answers=random.randint(0, 200),
                total_questions_attempted=random.randint(0, 300)
            )
            
            # Create user settings
            UserSettings.objects.create(
                user=user,
                language=random.choice(['en', 'ne']),
                theme=random.choice(['light', 'dark', 'system']),
                email_notifications=random.choice([True, False]),
                push_notifications=random.choice([True, False]),
                reminder_notifications=random.choice([True, False]),
                achievement_notifications=random.choice([True, False]),
                sound_enabled=random.choice([True, False]),
                music_enabled=random.choice([True, False]),
                animations_enabled=True,
                difficulty=random.choice(['easy', 'medium', 'hard', 'adaptive']),
                daily_goal_minutes=random.choice([10, 15, 20, 30]),
                profile_public=True,
                show_on_leaderboard=True
            )
            
            # Create village
            Village.objects.create(
                user=user,
                level=random.randint(1, 5),
                experience=random.randint(0, 1000),
                coins=random.randint(100, 1000),
                knowledge_points=random.randint(0, 500),
                books=random.randint(0, 50),
                energy=random.randint(50, 100)
            )
            
            self.users.append(user)
            print_success(f"Created user: {username} (Level {level}, {points} points)")
    
    def create_categories(self):
        """Create lesson categories"""
        print_section("Creating Categories")
        
        categories_data = [
            {
                'name': 'Grammar Basics',
                'name_nepali': 'व्याकरण आधारहरू',
                'slug': 'grammar-basics',
                'description': 'Learn the fundamental rules of Nepali grammar',
                'icon': '📚',
                'order': 1
            },
            {
                'name': 'Vocabulary',
                'name_nepali': 'शब्दावली',
                'slug': 'vocabulary',
                'description': 'Build your Nepali vocabulary',
                'icon': '📖',
                'order': 2
            },
            {
                'name': 'Sentence Structure',
                'name_nepali': 'वाक्य संरचना',
                'slug': 'sentence-structure',
                'description': 'Master Nepali sentence formation',
                'icon': '✍️',
                'order': 3
            },
            {
                'name': 'Verb Conjugation',
                'name_nepali': 'क्रिया संयोजन',
                'slug': 'verb-conjugation',
                'description': 'Learn how to conjugate Nepali verbs',
                'icon': '🔤',
                'order': 4
            },
            {
                'name': 'Advanced Topics',
                'name_nepali': 'उन्नत विषयहरू',
                'slug': 'advanced',
                'description': 'Advanced Nepali grammar concepts',
                'icon': '🎓',
                'order': 5
            }
        ]
        
        for data in categories_data:
            category = Category.objects.create(**data)
            self.categories.append(category)
            print_success(f"Created category: {data['name']}")
    
    def create_lessons(self):
        """Create lessons for each category"""
        print_section("Creating Lessons")
        
        for category in self.categories:
            for i in range(5):  # 5 lessons per category
                lesson_num = i + 1
                lesson = Lesson.objects.create(
                    category=category,
                    title=f"{category.name} - Lesson {lesson_num}",
                    title_nepali=f"{category.name_nepali} - पाठ {lesson_num}",
                    slug=f"{category.slug}-lesson-{lesson_num}",
                    description=f"Learn about {category.name.lower()} - lesson {lesson_num}",
                    level=random.randint(1, 5),
                    difficulty=random.choice(['beginner', 'intermediate', 'advanced']),
                    content={
                        'introduction': f'Welcome to {category.name} lesson {lesson_num}',
                        'sections': [
                            {
                                'title': 'Section 1',
                                'content': 'Detailed explanation here...',
                                'examples': ['Example 1', 'Example 2']
                            }
                        ]
                    },
                    exercises=[
                        {'question': 'Practice question 1', 'answer': 'Answer 1'},
                        {'question': 'Practice question 2', 'answer': 'Answer 2'}
                    ],
                    estimated_time=random.randint(10, 30),
                    points_reward=random.randint(10, 50),
                    coins_reward=random.randint(5, 20),
                    order=lesson_num,
                    is_published=True,
                    is_premium=random.choice([True, False])
                )
                self.lessons.append(lesson)
                print_success(f"Created lesson: {lesson.title}")
    
    def create_quizzes(self):
        """Create quizzes with questions"""
        print_section("Creating Quizzes")
        
        for category in self.categories:
            for i in range(3):  # 3 quizzes per category
                quiz = Quiz.objects.create(
                    category=category,
                    title=f"{category.name} Quiz {i+1}",
                    title_nepali=f"{category.name_nepali} प्रश्नोत्तरी {i+1}",
                    description=f"Test your knowledge of {category.name.lower()}",
                    quiz_type=random.choice(['practice', 'assessment', 'daily']),
                    difficulty=random.choice(['easy', 'medium', 'hard']),
                    time_limit=random.randint(600, 1800),  # 10-30 minutes in seconds
                    points_reward=random.randint(20, 100),
                    coins_reward=random.randint(10, 50),
                    pass_percentage=random.randint(60, 80),
                    show_answers=True,
                    shuffle_questions=True,
                    is_published=True
                )
                
                # Create 5-10 questions per quiz
                for j in range(random.randint(5, 10)):
                    question = Question.objects.create(
                        quiz=quiz,
                        difficulty=quiz.difficulty,
                        question_text=f"Question {j+1}: What is the correct form?",
                        question_text_nepali=f"प्रश्न {j+1}: सही रूप के हो?",
                        question_type='multiple_choice',
                        points=random.randint(5, 15),
                        options=[
                            {'text': 'Option A', 'value': 'A'},
                            {'text': 'Option B', 'value': 'B'},
                            {'text': 'Option C', 'value': 'C'},
                            {'text': 'Option D', 'value': 'D'}
                        ],
                        correct_answer={'answer': 'A'},
                        explanation='This is the correct answer because...',
                        explanation_nepali='यो सही उत्तर हो किनकी...',
                        hint='Think about the grammar rule',
                        order=j+1,
                        is_active=True
                    )
                    self.questions.append(question)
                
                self.quizzes.append(quiz)
                print_success(f"Created quiz: {quiz.title} with {quiz.questions.count()} questions")
    
    def create_user_progress(self):
        """Create lesson and quiz progress for users"""
        print_section("Creating User Progress")
        
        for user in self.users:
            # Random lesson progress
            completed_lessons = random.sample(self.lessons, k=random.randint(5, 15))
            for lesson in completed_lessons:
                completed_time = timezone.now() - timedelta(days=random.randint(0, 30))
                LessonProgress.objects.create(
                    user=user,
                    lesson=lesson,
                    status='completed',
                    score=random.randint(60, 100),
                    best_score=random.randint(70, 100),
                    time_spent=random.randint(300, 1800),
                    attempts=random.randint(1, 3),
                    started_at=completed_time - timedelta(hours=1),
                    completed_at=completed_time,
                    progress_data={'exercises_completed': random.randint(5, 10)}
                )
            
            print_success(f"Created progress for {user.username}: {len(completed_lessons)} lessons")
            
            # Random quiz results
            taken_quizzes = random.sample(self.quizzes, k=random.randint(3, 8))
            for quiz in taken_quizzes:
                score = random.randint(50, 100)
                correct = int(quiz.questions.count() * score / 100)
                total = quiz.questions.count()
                completed_time = timezone.now() - timedelta(days=random.randint(0, 30))
                
                QuizResult.objects.create(
                    user=user,
                    quiz=quiz,
                    score=score,
                    percentage=float(score),
                    correct_answers=correct,
                    total_questions=total,
                    time_spent=random.randint(300, 1500),
                    session_id=f"session_{random.randint(1000, 9999)}",
                    started_at=completed_time - timedelta(minutes=random.randint(10, 30)),
                    answers=[{'question_id': str(q.id), 'answer': 'A'} for q in quiz.questions.all()[:correct]],
                    feedback=[],
                    points_earned=quiz.points_reward,
                    coins_earned=quiz.coins_reward,
                    passed=score >= quiz.pass_percentage
                )
            
            print_success(f"Created quiz results for {user.username}: {len(taken_quizzes)} quizzes")
    
    def create_quests(self):
        """Create quests"""
        print_section("Creating Quests")
        
        quests_data = [
            {
                'name': 'Grammar Master',
                'name_nepali': 'व्याकरण मास्टर',
                'description': 'Complete 5 grammar lessons',
                'description_nepali': '५ व्याकरण पाठ पूरा गर्नुहोस्',
                'quest_type': 'daily',
                'category': 'grammar',
                'difficulty': 'easy',
                'requirements': {'lessons_count': 5, 'category': 'grammar-basics'},
                'points_reward': 100,
                'coins_reward': 50,
                'experience_reward': 30,
                'min_level': 1,
                'is_active': True
            },
            {
                'name': 'Daily Practice',
                'name_nepali': 'दैनिक अभ्यास',
                'description': 'Complete any lesson today',
                'description_nepali': 'आज कुनै पनि पाठ पूरा गर्नुहोस्',
                'quest_type': 'daily',
                'category': 'general',
                'difficulty': 'easy',
                'requirements': {'lessons_count': 1},
                'points_reward': 20,
                'coins_reward': 10,
                'experience_reward': 5,
                'min_level': 1,
                'is_active': True
            },
            {
                'name': 'Quiz Champion',
                'name_nepali': 'प्रश्नोत्तरी च्याम्पियन',
                'description': 'Pass 3 quizzes with 80% or higher',
                'description_nepali': '३ प्रश्नोत्तरी ८०% वा बढी अंकमा पास गर्नुहोस्',
                'quest_type': 'weekly',
                'category': 'general',
                'difficulty': 'medium',
                'requirements': {'quizzes_count': 3, 'min_score': 80},
                'points_reward': 150,
                'coins_reward': 75,
                'experience_reward': 50,
                'min_level': 3,
                'is_active': True
            },
            {
                'name': 'Vocabulary Builder',
                'name_nepali': 'शब्दावली निर्माता',
                'description': 'Complete all vocabulary lessons',
                'description_nepali': 'सबै शब्दावली पाठ पूरा गर्नुहोस्',
                'quest_type': 'story',
                'category': 'vocabulary',
                'difficulty': 'hard',
                'requirements': {'category': 'vocabulary', 'complete_all': True},
                'points_reward': 200,
                'coins_reward': 100,
                'experience_reward': 80,
                'min_level': 5,
                'is_active': True
            }
        ]
        
        for data in quests_data:
            quest = Quest.objects.create(**data)
            self.quests.append(quest)
            print_success(f"Created quest: {quest.name}")
    
    def create_achievements_and_badges(self):
        """Create achievements and badges"""
        print_section("Creating Achievements & Badges")
        
        # Achievements
        achievements_data = [
            {
                'name': 'First Steps',
                'name_nepali': 'पहिलो कदम',
                'description': 'Complete your first lesson',
                'description_nepali': 'आफ्नो पहिलो पाठ पूरा गर्नुहोस्',
                'icon': 'first_steps',
                'rarity': 'common',
                'criteria': {'lessons_completed': 1},
                'points_reward': 10,
                'coins_reward': 5,
                'is_hidden': False,
                'is_active': True
            },
            {
                'name': 'Dedicated Learner',
                'name_nepali': 'समर्पित सिकारु',
                'description': 'Maintain a 7-day streak',
                'description_nepali': '७ दिनको स्ट्रीक कायम राख्नुहोस्',
                'icon': 'fire',
                'rarity': 'rare',
                'criteria': {'streak_days': 7},
                'points_reward': 50,
                'coins_reward': 25,
                'is_hidden': False,
                'is_active': True
            },
            {
                'name': 'Grammar Expert',
                'name_nepali': 'व्याकरण विशेषज्ञ',
                'description': 'Complete all grammar lessons',
                'description_nepali': 'सबै व्याकरण पाठ पूरा गर्नुहोस्',
                'icon': 'book',
                'rarity': 'epic',
                'criteria': {'category': 'grammar-basics', 'completion': 100},
                'points_reward': 200,
                'coins_reward': 100,
                'is_hidden': False,
                'is_active': True
            }
        ]
        
        for data in achievements_data:
            achievement = Achievement.objects.create(**data)
            self.achievements.append(achievement)
            print_success(f"Created achievement: {achievement.name}")
        
        # Badges
        badges_data = [
            {
                'name': 'Beginner',
                'name_nepali': 'नौसिखिया',
                'icon': 'beginner',
                'description': 'Started learning',
                'badge_type': 'milestone',
                'criteria': {'level': 1},
                'is_active': True
            },
            {
                'name': 'Intermediate',
                'name_nepali': 'मध्यवर्ती',
                'icon': 'intermediate',
                'description': 'Making progress',
                'badge_type': 'milestone',
                'criteria': {'level': 5},
                'is_active': True
            },
            {
                'name': 'Advanced',
                'name_nepali': 'उन्नत',
                'icon': 'advanced',
                'description': 'Advanced learner',
                'badge_type': 'milestone',
                'criteria': {'level': 10},
                'is_active': True
            },
            {
                'name': 'Master',
                'name_nepali': 'मास्टर',
                'icon': 'master',
                'description': 'Mastered Nepali',
                'badge_type': 'special',
                'criteria': {'level': 20},
                'is_active': True
            }
        ]
        
        for data in badges_data:
            badge = Badge.objects.create(**data)
            self.badges.append(badge)
            print_success(f"Created badge: {badge.name}")
        
        # Award some achievements to users
        for user in self.users[:5]:
            for achievement in random.sample(self.achievements, k=random.randint(1, 2)):
                UserAchievement.objects.create(
                    user=user,
                    achievement=achievement,
                    rewards_claimed=random.choice([True, False])
                )
            print_success(f"Awarded achievements to {user.username}")
    
    def create_games(self):
        """Create games"""
        print_section("Creating Games")
        
        games_data = [
            {
                'name': 'Grammar Shooter',
                'name_nepali': 'व्याकरण शूटर',
                'description': 'Test your grammar knowledge in this fast-paced game',
                'game_type': 'grammar_shooter',
                'difficulty': 'medium',
                'instructions': 'Choose the correct grammar form before time runs out!',
                'instructions_nepali': 'समय समाप्त हुनु अघि सही व्याकरण रूप छान्नुहोस्!',
                'settings': {'time_limit': 60, 'questions_per_round': 10},
                'base_points': 10,
                'base_coins': 5,
                'is_active': True,
                'is_featured': True
            },
            {
                'name': 'Word Match',
                'name_nepali': 'शब्द मिलान',
                'description': 'Match Nepali words with their meanings',
                'game_type': 'word_match',
                'difficulty': 'easy',
                'instructions': 'Match words with their correct meanings',
                'instructions_nepali': 'शब्दहरूलाई उनीहरूको सही अर्थसँग मिलाउनुहोस्',
                'settings': {'pairs': 8, 'time_limit': 120},
                'base_points': 5,
                'base_coins': 3,
                'is_active': True,
                'is_featured': False
            },
            {
                'name': 'Sentence Builder',
                'name_nepali': 'वाक्य निर्माता',
                'description': 'Build correct Nepali sentences',
                'game_type': 'sentence_builder',
                'difficulty': 'hard',
                'instructions': 'Arrange words to form correct sentences',
                'instructions_nepali': 'सही वाक्य बनाउन शब्दहरू व्यवस्थित गर्नुहोस्',
                'settings': {'words_per_sentence': 6, 'time_limit': 90},
                'base_points': 15,
                'base_coins': 8,
                'is_active': True,
                'is_featured': True
            }
        ]
        
        for data in games_data:
            game = Game.objects.create(**data)
            self.games.append(game)
            print_success(f"Created game: {game.name}")
        
        # Create game sessions
        for user in self.users:
            for game in random.sample(self.games, k=random.randint(1, 2)):
                for _ in range(random.randint(1, 5)):
                    score = random.randint(100, 1000)
                    started = timezone.now() - timedelta(days=random.randint(0, 30), hours=random.randint(0, 2))
                    GameSession.objects.create(
                        user=user,
                        game=game,
                        score=score,
                        high_score=False,
                        stats={'accuracy': random.randint(60, 100), 'time': random.randint(60, 300)},
                        time_spent=random.randint(60, 300),
                        points_earned=game.base_points * (score // 100),
                        coins_earned=game.base_coins * (score // 100),
                        started_at=started
                    )
            print_success(f"Created game sessions for {user.username}")
    
    def create_writing_prompts(self):
        """Create writing prompts"""
        print_section("Creating Writing Prompts")
        
        prompts_data = [
            {
                'title': 'My Family',
                'title_nepali': 'मेरो परिवार',
                'description': 'Write about your family in Nepali',
                'description_nepali': 'नेपालीमा आफ्नो परिवारको बारेमा लेख्नुहोस्',
                'prompt_type': 'essay',
                'difficulty': 'easy',
                'guidelines': ['Use proper grammar', 'Include family members', 'Describe relationships'],
                'examples': [{'text': 'मेरो परिवारमा पाँच जना छन्...'}],
                'min_words': 100,
                'max_words': 300,
                'points_reward': 50,
                'coins_reward': 25,
                'is_active': True
            },
            {
                'title': 'A Day in My Life',
                'title_nepali': 'मेरो जीवनको एक दिन',
                'description': 'Describe your typical day',
                'description_nepali': 'आफ्नो सामान्य दिनको वर्णन गर्नुहोस्',
                'prompt_type': 'story',
                'difficulty': 'medium',
                'guidelines': ['Use past tense', 'Be descriptive', 'Follow chronological order'],
                'examples': [{'text': 'बिहान ६ बजे उठें...'}],
                'min_words': 200,
                'max_words': 500,
                'points_reward': 75,
                'coins_reward': 40,
                'is_active': True
            },
            {
                'title': 'My Dream',
                'title_nepali': 'मेरो सपना',
                'description': 'Write about your dreams and aspirations',
                'description_nepali': 'आफ्नो सपना र आकांक्षाको बारेमा लेख्नुहोस्',
                'prompt_type': 'creative',
                'difficulty': 'hard',
                'guidelines': ['Be creative', 'Use advanced vocabulary', 'Proper sentence structure'],
                'examples': [{'text': 'मेरो सपना डाक्टर बन्ने हो...'}],
                'min_words': 300,
                'max_words': 600,
                'points_reward': 100,
                'coins_reward': 50,
                'is_active': True
            }
        ]
        
        for data in prompts_data:
            prompt = WritingPrompt.objects.create(**data)
            self.writing_prompts.append(prompt)
            print_success(f"Created writing prompt: {prompt.title}")
        
        # Create some submissions
        for user in self.users[:5]:
            prompt = random.choice(self.writing_prompts)
            submitted_time = timezone.now() - timedelta(days=random.randint(1, 10))
            WritingSubmission.objects.create(
                user=user,
                prompt=prompt,
                title=f"My {prompt.title}",
                content=f"Sample writing submission for {prompt.title} by {user.username}. This is a comprehensive essay about the topic with proper grammar and structure. It includes all necessary elements required for a good writing sample in Nepali language...",
                word_count=random.randint(prompt.min_words, prompt.max_words),
                status='reviewed',
                score=random.randint(60, 100),
                grammar_score=random.randint(60, 100),
                vocabulary_score=random.randint(60, 100),
                structure_score=random.randint(60, 100),
                creativity_score=random.randint(60, 100),
                feedback='Good work! Keep practicing.',
                suggestions=['Use more advanced vocabulary', 'Improve sentence structure'],
                corrections=[],
                points_earned=prompt.points_reward,
                coins_earned=prompt.coins_reward,
                time_spent=random.randint(600, 1800),
                submitted_at=submitted_time,
                reviewed_at=submitted_time + timedelta(days=1)
            )
        print_success(f"Created writing submissions")
    
    def create_building_types(self):
        """Create village building types"""
        print_section("Creating Building Types")
        
        buildings_data = [
            {
                'name': 'Library',
                'name_nepali': 'पुस्तकालय',
                'slug': 'library',
                'description': 'Increase knowledge points',
                'icon': 'library',
                'size_width': 2,
                'size_height': 2,
                'coin_cost': 100,
                'knowledge_cost': 50,
                'benefits': {'knowledge_boost': 10},
                'min_village_level': 1,
                'max_count': 2,
                'is_active': True
            },
            {
                'name': 'School',
                'name_nepali': 'विद्यालय',
                'slug': 'school',
                'description': 'Learn faster',
                'icon': 'school',
                'size_width': 3,
                'size_height': 2,
                'coin_cost': 200,
                'knowledge_cost': 100,
                'benefits': {'xp_boost': 15},
                'min_village_level': 3,
                'max_count': 1,
                'is_active': True
            },
            {
                'name': 'Market',
                'name_nepali': 'बजार',
                'slug': 'market',
                'description': 'Earn more coins',
                'icon': 'market',
                'size_width': 2,
                'size_height': 2,
                'coin_cost': 150,
                'knowledge_cost': 0,
                'benefits': {'coin_boost': 20},
                'min_village_level': 2,
                'max_count': 3,
                'is_active': True
            }
        ]
        
        for data in buildings_data:
            building_type = BuildingType.objects.create(**data)
            self.building_types.append(building_type)
            print_success(f"Created building type: {building_type.name}")
        
        # Add buildings to villages
        for user in self.users:
            village = Village.objects.get(user=user)
            for building_type in random.sample(self.building_types, k=random.randint(1, 2)):
                VillageBuilding.objects.create(
                    village=village,
                    building_type=building_type,
                    level=random.randint(1, 3),
                    position_x=random.randint(0, village.grid_width - 1),
                    position_y=random.randint(0, village.grid_height - 1)
                )
            print_success(f"Added buildings to {user.username}'s village")
    
    def create_activity_logs(self):
        """Create activity logs for users"""
        print_section("Creating Activity Logs")
        
        activities = [
            'lesson_complete', 'quiz_complete', 'achievement_earned',
            'level_up', 'streak_milestone', 'quest_complete'
        ]
        
        for user in self.users:
            for _ in range(random.randint(5, 20)):
                ActivityLog.log_activity(
                    user=user,
                    activity_type=random.choice(activities),
                    description=f"User completed {random.choice(activities)}",
                    metadata={'test': True}
                )
            print_success(f"Created activity logs for {user.username}")
    
    def generate_all(self):
        """Generate all synthetic data"""
        print_section("COMPREHENSIVE SYNTHETIC DATA GENERATION")
        print(f"Starting data generation at {datetime.now()}")
        
        self.clear_existing_data()
        self.create_users(10)
        self.create_categories()
        self.create_lessons()
        self.create_quizzes()
        self.create_user_progress()
        self.create_quests()
        self.create_achievements_and_badges()
        self.create_games()
        self.create_writing_prompts()
        self.create_building_types()
        self.create_activity_logs()
        
        print_section("DATA GENERATION SUMMARY")
        print(f"{GREEN}✓ Users created: {len(self.users)}{RESET}")
        print(f"{GREEN}✓ Categories created: {len(self.categories)}{RESET}")
        print(f"{GREEN}✓ Lessons created: {len(self.lessons)}{RESET}")
        print(f"{GREEN}✓ Quizzes created: {len(self.quizzes)}{RESET}")
        print(f"{GREEN}✓ Questions created: {len(self.questions)}{RESET}")
        print(f"{GREEN}✓ Quests created: {len(self.quests)}{RESET}")
        print(f"{GREEN}✓ Achievements created: {len(self.achievements)}{RESET}")
        print(f"{GREEN}✓ Badges created: {len(self.badges)}{RESET}")
        print(f"{GREEN}✓ Games created: {len(self.games)}{RESET}")
        print(f"{GREEN}✓ Writing prompts created: {len(self.writing_prompts)}{RESET}")
        print(f"{GREEN}✓ Building types created: {len(self.building_types)}{RESET}")
        
        print(f"\n{YELLOW}Database populated successfully!{RESET}")
        print(f"\nTest user credentials:")
        print(f"  Username: testuser1 (or testuser2-10)")
        print(f"  Password: TestPass123!")
        
        return True


if __name__ == "__main__":
    print(f"\n{YELLOW}{'='*80}{RESET}")
    print(f"{YELLOW}SYNTHETIC DATA GENERATOR{RESET}")
    print(f"{YELLOW}{'='*80}{RESET}")
    print("\nThis will clear existing test data and create new synthetic data.")
    print("Note: Superuser accounts will NOT be deleted.\n")
    
    parser = argparse.ArgumentParser(description="Generate synthetic test data")
    parser.add_argument("--yes", "--no-prompt", dest="yes", action="store_true", help="Skip confirmation prompt")
    args = parser.parse_args()
    auto_yes = args.yes or os.environ.get("GENERATE_SYNTHETIC_YES") == "1"
    if not auto_yes:
        confirm = input("Continue? (yes/no): ")
        if confirm.lower() != 'yes':
            print("Cancelled.")
            exit(0)
    
    generator = DataGenerator()
    success = generator.generate_all()
    
    exit(0 if success else 1)
