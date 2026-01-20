"""
Complete Nepali Grammar Lesson Data Generator
This script populates or updates the database with all 22 Class 4 Nepali grammar lessons.
Run this script to initialize or update lesson content in the database.

Usage:
    python populate_lesson_data.py
    python populate_lesson_data.py --clear  # Clear and recreate all lesson data
"""

import os
import django
import sys
import random
import argparse
from datetime import datetime, timedelta

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
RED = '\033[91m'
RESET = '\033[0m'


def print_section(title):
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}{title}{RESET}")
    print(f"{BLUE}{'='*80}{RESET}")


def print_success(message):
    print(f"{GREEN}✓ {message}{RESET}")


def print_error(message):
    print(f"{RED}✗ {message}{RESET}")


def print_warning(message):
    print(f"{YELLOW}⚠ {message}{RESET}")


# Complete lesson data - 22 lessons from Nepal's Class 4 curriculum
LESSONS_DATABASE = [
    {
        'id': 'lesson_1_naam',
        'title': 'नाम',
        'subtitle': 'संज्ञाका प्रकार र पहिचान',
        'topics': ['व्यक्तिवाचक संज्ञा', 'जातिवाचक संज्ञा', 'समूहवाचक संज्ञा', 'भाववाचक संज्ञा'],
        'points': 50,
        'duration': 15,
        'difficulty': 'beginner',
        'order': 1,
        'content': {
            'introduction': 'नाम भनेको कुनै व्यक्ति, वस्तु, स्थान वा भावको नाम हो। यो नेपाली व्याकरणको आधारभूत भाग हो।',
            'examples': ['राम (व्यक्तिको नाम)', 'किताब (वस्तुको नाम)', 'काठमाडौं (स्थानको नाम)', 'खुशी (भावको नाम)'],
            'sections': [
                {'title': 'व्यक्तिवाचक नाम', 'description': 'कुनै विशेष व्यक्ति, स्थान वा वस्तुको नाम', 'examples': ['राम', 'सीता', 'काठमाडौं', 'एभरेस्ट']},
                {'title': 'जातिवाचक नाम', 'description': 'एउटै जातका सबै व्यक्ति वा वस्तुको साझा नाम', 'examples': ['मान्छे', 'कुकुर', 'फूल', 'पहाड']},
                {'title': 'समूहवाचक नाम', 'description': 'समूह वा झुण्डको नाम', 'examples': ['सेना', 'कक्षा', 'परिवार', 'भीड']},
                {'title': 'भाववाचक नाम', 'description': 'भाव, गुण वा अवस्थाको नाम', 'examples': ['खुशी', 'दुःख', 'सुन्दरता', 'बुद्धिमत्ता']}
            ]
        },
        'questions': [
            {'question': '"राम" कुन प्रकारको नाम हो?', 'options': ['व्यक्तिवाचक नाम', 'जातिवाचक नाम', 'समूहवाचक नाम', 'भाववाचक नाम'], 'correct': 0, 'explanation': '"राम" एक विशेष व्यक्तिको नाम हो, त्यसैले यो व्यक्तिवाचक नाम हो।'},
            {'question': '"खुशी" कुन प्रकारको नाम हो?', 'options': ['व्यक्तिवाचक नाम', 'जातिवाचक नाम', 'समूहवाचक नाम', 'भाववाचक नाम'], 'correct': 3, 'explanation': '"खुशी" एक भावको नाम हो, त्यसैले यो भाववाचक नाम हो।'},
            {'question': '"सेना" कुन प्रकारको नाम हो?', 'options': ['व्यक्तिवाचक नाम', 'जातिवाचक नाम', 'समूहवाचक नाम', 'भाववाचक नाम'], 'correct': 2, 'explanation': '"सेना" सैनिकहरूको समूहको नाम हो, त्यसैले यो समूहवाचक नाम हो।'}
        ]
    },
    {
        'id': 'lesson_2_sarbanaam',
        'title': 'सर्वनाम',
        'subtitle': 'संज्ञाको सट्टामा प्रयोग हुने शब्दहरू',
        'topics': ['पुरुषवाचक सर्वनाम', 'निश्चयवाचक सर्वनाम', 'अनिश्चयवाचक सर्वनाम', 'प्रश्नवाचक सर्वनाम', 'सम्बन्धवाचक सर्वनाम'],
        'points': 60,
        'duration': 16,
        'difficulty': 'beginner',
        'order': 2,
        'content': {
            'introduction': 'सर्वनाम भनेको नामको सट्टामा प्रयोग हुने शब्द हो। यसले वाक्यमा दोहोरिने नामको प्रयोगलाई कम गर्छ।',
            'examples': ['म स्कूल जान्छु। (म = सर्वनाम)', 'तिमी राम्रो छौ। (तिमी = सर्वनाम)', 'यो किताब हो। (यो = सर्वनाम)'],
            'sections': [
                {'title': 'पुरुषवाचक सर्वनाम', 'description': 'व्यक्तिको सट्टामा प्रयोग हुने', 'examples': ['म', 'तिमी', 'उ', 'हामी', 'तिमीहरू', 'उनीहरू']},
                {'title': 'निश्चयवाचक सर्वनाम', 'description': 'निश्चित वस्तु वा व्यक्तिलाई जनाउने', 'examples': ['यो', 'त्यो', 'यी', 'ती']},
                {'title': 'अनिश्चयवाचक सर्वनाम', 'description': 'अनिश्चित वस्तु वा व्यक्तिलाई जनाउने', 'examples': ['कोही', 'केही', 'कुनै']},
                {'title': 'प्रश्नवाचक सर्वनाम', 'description': 'प्रश्न सोध्न प्रयोग हुने', 'examples': ['को', 'के', 'कुन', 'कहाँ']},
                {'title': 'सम्बन्धवाचक सर्वनाम', 'description': 'दुई वाक्यलाई जोड्न प्रयोग हुने', 'examples': ['जो', 'जे', 'जुन']}
            ]
        },
        'questions': [
            {'question': '"म" कुन प्रकारको सर्वनाम हो?', 'options': ['पुरुषवाचक', 'निश्चयवाचक', 'प्रश्नवाचक', 'सम्बन्धवाचक'], 'correct': 0, 'explanation': '"म" व्यक्तिको सट्टामा प्रयोग हुने पुरुषवाचक सर्वनाम हो।'},
            {'question': '"को" कुन प्रकारको सर्वनाम हो?', 'options': ['पुरुषवाचक', 'निश्चयवाचक', 'प्रश्नवाचक', 'अनिश्चयवाचक'], 'correct': 2, 'explanation': '"को" प्रश्न सोध्न प्रयोग हुने प्रश्नवाचक सर्वनाम हो।'}
        ]
    },
    {
        'id': 'lesson_3_visheshan',
        'title': 'विशेषण',
        'subtitle': 'गुण बताउने शब्दहरू',
        'topics': ['गुणवाचक विशेषण', 'संख्यावाचक विशेषण', 'परिमाणवाचक विशेषण', 'संकेतवाचक विशेषण'],
        'points': 70,
        'duration': 15,
        'difficulty': 'beginner',
        'order': 3,
        'content': {
            'introduction': 'विशेषण भनेको नाम वा सर्वनामको गुण, संख्या, परिमाण वा अवस्था बताउने शब्द हो।',
            'examples': ['राम्रो केटा (राम्रो = विशेषण)', 'दुई किताब (दुई = विशेषण)', 'धेरै पानी (धेरै = विशेषण)'],
            'sections': [
                {'title': 'गुणवाचक विशेषण', 'description': 'गुण वा दोष बताउने', 'examples': ['राम्रो', 'नराम्रो', 'सुन्दर', 'कुरूप', 'चलाख', 'मूर्ख']},
                {'title': 'संख्यावाचक विशेषण', 'description': 'संख्या बताउने', 'examples': ['एक', 'दुई', 'तीन', 'पहिलो', 'दोस्रो', 'अन्तिम']},
                {'title': 'परिमाणवाचक विशेषण', 'description': 'परिमाण वा मात्रा बताउने', 'examples': ['धेरै', 'थोरै', 'सबै', 'केही', 'पूरै', 'आधा']},
                {'title': 'संकेतवाचक विशेषण', 'description': 'संकेत वा निर्देश गर्ने', 'examples': ['यो', 'त्यो', 'यी', 'ती', 'यस्तो', 'त्यस्तो']}
            ]
        },
        'questions': [
            {'question': '"राम्रो" कुन प्रकारको विशेषण हो?', 'options': ['गुणवाचक', 'संख्यावाचक', 'परिमाणवाचक', 'संकेतवाचक'], 'correct': 0, 'explanation': '"राम्रो" गुण बताउने गुणवाचक विशेषण हो।'},
            {'question': '"तीन" कुन प्रकारको विशेषण हो?', 'options': ['गुणवाचक', 'संख्यावाचक', 'परिमाणवाचक', 'संकेतवाचक'], 'correct': 1, 'explanation': '"तीन" संख्या बताउने संख्यावाचक विशेषण हो।'}
        ]
    },
    {
        'id': 'lesson_4_kriya',
        'title': 'क्रिया',
        'subtitle': 'काम बताउने शब्दहरू',
        'topics': ['सकर्मक क्रिया', 'अकर्मक क्रिया', 'सहायक क्रिया'],
        'points': 80,
        'duration': 9,
        'difficulty': 'intermediate',
        'order': 4,
        'content': {
            'introduction': 'क्रिया भनेको काम वा कार्य बताउने शब्द हो। यसले के गरिरहेको छ भन्ने कुरा जनाउँछ।',
            'examples': ['राम पढ्छ (पढ्छ = क्रिया)', 'सीता खान्छे (खान्छे = क्रिया)', 'कुकुर भुक्छ (भुक्छ = क्रिया)'],
            'sections': [
                {'title': 'सकर्मक क्रिया', 'description': 'कर्म चाहिने क्रिया', 'examples': ['खाना खान्छ', 'किताब पढ्छ', 'पानी पिउँछ', 'गीत गाउँछ']},
                {'title': 'अकर्मक क्रिया', 'description': 'कर्म नचाहिने क्रिया', 'examples': ['सुत्छ', 'उठ्छ', 'हाँस्छ', 'रुन्छ', 'दौडिन्छ']},
                {'title': 'सहायक क्रिया', 'description': 'मुख्य क्रियालाई सहायता गर्ने', 'examples': ['छ', 'थियो', 'हुन्छ', 'भयो', 'गर्छ']}
            ]
        },
        'questions': [
            {'question': '"किताब पढ्छ" मा कुन प्रकारको क्रिया छ?', 'options': ['सकर्मक क्रिया', 'अकर्मक क्रिया', 'सहायक क्रिया', 'कुनै क्रिया छैन'], 'correct': 0, 'explanation': '"पढ्छ" क्रियाले "किताब" कर्म लिएको छ, त्यसैले यो सकर्मक क्रिया हो।'},
            {'question': '"हाँस्छ" कुन प्रकारको क्रिया हो?', 'options': ['सकर्मक क्रिया', 'अकर्मक क्रिया', 'सहायक क्रिया', 'मुख्य क्रिया'], 'correct': 1, 'explanation': '"हाँस्छ" क्रियाले कुनै कर्म लिँदैन, त्यसैले यो अकर्मक क्रिया हो।'}
        ]
    },
    {
        'id': 'lesson_5_kriya_prakar',
        'title': 'क्रियाका प्रकार',
        'subtitle': 'क्रियाका विभिन्न भेदहरू',
        'topics': ['मुख्य क्रिया', 'सहायक क्रिया', 'संयुक्त क्रिया'],
        'points': 90,
        'duration': 14,
        'difficulty': 'intermediate',
        'order': 5,
        'content': {
            'introduction': 'क्रियालाई विभिन्न आधारमा वर्गीकरण गर्न सकिन्छ। यहाँ हामी मुख्य, सहायक र संयुक्त क्रियाबारे सिक्नेछौं।',
            'examples': ['राम पढ्छ (मुख्य क्रिया)', 'राम पढ्दै छ (सहायक क्रिया)', 'राम पढेर सुत्छ (संयुक्त क्रिया)'],
            'sections': [
                {'title': 'मुख्य क्रिया', 'description': 'स्वतन्त्र रूपमा प्रयोग हुने क्रिया', 'examples': ['खान्छ', 'जान्छ', 'आउँछ', 'बस्छ', 'काम गर्छ']},
                {'title': 'सहायक क्रिया', 'description': 'मुख्य क्रियासँग मिलेर प्रयोग हुने', 'examples': ['छ', 'थियो', 'हुन्छ', 'भएको छ', 'गरेको थियो']},
                {'title': 'संयुक्त क्रिया', 'description': 'दुई वा बढी क्रिया मिलेर बनेको', 'examples': ['पढेर सुन्छ', 'खाएर जान्छ', 'आएर बस्छ', 'गएर फर्कन्छ']}
            ]
        },
        'questions': [
            {'question': '"पढ्दै छ" मा कुन क्रिया सहायक हो?', 'options': ['पढ्दै', 'छ', 'पढ्दै छ', 'कुनै पनि होइन'], 'correct': 1, 'explanation': '"छ" सहायक क्रिया हो जसले "पढ्दै" मुख्य क्रियालाई सहायता गर्छ।'},
            {'question': '"खाएर जान्छ" कुन प्रकारको क्रिया हो?', 'options': ['मुख्य क्रिया', 'सहायक क्रिया', 'संयुक्त क्रिया', 'सकर्मक क्रिया'], 'correct': 2, 'explanation': '"खाएर जान्छ" दुई क्रिया मिलेर बनेको संयुक्त क्रिया हो।'}
        ]
    },
    {
        'id': 'lesson_6_naamyogi',
        'title': 'नामयोगी',
        'subtitle': 'संज्ञासँग जोडिने शब्दहरू',
        'topics': ['सम्बन्धबोधक अव्यय', 'स्थान बोधक शब्दहरू'],
        'points': 50,
        'duration': 5,
        'difficulty': 'beginner',
        'order': 6,
        'content': {
            'introduction': 'नामयोगी भनेको नाम वा सर्वनामसँग जोडिएर सम्बन्ध जनाउने अव्यय हो। यसलाई सम्बन्धबोधक अव्यय पनि भनिन्छ।',
            'examples': ['घरमा (मा = नामयोगी)', 'रुखमुनि (मुनि = नामयोगी)', 'स्कूलदेखि (देखि = नामयोगी)'],
            'sections': [
                {'title': 'स्थानबोधक नामयोगी', 'description': 'स्थान जनाउने', 'examples': ['मा', 'मुनि', 'माथि', 'भित्र', 'बाहिर', 'छेउमा', 'नजिक', 'टाढा']},
                {'title': 'समयबोधक नामयोगी', 'description': 'समय जनाउने', 'examples': ['देखि', 'सम्म', 'भित्र', 'पछि', 'अगाडि', 'बेला']}
            ]
        },
        'questions': [
            {'question': '"घरमा" मा कुन नामयोगी छ?', 'options': ['घर', 'मा', 'घरमा', 'कुनै छैन'], 'correct': 1, 'explanation': '"मा" नामयोगी हो जसले स्थान जनाउँछ।'}
        ]
    },
    {
        'id': 'lesson_7_kriya_visheshan',
        'title': 'क्रिया विशेषण',
        'subtitle': 'क्रियाको विशेषता बताउने शब्दहरू',
        'topics': ['कालवाचक क्रिया विशेषण', 'स्थानवाचक क्रिया विशेषण'],
        'points': 60,
        'duration': 6,
        'difficulty': 'intermediate',
        'order': 7,
        'content': {
            'introduction': 'क्रिया विशेषण भनेको क्रियाको विशेषता बताउने शब्द हो। यसले कहिले, कहाँ, कसरी भन्ने कुरा जनाउँछ।',
            'examples': ['बिस्तारै हिँड्छ (बिस्तारै = क्रिया विशेषण)', 'भोलि आउँछ (भोलि = क्रिया विशेषण)', 'यहाँ बस्छ (यहाँ = क्रिया विशेषण)'],
            'sections': [
                {'title': 'कालवाचक क्रिया विशेषण', 'description': 'समय बताउने', 'examples': ['आज', 'भोलि', 'हिजो', 'अहिले', 'पहिले', 'पछि', 'सधैं', 'कहिल्यै']},
                {'title': 'स्थानवाचक क्रिया विशेषण', 'description': 'स्थान बताउने', 'examples': ['यहाँ', 'त्यहाँ', 'कहाँ', 'माथि', 'तल', 'अगाडि', 'पछाडि']}
            ]
        },
        'questions': [
            {'question': '"भोलि" कुन प्रकारको क्रिया विशेषण हो?', 'options': ['कालवाचक', 'स्थानवाचक', 'रीतिवाचक', 'परिमाणवाचक'], 'correct': 0, 'explanation': '"भोलि" समय बताउने कालवाचक क्रिया विशेषण हो।'}
        ]
    },
    {
        'id': 'lesson_8_sanyojak',
        'title': 'संयोजक',
        'subtitle': 'शब्द र वाक्य जोड्ने शब्दहरू',
        'topics': ['समानाधिकरण संयोजक', 'व्याधिकरण संयोजक'],
        'points': 70,
        'duration': 7,
        'difficulty': 'intermediate',
        'order': 8,
        'content': {
            'introduction': 'संयोजक भनेको शब्द, वाक्यांश वा वाक्यलाई जोड्ने शब्द हो। यसले भाषालाई प्रवाहमान बनाउँछ।',
            'examples': ['राम र श्याम (र = संयोजक)', 'पढ्छ तर लेख्दैन (तर = संयोजक)', 'यदि आयो भने (यदि = संयोजक)'],
            'sections': [
                {'title': 'समानाधिकरण संयोजक', 'description': 'समान महत्त्वका वाक्य जोड्ने', 'examples': ['र', 'तथा', 'एवं', 'तर', 'किन्तु', 'परन्तु', 'वा', 'अथवा']},
                {'title': 'व्याधिकरण संयोजक', 'description': 'मुख्य र आश्रित वाक्य जोड्ने', 'examples': ['यदि', 'भने', 'कि', 'जब', 'जहाँ', 'किनकि', 'यद्यपि']}
            ]
        },
        'questions': [
            {'question': '"र" कुन प्रकारको संयोजक हो?', 'options': ['समानाधिकरण', 'व्याधिकरण', 'सम्बन्धबोधक', 'निपात'], 'correct': 0, 'explanation': '"र" समान महत्त्वका शब्द वा वाक्य जोड्ने समानाधिकरण संयोजक हो।'}
        ]
    },
    {
        'id': 'lesson_9_bismayadi_bodhak',
        'title': 'विस्मयादि बोधक',
        'subtitle': 'भावना प्रकट गर्ने शब्दहरू',
        'topics': ['हर्षबोधक', 'शोकबोधक'],
        'points': 60,
        'duration': 6,
        'difficulty': 'beginner',
        'order': 9,
        'content': {
            'introduction': 'विस्मयादि बोधक भनेको भावना प्रकट गर्ने शब्द हो। यसले खुशी, दुःख, आश्चर्य आदि जनाउँछ।',
            'examples': ['अरे! के भयो? (अरे = विस्मयादि बोधक)', 'वाह! कति राम्रो! (वाह = विस्मयादि बोधक)', 'हाय! दुःख लाग्यो। (हाय = विस्मयादि बोधक)'],
            'sections': [
                {'title': 'हर्षबोधक', 'description': 'खुशी जनाउने', 'examples': ['वाह!', 'शाबास!', 'धन्यवाद!', 'बधाई!', 'हुर्रे!']},
                {'title': 'शोकबोधक', 'description': 'दुःख जनाउने', 'examples': ['हाय!', 'अरे!', 'हत्केला!', 'छी!', 'ओहो!']}
            ]
        },
        'questions': [
            {'question': '"वाह!" कुन प्रकारको विस्मयादि बोधक हो?', 'options': ['हर्षबोधक', 'शोकबोधक', 'आश्चर्यबोधक', 'डरबोधक'], 'correct': 0, 'explanation': '"वाह!" खुशी जनाउने हर्षबोधक विस्मयादि बोधक हो।'}
        ]
    },
    {
        'id': 'lesson_10_nipaat',
        'title': 'निपात',
        'subtitle': 'वाक्यमा जोड दिने शब्दहरू',
        'topics': ['स्वीकारार्थक निपात', 'नकारार्थक निपात'],
        'points': 80,
        'duration': 8,
        'difficulty': 'intermediate',
        'order': 10,
        'content': {
            'introduction': 'निपात भनेको वाक्यमा जोड दिने वा अर्थ स्पष्ट पार्ने शब्द हो। यसको आफ्नै कुनै अर्थ हुँदैन।',
            'examples': ['राम त आयो। (त = निपात)', 'सीता नै गई। (नै = निपात)', 'यो पनि राम्रो छ। (पनि = निपात)'],
            'sections': [
                {'title': 'स्वीकारार्थक निपात', 'description': 'स्वीकार वा जोड दिने', 'examples': ['त', 'नै', 'पनि', 'बल्ल', 'मात्र', 'खाली']},
                {'title': 'नकारार्थक निपात', 'description': 'नकार वा इन्कार जनाउने', 'examples': ['न', 'नि', 'होइन', 'छैन', 'मत']}
            ]
        },
        'questions': [
            {'question': '"त" कुन प्रकारको निपात हो?', 'options': ['स्वीकारार्थक', 'नकारार्थक', 'प्रश्नार्थक', 'संयोजक'], 'correct': 0, 'explanation': '"त" जोड दिने स्वीकारार्थक निपात हो।'}
        ]
    },
    {
        'id': 'lesson_11_karan_akaran',
        'title': 'करण अकरण',
        'subtitle': 'क्रियाको साधन र असाधन',
        'topics': ['करण कारक', 'अकरण', 'साधन बोधक शब्दहरू'],
        'points': 80,
        'duration': 8,
        'difficulty': 'advanced',
        'order': 11,
        'content': {
            'introduction': 'करण भनेको क्रियाको साधन हो र अकरण भनेको साधनको अभाव हो।',
            'examples': ['कलमले लेख्छ (कलमले = करण)', 'हातले खान्छ (हातले = करण)', 'कलम बिना लेख्न सक्दैन (बिना = अकरण)'],
            'sections': [
                {'title': 'करण कारक', 'description': 'क्रियाको साधन जनाउने', 'examples': ['कलमले', 'हातले', 'आँखाले', 'कानले', 'मुखले']},
                {'title': 'अकरण', 'description': 'साधनको अभाव जनाउने', 'examples': ['बिना', 'बाहेक', 'सिवाय', 'छोडेर']},
                {'title': 'साधन बोधक शब्दहरू', 'description': 'साधन जनाउने अन्य शब्दहरू', 'examples': ['द्वारा', 'बाट', 'मार्फत', 'जरिए']}
            ]
        },
        'questions': [
            {'question': '"कलमले लेख्छ" मा करण कुन हो?', 'options': ['कलम', 'कलमले', 'लेख्छ', 'कुनै छैन'], 'correct': 1, 'explanation': '"कलमले" करण कारक हो जसले लेख्ने साधन जनाउँछ।'}
        ]
    },
    {
        'id': 'lesson_12_linga',
        'title': 'लिङ्ग',
        'subtitle': 'पुल्लिङ्ग र स्त्रीलिङ्ग',
        'topics': ['पुल्लिङ्ग शब्दहरू', 'स्त्रीलिङ्ग शब्दहरू', 'लिङ्ग परिवर्तन', 'उभयलिङ्गी शब्दहरू'],
        'points': 100,
        'duration': 13,
        'difficulty': 'intermediate',
        'order': 12,
        'content': {
            'introduction': 'लिङ्ग भनेको नामको पुरुष वा स्त्री जातीयता जनाउने व्याकरणिक गुण हो।',
            'examples': ['केटा (पुल्लिङ्ग)', 'केटी (स्त्रीलिङ्ग)', 'बाबु (पुल्लिङ्ग)', 'आमा (स्त्रीलिङ्ग)'],
            'sections': [
                {'title': 'पुल्लिङ्ग शब्दहरू', 'description': 'पुरुष जातीयता जनाउने', 'examples': ['केटा', 'बाबु', 'दाजु', 'भाइ', 'छोरा', 'बुबा', 'हजुरबुबा']},
                {'title': 'स्त्रीलिङ्ग शब्दहरू', 'description': 'स्त्री जातीयता जनाउने', 'examples': ['केटी', 'आमा', 'दिदी', 'बहिनी', 'छोरी', 'आमा', 'हजुरआमा']},
                {'title': 'लिङ्ग परिवर्तन', 'description': 'पुल्लिङ्गबाट स्त्रीलिङ्गमा परिवर्तन', 'examples': ['केटा→केटी', 'बाबु→आमा', 'दाजु→दिदी', 'भाइ→बहिनी']},
                {'title': 'उभयलिङ्गी शब्दहरू', 'description': 'दुवै लिङ्गमा प्रयोग हुने', 'examples': ['बच्चा', 'मान्छे', 'डाक्टर', 'शिक्षक', 'विद्यार्थी']}
            ]
        },
        'questions': [
            {'question': '"केटा" कुन लिङ्गको शब्द हो?', 'options': ['पुल्लिङ्ग', 'स्त्रीलिङ्ग', 'उभयलिङ्ग', 'कुनै लिङ्ग छैन'], 'correct': 0, 'explanation': '"केटा" पुरुष जातीयता जनाउने पुल्लिङ्ग शब्द हो।'},
            {'question': '"केटा" को स्त्रीलिङ्ग के हो?', 'options': ['केटी', 'आमा', 'दिदी', 'बहिनी'], 'correct': 0, 'explanation': '"केटा" को स्त्रीलिङ्ग "केटी" हो।'}
        ]
    },
    {
        'id': 'lesson_13_bachan',
        'title': 'वचन',
        'subtitle': 'एकवचन र बहुवचन',
        'topics': ['एकवचन शब्दहरू', 'बहुवचन शब्दहरू', 'वचन परिवर्तन', 'अपवादहरू'],
        'points': 90,
        'duration': 12,
        'difficulty': 'intermediate',
        'order': 13,
        'content': {
            'introduction': 'वचन भनेको नामको संख्या जनाउने व्याकरणिक गुण हो। यसले एक वा धेरै भन्ने कुरा जनाउँछ।',
            'examples': ['केटा (एकवचन)', 'केटाहरू (बहुवचन)', 'किताब (एकवचन)', 'किताबहरू (बहुवचन)'],
            'sections': [
                {'title': 'एकवचन शब्दहरू', 'description': 'एउटा मात्र संख्या जनाउने', 'examples': ['केटा', 'केटी', 'किताब', 'कलम', 'घर', 'रुख']},
                {'title': 'बहुवचन शब्दहरू', 'description': 'एकभन्दा बढी संख्या जनाउने', 'examples': ['केटाहरू', 'केटीहरू', 'किताबहरू', 'कलमहरू', 'घरहरू', 'रुखहरू']},
                {'title': 'वचन परिवर्तन', 'description': 'एकवचनबाट बहुवचनमा परिवर्तन', 'examples': ['केटा→केटाहरू', 'घर→घरहरू', 'फूल→फूलहरू', 'पुस्तक→पुस्तकहरू']},
                {'title': 'अपवादहरू', 'description': 'विशेष नियमका शब्दहरू', 'examples': ['मान्छे→मान्छेहरू', 'बच्चा→बच्चाहरू', 'गाई→गाईहरू']}
            ]
        },
        'questions': [
            {'question': '"किताबहरू" कुन वचनको शब्द हो?', 'options': ['एकवचन', 'बहुवचन', 'द्विवचन', 'कुनै वचन छैन'], 'correct': 1, 'explanation': '"किताबहरू" एकभन्दा बढी संख्या जनाउने बहुवचन शब्द हो।'},
            {'question': '"घर" को बहुवचन के हो?', 'options': ['घरहरू', 'घरका', 'घरमा', 'घरले'], 'correct': 0, 'explanation': '"घर" को बहुवचन "घरहरू" हो।'}
        ]
    },
    {
        'id': 'lesson_14_purush',
        'title': 'पुरुष',
        'subtitle': 'उत्तम, मध्यम र अन्य पुरुष',
        'topics': ['उत्तम पुरुष', 'मध्यम पुरुष', 'अन्य पुरुष'],
        'points': 90,
        'duration': 9,
        'difficulty': 'advanced',
        'order': 14,
        'content': {
            'introduction': 'पुरुष भनेको वक्ता, श्रोता र अन्य व्यक्तिको सम्बन्ध जनाउने व्याकरणिक गुण हो।',
            'examples': ['म पढ्छु (उत्तम पुरुष)', 'तिमी पढ्छौ (मध्यम पुरुष)', 'उ पढ्छ (अन्य पुरुष)'],
            'sections': [
                {'title': 'उत्तम पुरुष', 'description': 'वक्ता आफैंको लागि प्रयोग', 'examples': ['म', 'हामी', 'मैले', 'हामीले', 'मेरो', 'हाम्रो']},
                {'title': 'मध्यम पुरुष', 'description': 'श्रोताको लागि प्रयोग', 'examples': ['तिमी', 'तपाईं', 'तिमीहरू', 'तिमीले', 'तपाईंले', 'तिम्रो', 'तपाईंको']},
                {'title': 'अन्य पुरुष', 'description': 'तेस्रो व्यक्तिको लागि प्रयोग', 'examples': ['उ', 'उनी', 'उनीहरू', 'उसले', 'उनले', 'उसको', 'उनको']}
            ]
        },
        'questions': [
            {'question': '"तिमी" कुन पुरुषको सर्वनाम हो?', 'options': ['उत्तम पुरुष', 'मध्यम पुरुष', 'अन्य पुरुष', 'कुनै पुरुष होइन'], 'correct': 1, 'explanation': '"तिमी" श्रोताको लागि प्रयोग हुने मध्यम पुरुषको सर्वनाम हो।'},
            {'question': '"हामी" कुन पुरुषको सर्वनाम हो?', 'options': ['उत्तम पुरुष', 'मध्यम पुरुष', 'अन्य पुरुष', 'सामूहिक पुरुष'], 'correct': 0, 'explanation': '"हामी" वक्ता समूहको लागि प्रयोग हुने उत्तम पुरुषको सर्वनाम हो।'}
        ]
    },
    {
        'id': 'lesson_15_kaal',
        'title': 'काल र कालका पक्ष',
        'subtitle': 'भूत, वर्तमान र भविष्य काल',
        'topics': ['भूतकाल', 'वर्तमान काल', 'भविष्य काल', 'पूर्ण पक्ष', 'अपूर्ण पक्ष', 'संदिग्ध पक्ष', 'सम्भाव्य पक्ष', 'हेतुहेतुमद् पक्ष', 'आज्ञार्थ पक्ष', 'इच्छार्थ पक्ष'],
        'points': 150,
        'duration': 35,
        'difficulty': 'advanced',
        'order': 15,
        'content': {
            'introduction': 'काल भनेको क्रियाको समय जनाउने व्याकरणिक गुण हो। यसले कहिले भएको, भइरहेको वा हुने भन्ने कुरा जनाउँछ।',
            'examples': ['म पढेँ (भूतकाल)', 'म पढ्छु (वर्तमान काल)', 'म पढ्नेछु (भविष्य काल)'],
            'sections': [
                {'title': 'भूतकाल', 'description': 'बितेको समयको क्रिया', 'examples': ['पढेँ', 'गएँ', 'आएँ', 'खाएँ', 'सुतेँ']},
                {'title': 'वर्तमान काल', 'description': 'हालको समयको क्रिया', 'examples': ['पढ्छु', 'जान्छु', 'आउँछु', 'खान्छु', 'सुत्छु']},
                {'title': 'भविष्य काल', 'description': 'आउने समयको क्रिया', 'examples': ['पढ्नेछु', 'जानेछु', 'आउनेछु', 'खानेछु', 'सुत्नेछु']},
                {'title': 'पूर्ण पक्ष', 'description': 'पूरा भएको क्रिया', 'examples': ['पढेको छु', 'गएको छु', 'आएको छु']},
                {'title': 'अपूर्ण पक्ष', 'description': 'जारी रहेको क्रिया', 'examples': ['पढ्दै छु', 'जाँदै छु', 'आउँदै छु']},
                {'title': 'संदिग्ध पक्ष', 'description': 'शंकायुक्त क्रिया', 'examples': ['पढेको होला', 'गएको होला', 'आएको होला']},
                {'title': 'सम्भाव्य पक्ष', 'description': 'सम्भावना जनाउने', 'examples': ['पढ्न सक्छ', 'जान सक्छ', 'आउन सक्छ']},
                {'title': 'हेतुहेतुमद् पक्ष', 'description': 'शर्त जनाउने', 'examples': ['पढ्यो भने', 'गयो भने', 'आयो भने']},
                {'title': 'आज्ञार्थ पक्ष', 'description': 'आदेश जनाउने', 'examples': ['पढ', 'जाऊ', 'आऊ', 'खाऊ']},
                {'title': 'इच्छार्थ पक्ष', 'description': 'इच्छा जनाउने', 'examples': ['पढूँ', 'जाऊँ', 'आऊँ', 'खाऊँ']}
            ]
        },
        'questions': [
            {'question': '"म पढेँ" कुन कालको उदाहरण हो?', 'options': ['भूतकाल', 'वर्तमान काल', 'भविष्य काल', 'कुनै काल होइन'], 'correct': 0, 'explanation': '"पढेँ" बितेको समयको क्रिया भएकोले यो भूतकाल हो।'},
            {'question': '"पढ्दै छु" कुन पक्षको उदाहरण हो?', 'options': ['पूर्ण पक्ष', 'अपूर्ण पक्ष', 'संदिग्ध पक्ष', 'आज्ञार्थ पक्ष'], 'correct': 1, 'explanation': '"पढ्दै छु" जारी रहेको क्रिया जनाउने अपूर्ण पक्ष हो।'},
            {'question': '"पढ" कुन पक्षको उदाहरण हो?', 'options': ['इच्छार्थ पक्ष', 'आज्ञार्थ पक्ष', 'सम्भाव्य पक्ष', 'हेतुहेतुमद् पक्ष'], 'correct': 1, 'explanation': '"पढ" आदेश जनाउने आज्ञार्थ पक्ष हो।'}
        ]
    },
    {
        'id': 'lesson_16_bibhakti',
        'title': 'विभक्ति',
        'subtitle': 'संज्ञा र सर्वनामका रूप परिवर्तन',
        'topics': ['प्रथमा विभक्ति', 'द्वितीया विभक्ति', 'तृतीया विभक्ति'],
        'points': 80,
        'duration': 8,
        'difficulty': 'advanced',
        'order': 16,
        'content': {
            'introduction': 'विभक्ति भनेको नाम र सर्वनामको रूप परिवर्तन हो। यसले वाक्यमा शब्दको भूमिका जनाउँछ।',
            'examples': ['राम पढ्छ (प्रथमा विभक्ति)', 'रामलाई भेटेँ (द्वितीया विभक्ति)', 'रामले लेख्यो (तृतीया विभक्ति)'],
            'sections': [
                {'title': 'प्रथमा विभक्ति', 'description': 'कर्ता जनाउने (कसले गर्छ)', 'examples': ['राम पढ्छ', 'सीता गाउँछे', 'बच्चा खेल्छ', 'कुकुर भुक्छ']},
                {'title': 'द्वितीया विभक्ति', 'description': 'कर्म जनाउने (केलाई गर्छ)', 'examples': ['रामलाई भेटेँ', 'किताबलाई पढेँ', 'खानालाई खाएँ', 'पानीलाई पिएँ']},
                {'title': 'तृतीया विभक्ति', 'description': 'करण जनाउने (केले गर्छ)', 'examples': ['रामले लेख्यो', 'कलमले लेख्छ', 'हातले खान्छ', 'आँखाले देख्छ']}
            ]
        },
        'questions': [
            {'question': '"रामले लेख्यो" मा कुन विभक्ति छ?', 'options': ['प्रथमा', 'द्वितीया', 'तृतीया', 'चतुर्थी'], 'correct': 2, 'explanation': '"रामले" करण जनाउने तृतीया विभक्ति हो।'},
            {'question': '"सीतालाई भेटेँ" मा कुन विभक्ति छ?', 'options': ['प्रथमा', 'द्वितीया', 'तृतीया', 'पञ्चमी'], 'correct': 1, 'explanation': '"सीतालाई" कर्म जनाउने द्वितीया विभक्ति हो।'}
        ]
    },
    {
        'id': 'lesson_17_pada_sangati',
        'title': 'पद सङ्गति',
        'subtitle': 'वाक्यमा शब्दहरूको मेल',
        'topics': ['लिङ्ग अनुसार मेल', 'वचन अनुसार मेल', 'पुरुष अनुसार मेल', 'काल अनुसार मेल'],
        'points': 100,
        'duration': 11,
        'difficulty': 'advanced',
        'order': 17,
        'content': {
            'introduction': 'पद सङ्गति भनेको वाक्यमा शब्दहरूको मेल हो। लिङ्ग, वचन, पुरुष र कालको मेल मिलाउनु पर्छ।',
            'examples': ['राम्रो केटा आयो (सही मेल)', 'राम्रा केटाहरू आए (सही मेल)', 'राम्रो केटी आई (सही मेल)'],
            'sections': [
                {'title': 'लिङ्ग अनुसार मेल', 'description': 'विशेषण र नामको लिङ्ग मिल्नुपर्छ', 'examples': ['राम्रो केटा', 'राम्री केटी', 'अग्लो मान्छे', 'अग्ली महिला']},
                {'title': 'वचन अनुसार मेल', 'description': 'विशेषण र नामको वचन मिल्नुपर्छ', 'examples': ['राम्रो केटा', 'राम्रा केटाहरू', 'सानो घर', 'साना घरहरू']},
                {'title': 'पुरुष अनुसार मेल', 'description': 'सर्वनाम र क्रियाको पुरुष मिल्नुपर्छ', 'examples': ['म जान्छु', 'तिमी जान्छौ', 'उ जान्छ', 'हामी जान्छौं']},
                {'title': 'काल अनुसार मेल', 'description': 'वाक्यमा कालको एकरूपता हुनुपर्छ', 'examples': ['म गएँ र उसलाई भेटेँ', 'म जान्छु र उसलाई भेट्छु']}
            ]
        },
        'questions': [
            {'question': '"राम्रो केटी" मा के गलत छ?', 'options': ['लिङ्ग मेल छैन', 'वचन मेल छैन', 'सबै ठीक छ', 'काल मेल छैन'], 'correct': 0, 'explanation': '"राम्रो" पुल्लिङ्ग र "केटी" स्त्रीलिङ्ग भएकोले लिङ्ग मेल छैन। "राम्री केटी" हुनुपर्छ।'},
            {'question': '"तिमी जान्छु" मा के गलत छ?', 'options': ['लिङ्ग मेल छैन', 'पुरुष मेल छैन', 'वचन मेल छैन', 'सबै ठीक छ'], 'correct': 1, 'explanation': '"तिमी" मध्यम पुरुष र "जान्छु" उत्तम पुरुष भएकोले पुरुष मेल छैन। "तिमी जान्छौ" हुनुपर्छ।'}
        ]
    },
    {
        'id': 'lesson_18_barna_binyas',
        'title': 'वर्ण विन्यास र चिह्न परिचय',
        'subtitle': 'अक्षरहरूको क्रम र विराम चिह्नहरू',
        'topics': ['स्वर र व्यञ्जनको क्रम', 'दाँया (।)', 'अल्प विराम (,)', 'प्रश्न चिह्न (?)', 'विस्मयादिबोधक चिह्न (!)', 'उद्धरण चिह्न (" ")'],
        'points': 120,
        'duration': 19,
        'difficulty': 'intermediate',
        'order': 18,
        'content': {
            'introduction': 'वर्ण विन्यास भनेको अक्षरहरूको क्रमबद्ध व्यवस्था हो र विराम चिह्नहरूले वाक्यलाई स्पष्ट बनाउँछन्।',
            'examples': ['क ख ग घ ङ (व्यञ्जन क्रम)', 'अ आ इ ई उ (स्वर क्रम)', 'राम आयो। (दाँया चिह्न)'],
            'sections': [
                {'title': 'स्वर र व्यञ्जनको क्रम', 'description': 'देवनागरी वर्णमालाको व्यवस्थित क्रम', 'examples': ['स्वर: अ आ इ ई उ ऊ ए ऐ ओ औ', 'व्यञ्जन: क ख ग घ ङ च छ ज झ ञ']},
                {'title': 'दाँया (।)', 'description': 'वाक्य समाप्त गर्न प्रयोग', 'examples': ['राम स्कूल जान्छ।', 'सीता किताब पढ्छे।', 'आज बिदा छ।']},
                {'title': 'अल्प विराम (,)', 'description': 'वाक्यमा छोटो रोकावट दिन प्रयोग', 'examples': ['राम, श्याम र गीता आए।', 'खाना खाएर, पानी पिएर सुते।']},
                {'title': 'प्रश्न चिह्न (?)', 'description': 'प्रश्न सोध्न प्रयोग', 'examples': ['तिमी कहाँ जान्छौ?', 'यो के हो?', 'कति बजेको छ?']},
                {'title': 'विस्मयादिबोधक चिह्न (!)', 'description': 'भावना प्रकट गर्न प्रयोग', 'examples': ['वाह! कति राम्रो!', 'अरे! के भयो?', 'शाबास! राम्रो गर्यौ!']},
                {'title': 'उद्धरण चिह्न (" ")', 'description': 'कसैको भनाइ उल्लेख गर्न प्रयोग', 'examples': ['उसले भन्यो, "म आउँछु।"', 'शिक्षकले भने, "राम्रो पढ।"']}
            ]
        },
        'questions': [
            {'question': 'वाक्य समाप्त गर्न कुन चिह्न प्रयोग गरिन्छ?', 'options': ['अल्प विराम (,)', 'दाँया (।)', 'प्रश्न चिह्न (?)', 'विस्मयादिबोधक (!)'], 'correct': 1, 'explanation': 'वाक्य समाप्त गर्न दाँया (।) चिह्न प्रयोग गरिन्छ।'},
            {'question': '"तिमी कहाँ जान्छौ?" मा कुन चिह्न प्रयोग भएको छ?', 'options': ['दाँया', 'अल्प विराम', 'प्रश्न चिह्न', 'उद्धरण चिह्न'], 'correct': 2, 'explanation': 'प्रश्न सोध्न प्रश्न चिह्न (?) प्रयोग भएको छ।'}
        ]
    },
    {
        'id': 'lesson_19_shabda_bhandar',
        'title': 'शब्द भण्डार',
        'subtitle': 'शब्दहरूको संग्रह र प्रयोग',
        'topics': ['तत्सम शब्द', 'तद्भव शब्द', 'देशज शब्द', 'विदेशी शब्द', 'पर्यायवाची शब्द', 'विपरीतार्थी शब्द', 'एकार्थी शब्द', 'अनेकार्थी शब्द', 'युग्म शब्द', 'संक्षिप्त शब्द'],
        'points': 140,
        'duration': 25,
        'difficulty': 'advanced',
        'order': 19,
        'content': {
            'introduction': 'शब्द भण्डार भनेको भाषामा प्रयोग हुने शब्दहरूको संग्रह हो। यसमा विभिन्न प्रकारका शब्दहरू समावेश छन्।',
            'examples': ['तत्सम: पुस्तक, विद्यालय', 'तद्भव: किताब, स्कूल', 'देशज: ढिकी, मुढो'],
            'sections': [
                {'title': 'तत्सम शब्द', 'description': 'संस्कृतबाट सिधै आएका शब्द', 'examples': ['पुस्तक', 'विद्यालय', 'गुरु', 'शिष्य', 'ज्ञान', 'धर्म']},
                {'title': 'तद्भव शब्द', 'description': 'संस्कृतबाट परिवर्तन भएर आएका', 'examples': ['किताब', 'स्कूल', 'गुरुजी', 'चेला', 'ग्यान', 'धरम']},
                {'title': 'देशज शब्द', 'description': 'स्थानीय रूपमा बनेका शब्द', 'examples': ['ढिकी', 'मुढो', 'खुर्पा', 'हँसिया', 'डोको', 'नाङ्लो']},
                {'title': 'विदेशी शब्द', 'description': 'अन्य भाषाबाट आएका शब्द', 'examples': ['स्कूल', 'कलेज', 'अस्पताल', 'डाक्टर', 'इन्जिनियर']},
                {'title': 'पर्यायवाची शब्द', 'description': 'समान अर्थ भएका शब्द', 'examples': ['आकाश-गगन', 'पानी-जल', 'आँखा-नेत्र', 'हात-हस्त']},
                {'title': 'विपरीतार्थी शब्द', 'description': 'उल्टो अर्थ भएका शब्द', 'examples': ['दिन-रात', 'उज्यालो-अँध्यारो', 'ठूलो-सानो', 'राम्रो-नराम्रो']},
                {'title': 'एकार्थी शब्द', 'description': 'एउटै अर्थ भएका शब्द', 'examples': ['सूर्य-सूरज-रवि', 'चन्द्र-चाँद-शशी', 'पृथ्वी-धरती-भूमि']},
                {'title': 'अनेकार्थी शब्द', 'description': 'धेरै अर्थ भएका शब्द', 'examples': ['अर्थ (पैसा/मतलब)', 'कर (हात/कर)', 'फल (नतिजा/मेवा)']},
                {'title': 'युग्म शब्द', 'description': 'जोडिएर प्रयोग हुने शब्द', 'examples': ['आमा-बुबा', 'दाजु-भाइ', 'दिदी-बहिनी', 'राति-दिन']},
                {'title': 'संक्षिप्त शब्द', 'description': 'छोटो पारिएका शब्द', 'examples': ['नेकपा (नेपाल कम्युनिस्ट पार्टी)', 'त्रिवि (त्रिभुवन विश्वविद्यालय)']}
            ]
        },
        'questions': [
            {'question': '"पुस्तक" कुन प्रकारको शब्द हो?', 'options': ['तत्सम', 'तद्भव', 'देशज', 'विदेशी'], 'correct': 0, 'explanation': '"पुस्तक" संस्कृतबाट सिधै आएको तत्सम शब्द हो।'},
            {'question': '"दिन" को विपरीतार्थी शब्द के हो?', 'options': ['रात', 'बिहान', 'साँझ', 'मध्यान्ह'], 'correct': 0, 'explanation': '"दिन" को विपरीतार्थी शब्द "रात" हो।'}
        ]
    },
    {
        'id': 'lesson_20_ukhan_tukka',
        'title': 'उखान र टुक्का',
        'subtitle': 'लोक बुद्धिका भनाइहरू',
        'topics': ['प्रसिद्ध उखानहरू'],
        'points': 30,
        'duration': 2,
        'difficulty': 'beginner',
        'order': 20,
        'content': {
            'introduction': 'उखान र टुक्का भनेको लोक बुद्धिका भनाइहरू हुन् जसले जीवनका सत्यहरू सिकाउँछन्।',
            'examples': ['आफ्नो घर सुनको थान', 'हतारको काम शैतानको', 'एकै ठाउँमा घाँस मर्छ'],
            'sections': [
                {'title': 'प्रसिद्ध उखानहरू', 'description': 'जीवनका सत्यहरू सिकाउने भनाइहरू', 'examples': ['आफ्नो घर सुनको थान - आफ्नो ठाउँ सबैभन्दा राम्रो', 'हतारको काम शैतानको - हतारमा गलती हुन्छ', 'एकै ठाउँमा घाँस मर्छ - एकै ठाउँमा बसेर काम गर्न मिल्दैन', 'बोलेको भन्दा नबोलेको राम्रो - कहिलेकाहीं चुप लाग्नु राम्रो', 'दुधको मक्खन पानीमा तैरिन्छ - गुणी व्यक्ति जहाँ गए पनि चिनिन्छ']}
            ]
        },
        'questions': [
            {'question': '"आफ्नो घर सुनको थान" को अर्थ के हो?', 'options': ['आफ्नो घरमा सुन छ', 'आफ्नो ठाउँ सबैभन्दा राम्रो', 'घर महँगो छ', 'सुनको घर छ'], 'correct': 1, 'explanation': 'यो उखानको अर्थ आफ्नो ठाउँ सबैभन्दा राम्रो हुन्छ भन्ने हो।'}
        ]
    },
    {
        'id': 'lesson_21_bodh',
        'title': 'बोध',
        'subtitle': 'समझ र अनुभव',
        'topics': ['पठन बोध'],
        'points': 50,
        'duration': 5,
        'difficulty': 'beginner',
        'order': 21,
        'content': {
            'introduction': 'बोध भनेको पढेको कुरा बुझ्ने क्षमता हो। यसले पठन र समझको विकास गर्छ।',
            'examples': ['गद्यांश पढेर प्रश्नको उत्तर दिने', 'कथाको मुख्य भाव बुझ्ने', 'लेखकको संदेश पत्ता लगाउने'],
            'sections': [
                {'title': 'पठन बोध', 'description': 'पढेको कुरा राम्ररी बुझ्ने तरिका', 'examples': ['पहिले पूरै पढ्ने', 'मुख्य कुराहरू चिन्ह लगाउने', 'नबुझेका शब्दहरू खोज्ने', 'प्रश्नहरू सोच्ने', 'सारांश बनाउने']}
            ]
        },
        'questions': [
            {'question': 'पठन बोधको पहिलो चरण के हो?', 'options': ['प्रश्न सोच्ने', 'पूरै पढ्ने', 'सारांश बनाउने', 'शब्द खोज्ने'], 'correct': 1, 'explanation': 'पठन बोधको पहिलो चरण पूरै गद्यांश राम्ररी पढ्नु हो।'}
        ]
    },
    {
        'id': 'lesson_22_nibedan',
        'title': 'निवेदन',
        'subtitle': 'औपचारिक लेखन',
        'topics': ['निवेदन लेख्ने तरिका'],
        'points': 40,
        'duration': 4,
        'difficulty': 'intermediate',
        'order': 22,
        'content': {
            'introduction': 'निवेदन भनेको औपचारिक लेखनको एक प्रकार हो जसमा विनम्रतापूर्वक कुनै कुराको माग गरिन्छ।',
            'examples': ['बिदाको लागि निवेदन', 'सुविधाको लागि निवेदन', 'सहायताको लागि निवेदन'],
            'sections': [
                {'title': 'निवेदन लेख्ने तरिका', 'description': 'औपचारिक निवेदनको ढाँचा', 'examples': ['मिति र ठेगाना', 'सम्बोधन (श्रीमान्/श्रीमती)', 'विषय उल्लेख', 'मुख्य कुरा विनम्रतासाथ', 'धन्यवाद र हस्ताक्षर']}
            ]
        },
        'questions': [
            {'question': 'निवेदनमा सबैभन्दा पहिले के लेख्नुपर्छ?', 'options': ['हस्ताक्षर', 'मिति र ठेगाना', 'मुख्य कुरा', 'धन्यवाद'], 'correct': 1, 'explanation': 'निवेदनमा सबैभन्दा पहिले मिति र ठेगाना लेख्नुपर्छ।'}
        ]
    }
]


