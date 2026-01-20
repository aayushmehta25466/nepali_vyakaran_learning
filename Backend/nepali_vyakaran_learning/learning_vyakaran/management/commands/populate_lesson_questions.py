"""
Management command to populate lesson questions from game_questions_data.json
"""
import json
import uuid
from django.core.management.base import BaseCommand
from learning_vyakaran.models import Lesson, Question


class Command(BaseCommand):
    help = 'Populate lesson questions from game questions data'

    def handle(self, *args, **kwargs):
        # Load game questions
        with open('data/game_questions_data.json', 'r', encoding='utf-8') as f:
            game_questions = json.load(f)

        # Delete existing lesson questions
        deleted = Question.objects.filter(lesson__isnull=False).delete()
        self.stdout.write(f'Deleted {deleted[0]} existing lesson questions')

        # Get all lessons
        lessons = list(Lesson.objects.filter(is_published=True).order_by('order'))
        
        if not lessons:
            self.stdout.write(self.style.ERROR('No lessons found!'))
            return

        # Distribute questions across lessons (3-4 questions per lesson)
        questions_per_lesson = 3
        created_count = 0

        for idx, lesson in enumerate(lessons):
            # Get questions for this lesson (round-robin distribution)
            start_idx = (idx * questions_per_lesson) % len(game_questions)
            lesson_questions = []
            
            for i in range(questions_per_lesson):
                q_idx = (start_idx + i) % len(game_questions)
                lesson_questions.append(game_questions[q_idx])

            # Create Question records for this lesson
            for order, q_data in enumerate(lesson_questions):
                # Transform options to structured format
                options_data = []
                for opt_idx, option_text in enumerate(q_data['options']):
                    options_data.append({
                        'text': option_text,
                        'text_nepali': option_text,
                        'is_correct': opt_idx == q_data['correct_answer']
                    })

                Question.objects.create(
                    id=uuid.uuid4(),
                    lesson=lesson,
                    question_text=q_data['question'],
                    question_text_nepali=q_data['question'],
                    question_type='multiple_choice',
                    difficulty=q_data.get('difficulty', 'medium'),
                    options=options_data,
                    correct_answer={'index': q_data['correct_answer']},
                    explanation=q_data.get('explanation', ''),
                    explanation_nepali=q_data.get('explanation', ''),
                    points=q_data.get('points', 10),
                    order=order,
                    is_active=True
                )
                created_count += 1

        self.stdout.write(self.style.SUCCESS(
            f'Successfully created {created_count} questions across {len(lessons)} lessons'
        ))
