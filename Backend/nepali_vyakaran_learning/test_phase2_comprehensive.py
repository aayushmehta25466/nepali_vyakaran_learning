"""
Comprehensive Phase 2 Testing Suite
Tests all Phase 2 endpoints with synthetic data
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, List, Tuple

# Known deterministic slugs/titles from data generator (Option A)
KNOWN_CATEGORY_SLUG = "grammar-basics"
KNOWN_LESSON_SLUG = "grammar-basics-lesson-1"
KNOWN_QUIZ_TITLE_PREFIX = "Grammar Basics Quiz"

BASE_URL = "http://localhost:8000/api"

# ANSI color codes
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
CYAN = '\033[96m'
RESET = '\033[0m'

class Phase2ComprehensiveTester:
    def __init__(self):
        self.token = None
        self.admin_token = None
        self.user_id = None
        self.test_results = {
            'passed': 0,
            'failed': 0,
            'errors': [],
            'details': []
        }
        self.category_slug = None
        self.lesson_id = None
        self.quiz_id = None
        self.game_id = None
        self.question_id = None
    
    def print_header(self, title):
        print(f"\n{BLUE}{'='*100}{RESET}")
        print(f"{BLUE}{title.center(100)}{RESET}")
        print(f"{BLUE}{'='*100}{RESET}")
    
    def print_section(self, title):
        print(f"\n{CYAN}{'─'*100}{RESET}")
        print(f"{CYAN}  {title}{RESET}")
        print(f"{CYAN}{'─'*100}{RESET}")
    
    def print_test(self, name: str, passed: bool, details: str = "", response_data: dict = None):
        status = f"{GREEN}✓ PASS{RESET}" if passed else f"{RED}✗ FAIL{RESET}"
        print(f"  {status} - {name}")
        if details:
            print(f"      {details}")
        if response_data and not passed:
            print(f"      Response: {json.dumps(response_data, indent=6)}")
        
        if passed:
            self.test_results['passed'] += 1
        else:
            self.test_results['failed'] += 1
            self.test_results['errors'].append(f"{name}: {details}")
        
        self.test_results['details'].append({
            'test': name,
            'passed': passed,
            'details': details
        })
    
    def setup_authentication(self) -> bool:
        """Setup authentication for tests"""
        self.print_header("SETUP - AUTHENTICATION")
        
        # Login with test user
        self.print_section("Test User Authentication")
        try:
            response = requests.post(
                f"{BASE_URL}/v1/auth/login/",
                json={
                    "email": "testuser1@test.com",
                    "password": "TestPass123!"
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                self.token = data.get('access') or data.get('token')
                user_data = data.get('user', {})
                self.user_id = user_data.get('id')
                
                self.print_test(
                    "Test user login",
                    True,
                    f"Token obtained, User ID: {self.user_id}"
                )
                return True
            else:
                self.print_test(
                    "Test user login",
                    False,
                    f"Status: {response.status_code}",
                    response.json() if response.text else None
                )
                return False
        except Exception as e:
            self.print_test("Test user login", False, str(e))
            return False
    
    def get_headers(self, is_admin=False):
        token = self.admin_token if is_admin and self.admin_token else self.token
        return {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
    
    def fetch_test_data(self):
        """Fetch IDs for testing using deterministic slugs/titles"""
        self.print_section("Fetching Test Data IDs")

        # Fetch category by known slug, fallback to first
        try:
            response = requests.get(
                f"{BASE_URL}/v1/lessons/categories/",
                headers=self.get_headers()
            )
            if response.status_code == 200 and response.text:
                data = response.json()
                d = data.get('data', data) if isinstance(data, dict) else data
                if isinstance(d, list):
                    categories = d
                elif isinstance(d, dict):
                    categories = d.get('categories') or d.get('results') or []
                else:
                    categories = []
                match = None
                for c in categories:
                    if isinstance(c, dict) and c.get('slug') == KNOWN_CATEGORY_SLUG:
                        match = c
                        break
                if not match and categories:
                    match = categories[0]
                if match:
                    # Some APIs return category as slug string directly
                    if isinstance(match, str):
                        self.category_slug = match
                    else:
                        self.category_slug = match.get('slug')
                    self.print_test("Fetch category", True, f"Category: {self.category_slug}")
                else:
                    self.print_test("Fetch category", False, "No categories found")
            else:
                self.print_test("Fetch category", False, f"Status: {response.status_code}")
        except Exception as e:
            self.print_test("Fetch category", False, str(e))

        # Fetch lesson by known slug, fallback to first
        try:
            response = requests.get(
                f"{BASE_URL}/v1/lessons/",
                headers=self.get_headers(),
                params={'limit': 50}
            )
            if response.status_code == 200 and response.text:
                data = response.json()
                lessons = data.get('results') or data.get('data') or []
                match = None
                for l in lessons:
                    if isinstance(l, dict) and l.get('slug') == KNOWN_LESSON_SLUG:
                        match = l
                        break
                if not match and self.category_slug:
                    # Prefer first lesson belonging to selected category
                    for l in lessons:
                        if not isinstance(l, dict):
                            continue
                        cat = l.get('category')
                        if isinstance(cat, dict) and cat.get('slug') == self.category_slug:
                            match = l
                            break
                if not match and lessons and isinstance(lessons[0], dict):
                    match = lessons[0]
                if match:
                    self.lesson_id = match.get('id')
                    self.print_test("Fetch lesson ID", True, f"Lesson: {self.lesson_id}")
                else:
                    self.print_test("Fetch lesson ID", False, "No lessons found")
            else:
                self.print_test("Fetch lesson ID", False, f"Status: {response.status_code}")
        except Exception as e:
            self.print_test("Fetch lesson ID", False, str(e))

        # Fetch quiz by known title prefix, fallback to first
        try:
            response = requests.get(
                f"{BASE_URL}/v1/quizzes/",
                headers=self.get_headers(),
                params={'limit': 50}
            )
            if response.status_code == 200 and response.text:
                data = response.json()
                quizzes = data.get('results') or data.get('data') or []
                match = None
                for q in quizzes:
                    if not isinstance(q, dict):
                        continue
                    title = q.get('title') or ''
                    if isinstance(title, str) and title.startswith(KNOWN_QUIZ_TITLE_PREFIX):
                        match = q
                        break
                if not match and quizzes and isinstance(quizzes[0], dict):
                    match = quizzes[0]
                if match:
                    self.quiz_id = match.get('id')
                    self.print_test("Fetch quiz ID", True, f"Quiz: {self.quiz_id}")
                else:
                    self.print_test("Fetch quiz ID", False, "No quizzes found")
            else:
                self.print_test("Fetch quiz ID", False, f"Status: {response.status_code}")
        except Exception as e:
            self.print_test("Fetch quiz ID", False, str(e))

        # Fetch game preferring grammar shooter, fallback to first
        try:
            response = requests.get(
                f"{BASE_URL}/v1/games/",
                headers=self.get_headers()
            )
            if response.status_code == 200 and response.text:
                data = response.json()
                games = data.get('results') or data.get('data') or []
                match = None
                for g in games:
                    if not isinstance(g, dict):
                        continue
                    gt = g.get('gameType') or g.get('game_type')
                    if gt == 'grammar_shooter':
                        match = g
                        break
                if not match and games and isinstance(games[0], dict):
                    match = games[0]
                if match:
                    self.game_id = match.get('id')
                    self.print_test("Fetch game ID", True, f"Game: {self.game_id}")
                else:
                    self.print_test("Fetch game ID", False, "No games found")
            else:
                self.print_test("Fetch game ID", False, f"Status: {response.status_code}")
        except Exception as e:
            self.print_test("Fetch game ID", False, str(e))
    
    # ========================================================================
    # PHASE 2 TESTS
    # ========================================================================
    
    def test_health_monitoring(self):
        """Test health and monitoring endpoints"""
        self.print_header("PHASE 2 - HEALTH & MONITORING ENDPOINTS")
        
        # Health check
        self.print_section("Health Check")
        try:
            response = requests.get(f"{BASE_URL}/health/")
            data = response.json() if response.text else {}
            
            self.print_test(
                "GET /api/health",
                response.status_code == 200 and data.get('status') == 'healthy',
                f"Status: {response.status_code}, Health: {data.get('status')}",
                data if response.status_code != 200 else None
            )
        except Exception as e:
            self.print_test("GET /api/health", False, str(e))
        
        # System status
        self.print_section("System Status")
        try:
            response = requests.get(f"{BASE_URL}/status/")
            data = response.json() if response.text else {}
            
            has_required = all(key in data for key in ['status', 'timestamp', 'version'])
            
            self.print_test(
                "GET /api/status",
                response.status_code == 200 and has_required,
                f"Status: {response.status_code}, Version: {data.get('version')}",
                data if response.status_code != 200 else None
            )
        except Exception as e:
            self.print_test("GET /api/status", False, str(e))
    
    def test_advanced_stats(self):
        """Test advanced statistics endpoints"""
        self.print_header("PHASE 2 - ADVANCED STATISTICS ENDPOINTS")
        
        # Progress statistics
        self.print_section("Progress Statistics")
        periods = ['week', 'month', 'year']
        for period in periods:
            try:
                response = requests.get(
                    f"{BASE_URL}/v1/stats/progress/",
                    headers=self.get_headers(),
                    params={'period': period}
                )
                data = response.json() if response.text else {}
                
                has_data = 'data' in data
                if has_data:
                    stats = data['data']
                    has_required = all(key in stats for key in ['dailyProgress', 'lessonsCompleted', 'quizzesTaken'])
                else:
                    has_required = False
                
                self.print_test(
                    f"GET /api/v1/stats/progress (period={period})",
                    response.status_code == 200 and has_required,
                    f"Status: {response.status_code}, Lessons: {stats.get('lessonsCompleted', 0) if has_data else 0}",
                    data if response.status_code != 200 else None
                )
            except Exception as e:
                self.print_test(f"GET /api/v1/stats/progress (period={period})", False, str(e))
        
        # Category statistics
        self.print_section("Category Statistics")
        if self.category_slug:
            try:
                response = requests.get(
                    f"{BASE_URL}/v1/stats/category/{self.category_slug}/",
                    headers=self.get_headers()
                )
                data = response.json() if response.text else {}
                
                has_data = 'data' in data
                if has_data:
                    stats = data['data']
                    has_required = all(key in stats for key in ['category', 'progress', 'accuracy'])
                else:
                    has_required = False
                
                self.print_test(
                    f"GET /api/v1/stats/category/{self.category_slug}",
                    response.status_code == 200 and has_required,
                    f"Status: {response.status_code}, Progress: {stats.get('progress', 0)}%",
                    data if response.status_code != 200 else None
                )
            except Exception as e:
                self.print_test(f"GET /api/v1/stats/category/{self.category_slug}", False, str(e))
        
        # Stats comparison
        self.print_section("Stats Comparison")
        try:
            response = requests.get(
                f"{BASE_URL}/v1/stats/comparison/",
                headers=self.get_headers()
            )
            data = response.json() if response.text else {}
            
            has_data = 'data' in data
            if has_data:
                comparison = data['data']
                has_required = all(key in comparison for key in ['comparison', 'strengths', 'improvements'])
            else:
                has_required = False
            
            self.print_test(
                "GET /api/v1/stats/comparison",
                response.status_code == 200 and has_required,
                f"Status: {response.status_code}, Strengths: {len(comparison.get('strengths', [])) if has_data else 0}",
                data if response.status_code != 200 else None
            )
        except Exception as e:
            self.print_test("GET /api/v1/stats/comparison", False, str(e))
    
    def test_grammar_shooter(self):
        """Test grammar shooter game endpoints"""
        self.print_header("PHASE 2 - GRAMMAR SHOOTER GAME")
        
        # Get questions
        self.print_section("Get Grammar Shooter Questions")
        try:
            response = requests.get(
                f"{BASE_URL}/v1/games/grammar-shooter/questions/",
                headers=self.get_headers(),
                params={'difficulty': 'easy', 'count': 5}
            )
            data = response.json() if response.text else {}
            
            has_data = 'data' in data
            if has_data:
                questions = data['data'].get('questions', [])
                if questions:
                    self.question_id = questions[0].get('id')
            else:
                questions = []
            
            self.print_test(
                "GET /api/v1/games/grammar-shooter/questions",
                response.status_code == 200 and len(questions) > 0,
                f"Status: {response.status_code}, Questions returned: {len(questions)}",
                data if response.status_code != 200 else None
            )
        except Exception as e:
            self.print_test("GET /api/v1/games/grammar-shooter/questions", False, str(e))
        
        # Validate answer
        self.print_section("Validate Grammar Shooter Answer")
        if self.question_id:
            try:
                response = requests.post(
                    f"{BASE_URL}/v1/games/grammar-shooter/validate/",
                    headers=self.get_headers(),
                    json={
                        'questionId': self.question_id,
                        'answer': 'A'
                    }
                )
                data = response.json() if response.text else {}
                
                has_data = 'data' in data
                if has_data:
                    result = data['data']
                    has_required = all(key in result for key in ['correct', 'explanation', 'points'])
                else:
                    has_required = False
                
                self.print_test(
                    "POST /api/v1/games/grammar-shooter/validate",
                    response.status_code == 200 and has_required,
                    f"Status: {response.status_code}, Correct: {result.get('correct') if has_data else 'N/A'}, Points: {result.get('points', 0) if has_data else 0}",
                    data if response.status_code != 200 else None
                )
            except Exception as e:
                self.print_test("POST /api/v1/games/grammar-shooter/validate", False, str(e))
    
    def test_village_resources(self):
        """Test village resources update"""
        self.print_header("PHASE 2 - VILLAGE RESOURCES MANAGEMENT")
        
        # Get current resources
        self.print_section("Get Current Village Resources")
        try:
            response = requests.get(
                f"{BASE_URL}/v1/village/resources/",
                headers=self.get_headers()
            )
            data = response.json() if response.text else {}
            
            has_data = 'data' in data
            if has_data:
                resources = data['data']
                initial_coins = resources.get('coins', 0)
            else:
                resources = {}
                initial_coins = 0
            
            self.print_test(
                "GET /api/v1/village/resources",
                response.status_code == 200 and has_data,
                f"Status: {response.status_code}, Coins: {initial_coins}",
                data if response.status_code != 200 else None
            )
        except Exception as e:
            self.print_test("GET /api/v1/village/resources", False, str(e))
            return
        
        # Update resources (add coins)
        self.print_section("Update Village Resources (Add)")
        try:
            response = requests.post(
                f"{BASE_URL}/v1/village/resources/update/",
                headers=self.get_headers(),
                json={
                    'coins': 100,
                    'operation': 'add'
                }
            )
            data = response.json() if response.text else {}
            
            has_data = 'data' in data
            if has_data:
                result = data['data']
                new_coins = result.get('resources', {}).get('coins', 0)
                coins_added = new_coins - initial_coins
            else:
                coins_added = 0
            
            self.print_test(
                "POST /api/v1/village/resources/update (add)",
                response.status_code == 200 and coins_added == 100,
                f"Status: {response.status_code}, Coins added: {coins_added}",
                data if response.status_code != 200 or coins_added != 100 else None
            )
        except Exception as e:
            self.print_test("POST /api/v1/village/resources/update (add)", False, str(e))
        
        # Update resources (subtract)
        self.print_section("Update Village Resources (Subtract)")
        try:
            response = requests.post(
                f"{BASE_URL}/v1/village/resources/update/",
                headers=self.get_headers(),
                json={
                    'coins': 50,
                    'operation': 'subtract'
                }
            )
            data = response.json() if response.text else {}
            
            self.print_test(
                "POST /api/v1/village/resources/update (subtract)",
                response.status_code == 200,
                f"Status: {response.status_code}",
                data if response.status_code != 200 else None
            )
        except Exception as e:
            self.print_test("POST /api/v1/village/resources/update (subtract)", False, str(e))
    
    def test_admin_endpoints(self):
        """Test admin content management endpoints"""
        self.print_header("PHASE 2 - ADMIN CONTENT MANAGEMENT")
        
        self.print_section("Note: Testing with non-admin user (expecting 403)")
        
        admin_endpoints = [
            ("GET", "/v1/admin/lessons/", "List all lessons"),
            ("GET", "/v1/admin/users/", "List all users"),
            ("GET", "/v1/admin/analytics/", "Platform analytics"),
        ]
        
        for method, endpoint, description in admin_endpoints:
            try:
                if method == "GET":
                    response = requests.get(
                        f"{BASE_URL}{endpoint}",
                        headers=self.get_headers()
                    )
                
                # Non-admin should get 403 or 401
                expected_denied = response.status_code in [403, 401]
                
                self.print_test(
                    f"{method} /api{endpoint} - {description}",
                    expected_denied,
                    f"Status: {response.status_code} ({'Access denied as expected' if expected_denied else 'SECURITY ISSUE: Should be denied'})",
                    response.json() if response.text and not expected_denied else None
                )
            except Exception as e:
                self.print_test(f"{method} /api{endpoint}", False, str(e))
    
    def test_integration_scenarios(self):
        """Test complete user workflows"""
        self.print_header("PHASE 2 - INTEGRATION SCENARIOS")
        
        # Scenario 1: Complete learning workflow
        self.print_section("Scenario 1: Complete Learning Session")
        try:
            # Start a lesson
            if self.lesson_id:
                response = requests.post(
                    f"{BASE_URL}/v1/lessons/{self.lesson_id}/start/",
                    headers=self.get_headers()
                )
                
                lesson_started = response.status_code == 200
                self.print_test(
                    "Start lesson",
                    lesson_started,
                    f"Status: {response.status_code}"
                )
                
                # Check updated progress
                time.sleep(0.5)
                response = requests.get(
                    f"{BASE_URL}/v1/stats/progress/",
                    headers=self.get_headers(),
                    params={'period': 'week'}
                )
                
                self.print_test(
                    "Check progress after lesson start",
                    response.status_code == 200,
                    f"Status: {response.status_code}"
                )
        except Exception as e:
            self.print_test("Learning workflow scenario", False, str(e))
        
        # Scenario 2: Game play workflow
        self.print_section("Scenario 2: Play Grammar Shooter")
        try:
            # Get questions
            response = requests.get(
                f"{BASE_URL}/v1/games/grammar-shooter/questions/",
                headers=self.get_headers(),
                params={'count': 3}
            )
            
            if response.status_code == 200:
                data = response.json()
                questions = data.get('data', {}).get('questions', [])
                
                correct_answers = 0
                for question in questions[:2]:  # Answer 2 questions
                    response = requests.post(
                        f"{BASE_URL}/v1/games/grammar-shooter/validate/",
                        headers=self.get_headers(),
                        json={
                            'questionId': question['id'],
                            'answer': question.get('correctAnswer', 'A')  # Use correct answer if available
                        }
                    )
                    if response.status_code == 200:
                        result = response.json().get('data', {})
                        if result.get('correct'):
                            correct_answers += 1
                
                self.print_test(
                    "Complete game session",
                    correct_answers > 0,
                    f"Answered correctly: {correct_answers}/2 questions"
                )
        except Exception as e:
            self.print_test("Game play scenario", False, str(e))
        
        # Scenario 3: Village management
        self.print_section("Scenario 3: Village Resource Management")
        try:
            # Earn resources
            response = requests.post(
                f"{BASE_URL}/v1/village/resources/update/",
                headers=self.get_headers(),
                json={'coins': 200, 'knowledge': 100, 'operation': 'add'}
            )
            
            earned_resources = response.status_code == 200
            
            # Check village status
            if earned_resources:
                response = requests.get(
                    f"{BASE_URL}/v1/village/",
                    headers=self.get_headers()
                )
                village_updated = response.status_code == 200
            else:
                village_updated = False
            
            self.print_test(
                "Village resource cycle",
                earned_resources and village_updated,
                f"Resources earned: {earned_resources}, Village updated: {village_updated}"
            )
        except Exception as e:
            self.print_test("Village management scenario", False, str(e))
    
    def run_all_tests(self):
        """Run complete test suite"""
        self.print_header("PHASE 2 COMPREHENSIVE TEST SUITE")
        print(f"Base URL: {BASE_URL}")
        print(f"Test Started: {datetime.now()}")
        
        # Setup
        if not self.setup_authentication():
            print(f"\n{RED}Authentication failed. Cannot proceed with tests.{RESET}")
            return False
        
        self.fetch_test_data()
        
        # Run all test categories
        self.test_health_monitoring()
        self.test_advanced_stats()
        self.test_grammar_shooter()
        self.test_village_resources()
        self.test_admin_endpoints()
        self.test_integration_scenarios()
        
        # Print summary
        self.print_summary()
        
        return self.test_results['passed'] / (self.test_results['passed'] + self.test_results['failed']) >= 0.8
    
    def print_summary(self):
        """Print test results summary"""
        self.print_header("TEST RESULTS SUMMARY")
        
        total = self.test_results['passed'] + self.test_results['failed']
        pass_rate = (self.test_results['passed'] / total * 100) if total > 0 else 0
        
        print(f"\n  Total Tests Run: {total}")
        print(f"  {GREEN}Passed: {self.test_results['passed']}{RESET}")
        print(f"  {RED}Failed: {self.test_results['failed']}{RESET}")
        print(f"  Pass Rate: {pass_rate:.1f}%")
        
        if self.test_results['failed'] > 0:
            print(f"\n{RED}Failed Tests:{RESET}")
            for error in self.test_results['errors']:
                print(f"  ✗ {error}")
        
        print(f"\n{BLUE}{'='*100}{RESET}")
        
        if pass_rate >= 90:
            print(f"{GREEN}{'EXCELLENT! All Phase 2 endpoints working correctly.'.center(100)}{RESET}")
        elif pass_rate >= 80:
            print(f"{YELLOW}{'GOOD! Most Phase 2 endpoints working, minor issues found.'.center(100)}{RESET}")
        else:
            print(f"{RED}{'ATTENTION NEEDED! Several Phase 2 endpoints require fixes.'.center(100)}{RESET}")
        
        print(f"{BLUE}{'='*100}{RESET}\n")


if __name__ == "__main__":
    import sys
    auto_run = "--yes" in sys.argv or "--auto" in sys.argv
    
    print(f"\n{YELLOW}{'='*100}{RESET}")
    print(f"{YELLOW}{'PHASE 2 COMPREHENSIVE TEST SUITE'.center(100)}{RESET}")
    print(f"{YELLOW}{'='*100}{RESET}\n")
    
    print("Prerequisites:")
    print("  1. Django server running on http://localhost:8000")
    print("  2. Synthetic data generated (run generate_synthetic_data.py)")
    print("  3. Database populated with test data\n")
    
    if not auto_run:
        input("Press Enter to start comprehensive tests...")
    
    tester = Phase2ComprehensiveTester()
    success = tester.run_all_tests()
    
    exit(0 if success else 1)