class LessonDataPopulator:
    """Handles population of lesson data into the database"""
    
    def __init__(self, clear_existing=False):
        self.clear_existing = clear_existing
        self.category = None
        self.stats = {
            'lessons_created': 0,
            'lessons_updated': 0,
            'quizzes_created': 0,
            'quizzes_updated': 0,
            'questions_created': 0,
            'questions_deleted': 0
        }
    
    def clear_lesson_data(self):
        """Clear existing lesson data"""
        print_section("Clearing Existing Lesson Data")
        
        try:
            # Delete in correct order to handle foreign keys
            deleted_questions = Question.objects.filter(
                quiz__category__slug='nepali-grammar-class-4'
            ).delete()
            self.stats['questions_deleted'] = deleted_questions[0]
            print_success(f"Deleted {deleted_questions[0]} questions")
            
            deleted_quizzes = Quiz.objects.filter(
                category__slug='nepali-grammar-class-4'
            ).delete()
            print_success(f"Deleted {deleted_quizzes[0]} quizzes")
            
            deleted_lessons = Lesson.objects.filter(
                category__slug='nepali-grammar-class-4'
            ).delete()
            print_success(f"Deleted {deleted_lessons[0]} lessons")
            
            print_success("Lesson data cleared successfully")
        except Exception as e:
            print_error(f"Error clearing data: {str(e)}")
            raise
    
    def get_or_create_category(self):
        """Create or get the Nepali Grammar category"""
        print_section("Setting Up Category")
        
        category, created = Category.objects.get_or_create(
            slug='nepali-grammar-class-4',
            defaults={
                'name': 'Nepali Grammar - Class 4',
                'name_nepali': 'नेपाली व्याकरण - कक्षा ४',
                'description': 'Complete Nepal Class 4 Nepali Grammar Curriculum - 22 Comprehensive Lessons',
                'icon': '📚',
                'order': 1
            }
        )
        
        if created:
            print_success(f"Created category: {category.name_nepali}")
        else:
            print_success(f"Using existing category: {category.name_nepali}")
        
        self.category = category
        return category
    
    def populate_lesson(self, lesson_data):
        """Populate a single lesson with its content and questions"""
        try:
            # Create or update lesson
            lesson, created = Lesson.objects.update_or_create(
                slug=lesson_data['id'],
                defaults={
                    'category': self.category,
                    'title': lesson_data['title'],
                    'title_nepali': lesson_data['title'],
                    'description': lesson_data['subtitle'],
                    'level': 4,  # Class 4
                    'difficulty': lesson_data['difficulty'],
                    'content': lesson_data['content'],
                    'exercises': [],
                    'estimated_time': lesson_data['duration'],
                    'points_reward': lesson_data['points'],
                    'coins_reward': lesson_data['points'] // 2,
                    'order': lesson_data['order'],
                    'is_published': True,
                    'is_premium': False
                }
            )
            
            if created:
                self.stats['lessons_created'] += 1
                print_success(f"  ✓ Created: {lesson.title}")
            else:
                self.stats['lessons_updated'] += 1
                print_success(f"  ↻ Updated: {lesson.title}")
            
            # Create or update quiz
            quiz, quiz_created = Quiz.objects.update_or_create(
                category=self.category,
                title=f"{lesson.title} - Quiz",
                defaults={
                    'title_nepali': f"{lesson.title_nepali} - प्रश्नोत्तरी",
                    'description': f"Test your knowledge of {lesson.title}",
                    'quiz_type': 'practice',
                    'difficulty': lesson_data['difficulty'],
                    'time_limit': lesson_data['duration'] * 60,
                    'points_reward': lesson_data['points'],
                    'coins_reward': lesson_data['points'] // 2,
                    'pass_percentage': 70,
                    'show_answers': True,
                    'shuffle_questions': True,
                    'is_published': True
                }
            )
            
            if quiz_created:
                self.stats['quizzes_created'] += 1
            else:
                self.stats['quizzes_updated'] += 1
            
            # Delete existing questions to avoid duplicates
            if not quiz_created:
                deleted = quiz.questions.all().delete()
                if deleted[0] > 0:
                    print_warning(f"    Cleared {deleted[0]} old questions")
            
            # Create questions
            for idx, q_data in enumerate(lesson_data['questions']):
                question = Question.objects.create(
                    quiz=quiz,
                    lesson=lesson,
                    difficulty=lesson_data['difficulty'],
                    question_text=q_data['question'],
                    question_text_nepali=q_data['question'],
                    question_type='multiple_choice',
                    points=10,
                    options=[
                        {'text': opt, 'value': str(i)} 
                        for i, opt in enumerate(q_data['options'])
                    ],
                    correct_answer={'answer': str(q_data['correct'])},
                    explanation=q_data['explanation'],
                    explanation_nepali=q_data['explanation'],
                    hint='',
                    order=idx + 1,
                    is_active=True
                )
                self.stats['questions_created'] += 1
            
            print_success(f"    + Added {len(lesson_data['questions'])} questions")
            return True
            
        except Exception as e:
            print_error(f"  ✗ Error populating lesson {lesson_data['id']}: {str(e)}")
            return False
    
    def populate_all_lessons(self):
        """Populate all 22 lessons"""
        print_section("Populating Lesson Data")
        
        success_count = 0
        error_count = 0
        
        for lesson_data in LESSONS_DATABASE:
            if self.populate_lesson(lesson_data):
                success_count += 1
            else:
                error_count += 1
        
        return success_count, error_count
    
    def print_summary(self):
        """Print summary of the population process"""
        print_section("Population Summary")
        
        print(f"{GREEN}Lessons:{RESET}")
        print(f"  Created: {self.stats['lessons_created']}")
        print(f"  Updated: {self.stats['lessons_updated']}")
        print(f"  Total:   {self.stats['lessons_created'] + self.stats['lessons_updated']}")
        
        print(f"\n{GREEN}Quizzes:{RESET}")
        print(f"  Created: {self.stats['quizzes_created']}")
        print(f"  Updated: {self.stats['quizzes_updated']}")
        print(f"  Total:   {self.stats['quizzes_created'] + self.stats['quizzes_updated']}")
        
        print(f"\n{GREEN}Questions:{RESET}")
        print(f"  Created: {self.stats['questions_created']}")
        if self.stats['questions_deleted'] > 0:
            print(f"  Deleted: {self.stats['questions_deleted']} (old questions)")
        
        print(f"\n{GREEN}Category:{RESET} {self.category.name_nepali}")
        
        total_points = sum(lesson['points'] for lesson in LESSONS_DATABASE)
        total_duration = sum(lesson['duration'] for lesson in LESSONS_DATABASE)
        
        print(f"\n{BLUE}Curriculum Stats:{RESET}")
        print(f"  Total Points:    {total_points}")
        print(f"  Total Duration:  {total_duration} minutes")
        print(f"  Difficulty Levels: Beginner, Intermediate, Advanced")
    
    def run(self):
        """Main execution method"""
        print_section("NEPALI GRAMMAR LESSON DATA POPULATOR")
        print(f"{YELLOW}Nepal's Class 4 Curriculum - 22 Complete Lessons{RESET}\n")
        
        try:
            if self.clear_existing:
                print_warning("Clear mode enabled - will delete existing data")
                self.clear_lesson_data()
            
            self.get_or_create_category()
            success, errors = self.populate_all_lessons()
            self.print_summary()
            
            if errors == 0:
                print(f"\n{GREEN}{'='*80}{RESET}")
                print(f"{GREEN}✓ All lessons populated successfully!{RESET}")
                print(f"{GREEN}{'='*80}{RESET}")
                return True
            else:
                print(f"\n{YELLOW}{'='*80}{RESET}")
                print(f"{YELLOW}⚠ Completed with {errors} errors{RESET}")
                print(f"{YELLOW}{'='*80}{RESET}")
                return False
                
        except Exception as e:
            print_error(f"\nFatal error: {str(e)}")
            import traceback
            traceback.print_exc()
            return False


