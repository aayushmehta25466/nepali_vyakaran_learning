"""
Management command to populate the database with initial data from JSON files.
"""

import json
import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from learning_vyakaran.models import (
    Category, Lesson, Quest, WritingPrompt, Game, Question, Quiz
)

User = get_user_model()


class Command(BaseCommand):
    help = 'Populate database with lessons, quests, and other content from JSON files'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before populating',
        )

    def handle(self, *args, **options):
        # Data directory is at project root, not in app folder
        from django.conf import settings
        project_root = settings.BASE_DIR
        data_dir = os.path.join(project_root, 'data')
        
        if options['clear']:
            self.stdout.write(self.style.WARNING('Clearing existing data...'))
            Lesson.objects.all().delete()
            Quest.objects.all().delete()
            WritingPrompt.objects.all().delete()
            Question.objects.all().delete()
            Quiz.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('✓ Cleared existing data'))

        # Create default category if it doesn't exist
        category, created = Category.objects.get_or_create(
            slug='nepali-grammar',
            defaults={
                'name': 'Nepali Grammar',
                'name_nepali': 'नेपाली व्याकरण',
                'description': 'Nepal Class 4 Nepali Grammar Curriculum',
                'icon': 'BookOpen',
                'color': '#667eea',
                'order': 1,
                'is_active': True
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS('✓ Created default category'))

        # Load and create lessons
        self.stdout.write(self.style.MIGRATE_HEADING('\n📚 Loading Lessons...'))
        lessons_file = os.path.join(data_dir, 'lessons_data.json')
        if os.path.exists(lessons_file):
            with open(lessons_file, 'r', encoding='utf-8') as f:
                lessons_data = json.load(f)
            
            lesson_map = {}  # To track created lessons for prerequisites
            
            for lesson_data in lessons_data:
                # Convert difficulty mapping
                difficulty_map = {
                    'easy': 'beginner',
                    'medium': 'intermediate',
                    'hard': 'advanced',
                    'सजिलो': 'beginner',
                    'मध्यम': 'intermediate',
                    'कठिन': 'advanced'
                }
                
                difficulty = difficulty_map.get(lesson_data.get('difficulty', 'easy'), 'beginner')
                
                # Create slug from id
                slug = lesson_data['id'].replace('lesson_', '').replace('_', '-')
                
                lesson, created = Lesson.objects.get_or_create(
                    slug=slug,
                    defaults={
                        'title': lesson_data.get('title', lesson_data.get('subtitle', 'Untitled')),
                        'title_nepali': lesson_data.get('title', ''),
                        'description': lesson_data.get('description', lesson_data.get('subtitle', '')),
                        'description_nepali': lesson_data.get('subtitle', ''),
                        'category': category,
                        'level': lesson_data.get('order', 1),
                        'difficulty': difficulty,
                        'order': lesson_data.get('order', 0),
                        'content': {
                            'topics': lesson_data.get('topics', []),
                            'duration': lesson_data.get('duration', 10)
                        },
                        'exercises': [],
                        'points_reward': lesson_data.get('points', 50),
                        'coins_reward': lesson_data.get('points', 50) // 2,
                        'estimated_time': lesson_data.get('duration', 10),
                        'is_published': True,
                        'is_premium': False
                    }
                )
                
                lesson_map[lesson_data['id']] = lesson
                
                if created:
                    self.stdout.write(self.style.SUCCESS(f'  ✓ Created lesson: {lesson.title}'))
                else:
                    self.stdout.write(f'  - Lesson already exists: {lesson.title}')
            
            # Add prerequisites after all lessons are created
            for lesson_data in lessons_data:
                if 'prerequisite' in lesson_data and lesson_data['prerequisite']:
                    prereq_id = lesson_data['prerequisite']
                    if prereq_id in lesson_map:
                        slug = lesson_data['id'].replace('lesson_', '').replace('_', '-')
                        lesson = Lesson.objects.get(slug=slug)
                        lesson.prerequisites.add(lesson_map[prereq_id])
            
            self.stdout.write(self.style.SUCCESS(f'\n✓ Loaded {len(lessons_data)} lessons'))
        else:
            self.stdout.write(self.style.ERROR(f'❌ File not found: {lessons_file}'))

        # Load and create quests
        self.stdout.write(self.style.MIGRATE_HEADING('\n🎯 Loading Quests...'))
        quests_file = os.path.join(data_dir, 'quests_data.json')
        if os.path.exists(quests_file):
            with open(quests_file, 'r', encoding='utf-8') as f:
                quests_data = json.load(f)
            
            for quest_data in quests_data:
                difficulty_map = {
                    'easy': 'easy',
                    'medium': 'medium',
                    'hard': 'hard',
                    'सजिलो': 'easy',
                    'मध्यम': 'medium',
                    'कठिन': 'hard'
                }
                
                difficulty = difficulty_map.get(quest_data.get('difficulty', 'medium'), 'medium')
                
                quest, created = Quest.objects.get_or_create(
                    name=quest_data['title'],
                    defaults={
                        'name_nepali': quest_data['title'],
                        'description': quest_data.get('description', ''),
                        'description_nepali': quest_data.get('description', ''),
                        'quest_type': 'daily',
                        'category': quest_data.get('quest_type', 'general'),
                        'difficulty': difficulty,
                        'requirements': {},
                        'min_level': quest_data.get('min_level', 1),
                        'points_reward': quest_data.get('points_reward', 100),
                        'coins_reward': quest_data.get('coins_reward', 50),
                        'experience_reward': quest_data.get('knowledge_reward', 50),
                        'additional_rewards': {
                            'books': quest_data.get('books_reward', 0)
                        },
                        'is_active': True
                    }
                )
                
                if created:
                    self.stdout.write(self.style.SUCCESS(f'  ✓ Created quest: {quest.name}'))
                else:
                    self.stdout.write(f'  - Quest already exists: {quest.name}')
            
            self.stdout.write(self.style.SUCCESS(f'\n✓ Loaded {len(quests_data)} quests'))
        else:
            self.stdout.write(self.style.ERROR(f'❌ File not found: {quests_file}'))

        # Load and create writing prompts
        self.stdout.write(self.style.MIGRATE_HEADING('\n✍️ Loading Writing Prompts...'))
        prompts_file = os.path.join(data_dir, 'writing_prompts_data.json')
        if os.path.exists(prompts_file):
            with open(prompts_file, 'r', encoding='utf-8') as f:
                prompts_data = json.load(f)
            
            for prompt_data in prompts_data:
                prompt, created = WritingPrompt.objects.get_or_create(
                    title=prompt_data['title'],
                    defaults={
                        'title_nepali': prompt_data['title'],
                        'description': prompt_data['prompt'],
                        'description_nepali': prompt_data['prompt'],
                        'prompt_type': prompt_data.get('prompt_type', 'story'),
                        'difficulty': prompt_data.get('difficulty', 'medium'),
                        'guidelines': [],
                        'examples': [],
                        'min_words': prompt_data.get('min_words', 100),
                        'max_words': prompt_data.get('max_words', 500),
                        'points_reward': prompt_data.get('points_reward', 20),
                        'coins_reward': prompt_data.get('coins_reward', 10),
                        'is_active': True
                    }
                )
                
                if created:
                    self.stdout.write(self.style.SUCCESS(f'  ✓ Created writing prompt: {prompt.title}'))
                else:
                    self.stdout.write(f'  - Writing prompt already exists: {prompt.title}')
            
            self.stdout.write(self.style.SUCCESS(f'\n✓ Loaded {len(prompts_data)} writing prompts'))
        else:
            self.stdout.write(self.style.ERROR(f'❌ File not found: {prompts_file}'))

        # Load and create game questions
        self.stdout.write(self.style.MIGRATE_HEADING('\n🎮 Loading Game Questions...'))
        questions_file = os.path.join(data_dir, 'game_questions_data.json')
        if os.path.exists(questions_file):
            with open(questions_file, 'r', encoding='utf-8') as f:
                questions_data = json.load(f)
            
            # Create a quiz for Grammar Shooter game
            quiz, created = Quiz.objects.get_or_create(
                title='Grammar Shooter',
                defaults={
                    'title_nepali': 'व्याकरण शूटर',
                    'description': 'Quick grammar identification game',
                    'category': category,
                    'quiz_type': 'practice',
                    'difficulty': 'medium',
                    'time_limit': 0,
                    'pass_percentage': 60,
                    'show_answers': True,
                    'shuffle_questions': True,
                    'points_reward': 50,
                    'coins_reward': 25,
                    'is_published': True,
                    'is_premium': False
                }
            )
            
            if created:
                self.stdout.write(self.style.SUCCESS(f'  ✓ Created quiz: {quiz.title}'))
            
            for question_data in questions_data:
                question, created = Question.objects.get_or_create(
                    quiz=quiz,
                    question_text=question_data['question'],
                    defaults={
                        'question_text_nepali': question_data['question'],
                        'difficulty': question_data.get('difficulty', 'easy'),
                        'question_type': 'multiple_choice',
                        'options': question_data.get('options', []),
                        'correct_answer': {
                            'index': question_data.get('correct_answer', 0),
                            'value': question_data['options'][question_data.get('correct_answer', 0)]
                        },
                        'explanation': question_data.get('explanation', ''),
                        'explanation_nepali': question_data.get('explanation', ''),
                        'hint': '',
                        'media': {},
                        'points': question_data.get('points', 10),
                        'order': 0,
                        'is_active': True
                    }
                )
                
                if created:
                    self.stdout.write(self.style.SUCCESS(f'  ✓ Created question: {question.question_text[:50]}...'))
                else:
                    self.stdout.write(f'  - Question already exists: {question.question_text[:50]}...')
            
            self.stdout.write(self.style.SUCCESS(f'\n✓ Loaded {len(questions_data)} game questions'))
        else:
            self.stdout.write(self.style.ERROR(f'❌ File not found: {questions_file}'))

        self.stdout.write(self.style.SUCCESS('\n\n✅ Database population completed!'))
        self.stdout.write(self.style.SUCCESS('\nSummary:'))
        self.stdout.write(f'  📚 Lessons: {Lesson.objects.count()}')
        self.stdout.write(f'  🎯 Quests: {Quest.objects.count()}')
        self.stdout.write(f'  ✍️ Writing Prompts: {WritingPrompt.objects.count()}')
        self.stdout.write(f'  🎮 Game Questions: {Question.objects.count()}')
        self.stdout.write(f'  📝 Quizzes: {Quiz.objects.count()}')