class GamificationGenerator:
    def __init__(self):
        self.users = []
        self.lessons = []
        self.quizzes = []
        self.quests = []
        self.achievements = []
        self.badges = []
        self.games = []
        self.writing_prompts = []
        self.building_types = []
    
    def clear_gamification_data(self):
        """Clear existing gamification and user data"""
        print_section("Clearing Gamification Data")
        
        # Keep superuser, delete test users
        User.objects.filter(is_superuser=False).delete()
        print_success("Cleared test users")
        
        # Clear all learning progress (but not content)
        LessonProgress.objects.all().delete()
        QuizResult.objects.all().delete()
        
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
        
        print_success("Gamification data cleared")

    def load_content(self):
        """Load existing lessons and quizzes"""
        print_section("Loading Content")
        self.lessons = list(Lesson.objects.all())
        self.quizzes = list(Quiz.objects.all())
        print_success(f"Loaded {len(self.lessons)} lessons and {len(self.quizzes)} quizzes")

    def create_users(self, count=10):
        """Create test users with varying levels"""
        print_section(f"Creating {count} Test Users")
        
        for i in range(count):
            username = f"testuser{i+1}"
            email = f"testuser{i+1}@test.com"
            
            # Check if user exists
            if User.objects.filter(username=username).exists():
                user = User.objects.get(username=username)
            else:
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password="TestPass123!",
                    first_name=f"Test",
                    last_name=f"User{i+1}",
                    bio=f"I'm test user number {i+1}, learning Nepali grammar!"
                )
            
            # Create game state with varying progress if not exists
            if not hasattr(user, 'gamestate'):
                level = random.randint(1, 10)
                points = level * random.randint(100, 500)
                
                GameState.objects.create(
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
            if not hasattr(user, 'usersettings'):
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
            if not hasattr(user, 'village'):
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
            print_success(f"Created/found user: {username}")

    def create_user_progress(self):
        """Create lesson and quiz progress for users"""
        print_section("Creating User Progress")
        
        if not self.lessons:
            print_warning("No lessons found. Skipping progress generation.")
            return

        for user in self.users:
            # Random lesson progress
            sample_size = min(len(self.lessons), random.randint(5, 15))
            completed_lessons = random.sample(self.lessons, k=sample_size)
            
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
            if self.quizzes:
                sample_size_quiz = min(len(self.quizzes), random.randint(3, 8))
                taken_quizzes = random.sample(self.quizzes, k=sample_size_quiz)
                for quiz in taken_quizzes:
                    score = random.randint(50, 100)
                    total_questions = quiz.questions.count()
                    if total_questions == 0: continue
                    
                    correct = int(total_questions * score / 100)
                    completed_time = timezone.now() - timedelta(days=random.randint(0, 30))
                    
                    QuizResult.objects.create(
                        user=user,
                        quiz=quiz,
                        score=score,
                        percentage=float(score),
                        correct_answers=correct,
                        total_questions=total_questions,
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
                content=f"Sample writing submission for {prompt.title} by {user.username}. This is a comprehensive essay...",
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
        print_section("COMPREHENSIVE GAME DATA GENERATION")
        if not self.lessons:
             self.load_content() # ensure content matches

        self.clear_gamification_data()
        self.load_content()
        self.create_users(10)
        self.create_user_progress()
        self.create_quests()
        self.create_achievements_and_badges()
        self.create_games()
        self.create_writing_prompts()
        self.create_building_types()
        self.create_activity_logs()
        return True


def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Setup Full Nepali Grammar Database',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python setup_database.py              # Update/create all data
  python setup_database.py --clear      # Clear and recreate all data
        """
    )
    parser.add_argument(
        '--clear',
        action='store_true',
        help='Clear existing data before populating'
    )
    
    args = parser.parse_args()
    
    if args.clear:
        print(f"\n{RED}WARNING: This will delete ALL existing data including users and lessons!{RESET}")
        confirm = input("Are you sure you want to continue? (yes/no): ")
        if confirm.lower() != 'yes':
            print("Cancelled.")
            return 1
    
    print_section("STEP 1: LESSON CONTENT")
    populator = LessonDataPopulator(clear_existing=args.clear)
    success_lessons = populator.run()
    
    if not success_lessons:
        print_error("Failed to populate lessons. Stopping.")
        return 1
        
    print_section("STEP 2: USERS AND GAMIFICATION")
    gamification = GamificationGenerator()
    success_game = gamification.generate_all()

    if success_lessons and success_game:
        print(f"\n{GREEN}{'='*80}{RESET}")
        print(f"{GREEN}✓ FULL DATABASE SETUP COMPLETE!{RESET}")
        print(f"{GREEN}{'='*80}{RESET}")
        return 0
    
    return 1


if __name__ == "__main__":
    sys.exit(main())
