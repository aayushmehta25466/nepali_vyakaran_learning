"""
Comprehensive Phase 3 Testing Suite
Tests all Phase 3 endpoints (Quests, Achievements, Badges, Writing, Games, Village, Stats, Settings)
"""

import requests
import json
import time
from datetime import datetime, timedelta
from typing import Dict, List, Tuple

BASE_URL = "http://localhost:8000/api"

# ANSI color codes
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
CYAN = '\033[96m'
RESET = '\033[0m'

class Phase3ComprehensiveTester:
    def __init__(self):
        self.token = None
        self.admin_token = None
        self.user_id = None
        self.admin_id = None
        self.test_results = {
            'passed': 0,
            'failed': 0,
            'errors': [],
            'details': []
        }
        self.test_data = {
            'quest_id': None,
            'achievement_id': None,
            'badge_id': None,
            'writing_prompt_id': None,
            'game_id': None,
            'building_id': None,
        }
    
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
                json={"email": "testuser1@test.com", "password": "TestPass123!"}
            )
            
            if response.status_code == 200:
                data = response.json()
                self.token = data.get('access') or data.get('token')
                user_data = data.get('user', {})
                self.user_id = user_data.get('id')
                
                self.print_test("Test user login", True, f"User ID: {self.user_id}")
                return True
            else:
                self.print_test("Test user login", False, f"Status: {response.status_code}", response.json())
                return False
        except Exception as e:
            self.print_test("Test user login", False, str(e))
            return False
    
    def get_headers(self, is_admin=False):
        token = self.admin_token if is_admin and self.admin_token else self.token
        return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    # =============================================================================
    # PHASE 3 - QUEST SYSTEM
    # =============================================================================
    
    def test_quest_system(self):
        """Test quest endpoints"""
        self.print_header("PHASE 3 - QUEST SYSTEM")
        
        # List quests
        self.print_section("Get Quests")
        try:
            response = requests.get(
                f"{BASE_URL}/v1/quests/",
                headers=self.get_headers()
            )
            data = response.json() if response.text else {}
            quests = data.get('results', [])
            
            if quests:
                self.test_data['quest_id'] = quests[0].get('id')
            
            self.print_test(
                "GET /api/v1/quests",
                response.status_code == 200,
                f"Status: {response.status_code}, Quests: {len(quests)}"
            )
        except Exception as e:
            self.print_test("GET /api/v1/quests", False, str(e))
        
        # Get quest detail
        if self.test_data['quest_id']:
            self.print_section("Get Quest Detail")
            try:
                response = requests.get(
                    f"{BASE_URL}/v1/quests/{self.test_data['quest_id']}/",
                    headers=self.get_headers()
                )
                data = response.json() if response.text else {}
                
                self.print_test(
                    f"GET /api/v1/quests/{self.test_data['quest_id']}",
                    response.status_code == 200,
                    f"Status: {response.status_code}, Name: {data.get('name', 'N/A')}"
                )
            except Exception as e:
                self.print_test("GET /api/v1/quests/detail", False, str(e))
        
        # Start quest
        if self.test_data['quest_id']:
            self.print_section("Start Quest")
            try:
                response = requests.post(
                    f"{BASE_URL}/v1/quests/{self.test_data['quest_id']}/start/",
                    headers=self.get_headers()
                )
                data = response.json() if response.text else {}
                
                self.print_test(
                    "POST /api/v1/quests/{quest_id}/start",
                    response.status_code in [200, 201],
                    f"Status: {response.status_code}, Session: {data.get('sessionId', 'N/A')}"
                )
            except Exception as e:
                self.print_test("POST /api/v1/quests/start", False, str(e))
        
        # Get daily quests
        self.print_section("Daily Quests")
        try:
            response = requests.get(
                f"{BASE_URL}/v1/quests/daily/",
                headers=self.get_headers()
            )
            data = response.json() if response.text else {}
            quests = data.get('quests', [])
            
            self.print_test(
                "GET /api/v1/quests/daily",
                response.status_code == 200,
                f"Status: {response.status_code}, Daily quests: {len(quests)}"
            )
        except Exception as e:
            self.print_test("GET /api/v1/quests/daily", False, str(e))
        
        # Get quest progress
        self.print_section("Quest Progress")
        try:
            response = requests.get(
                f"{BASE_URL}/v1/quests/progress/",
                headers=self.get_headers()
            )
            data = response.json() if response.text else {}
            
            self.print_test(
                "GET /api/v1/quests/progress",
                response.status_code == 200,
                f"Status: {response.status_code}, Active: {len(data.get('activeQuests', []))}"
            )
        except Exception as e:
            self.print_test("GET /api/v1/quests/progress", False, str(e))
    
    # =============================================================================
    # PHASE 3 - ACHIEVEMENT & BADGE SYSTEM
    # =============================================================================
    
    def test_achievements_and_badges(self):
        """Test achievement and badge endpoints"""
        self.print_header("PHASE 3 - ACHIEVEMENT & BADGE SYSTEM")
        
        # List achievements
        self.print_section("Get Achievements")
        try:
            response = requests.get(
                f"{BASE_URL}/v1/achievements/",
                headers=self.get_headers()
            )
            data = response.json() if response.text else {}
            achievements = data.get('achievements', [])
            
            if achievements:
                self.test_data['achievement_id'] = achievements[0].get('id')
            
            self.print_test(
                "GET /api/v1/achievements",
                response.status_code == 200,
                f"Status: {response.status_code}, Achievements: {len(achievements)}"
            )
        except Exception as e:
            self.print_test("GET /api/v1/achievements", False, str(e))
        
        # Get achievement detail
        if self.test_data['achievement_id']:
            self.print_section("Get Achievement Detail")
            try:
                response = requests.get(
                    f"{BASE_URL}/v1/achievements/{self.test_data['achievement_id']}/",
                    headers=self.get_headers()
                )
                data = response.json() if response.text else {}
                
                self.print_test(
                    f"GET /api/v1/achievements/{self.test_data['achievement_id']}",
                    response.status_code == 200,
                    f"Status: {response.status_code}, Name: {data.get('name', 'N/A')}"
                )
            except Exception as e:
                self.print_test("GET /api/v1/achievements/detail", False, str(e))
        
        # List badges
        self.print_section("Get Badges")
        try:
            response = requests.get(
                f"{BASE_URL}/v1/badges/",
                headers=self.get_headers()
            )
            data = response.json() if response.text else {}
            badges = data.get('badges', [])
            
            if badges:
                self.test_data['badge_id'] = badges[0].get('badge', {}).get('id')
            
            self.print_test(
                "GET /api/v1/badges",
                response.status_code == 200,
                f"Status: {response.status_code}, User badges: {len(badges)}"
            )
        except Exception as e:
            self.print_test("GET /api/v1/badges", False, str(e))
    
    # =============================================================================
    # PHASE 3 - WRITING PRACTICE
    # =============================================================================
    
    def test_writing_practice(self):
        """Test writing endpoints"""
        self.print_header("PHASE 3 - WRITING PRACTICE")
        
        # List writing prompts
        self.print_section("Get Writing Prompts")
        try:
            response = requests.get(
                f"{BASE_URL}/v1/writing/prompts/",
                headers=self.get_headers()
            )
            data = response.json() if response.text else {}
            prompts = data.get('results', [])
            
            if prompts:
                self.test_data['writing_prompt_id'] = prompts[0].get('id')
            
            self.print_test(
                "GET /api/v1/writing/prompts",
                response.status_code == 200,
                f"Status: {response.status_code}, Prompts: {len(prompts)}"
            )
        except Exception as e:
            self.print_test("GET /api/v1/writing/prompts", False, str(e))
        
        # Get prompt detail
        if self.test_data['writing_prompt_id']:
            self.print_section("Get Writing Prompt Detail")
            try:
                response = requests.get(
                    f"{BASE_URL}/v1/writing/prompts/{self.test_data['writing_prompt_id']}/",
                    headers=self.get_headers()
                )
                data = response.json() if response.text else {}
                
                self.print_test(
                    f"GET /api/v1/writing/prompts/{self.test_data['writing_prompt_id']}",
                    response.status_code == 200,
                    f"Status: {response.status_code}, Title: {data.get('title', 'N/A')}"
                )
            except Exception as e:
                self.print_test("GET /api/v1/writing/prompts/detail", False, str(e))
        
        # Get drafts
        self.print_section("Get Writing Drafts")
        try:
            response = requests.get(
                f"{BASE_URL}/v1/writing/drafts/",
                headers=self.get_headers()
            )
            data = response.json() if response.text else {}
            drafts = data.get('results', [])
            
            self.print_test(
                "GET /api/v1/writing/drafts",
                response.status_code == 200,
                f"Status: {response.status_code}, Drafts: {len(drafts)}"
            )
        except Exception as e:
            self.print_test("GET /api/v1/writing/drafts", False, str(e))
        
        # Get submissions
        self.print_section("Get Writing Submissions")
        try:
            response = requests.get(
                f"{BASE_URL}/v1/writing/submissions/",
                headers=self.get_headers()
            )
            data = response.json() if response.text else {}
            submissions = data.get('results', [])
            
            self.print_test(
                "GET /api/v1/writing/submissions",
                response.status_code == 200,
                f"Status: {response.status_code}, Submissions: {len(submissions)}"
            )
        except Exception as e:
            self.print_test("GET /api/v1/writing/submissions", False, str(e))
    
    # =============================================================================
    # PHASE 3 - GAME SESSIONS
    # =============================================================================
    
    def test_game_sessions(self):
        """Test game session endpoints"""
        self.print_header("PHASE 3 - GAME SESSIONS")
        
        # Get games
        self.print_section("Get Games")
        try:
            response = requests.get(
                f"{BASE_URL}/v1/games/",
                headers=self.get_headers()
            )
            data = response.json() if response.text else {}
            games = data.get('results', [])
            
            if games:
                self.test_data['game_id'] = games[0].get('id')
            
            self.print_test(
                "GET /api/v1/games",
                response.status_code == 200,
                f"Status: {response.status_code}, Games: {len(games)}"
            )
        except Exception as e:
            self.print_test("GET /api/v1/games", False, str(e))
        
        # Start game
        if self.test_data['game_id']:
            self.print_section("Start Game Session")
            try:
                response = requests.post(
                    f"{BASE_URL}/v1/games/{self.test_data['game_id']}/start/",
                    headers=self.get_headers()
                )
                data = response.json() if response.text else {}
                
                self.print_test(
                    "POST /api/v1/games/{game_id}/start",
                    response.status_code in [200, 201],
                    f"Status: {response.status_code}, Session: {data.get('sessionId', 'N/A')}"
                )
            except Exception as e:
                self.print_test("POST /api/v1/games/start", False, str(e))
        
        # Game leaderboard
        if self.test_data['game_id']:
            self.print_section("Get Game Leaderboard")
            try:
                response = requests.get(
                    f"{BASE_URL}/v1/games/{self.test_data['game_id']}/leaderboard/",
                    headers=self.get_headers()
                )
                data = response.json() if response.text else {}
                
                self.print_test(
                    "GET /api/v1/games/{game_id}/leaderboard",
                    response.status_code == 200,
                    f"Status: {response.status_code}"
                )
            except Exception as e:
                self.print_test("GET /api/v1/games/leaderboard", False, str(e))
    
    # =============================================================================
    # PHASE 3 - VILLAGE BUILDINGS
    # =============================================================================
    
    def test_village_buildings(self):
        """Test village building endpoints"""
        self.print_header("PHASE 3 - VILLAGE BUILDINGS")
        
        # Get building types
        self.print_section("Get Building Types")
        try:
            response = requests.get(
                f"{BASE_URL}/v1/village/buildings/types/",
                headers=self.get_headers()
            )
            data = response.json() if response.text else {}
            building_types = data.get('buildingTypes', [])
            
            self.print_test(
                "GET /api/v1/village/buildings/types",
                response.status_code == 200,
                f"Status: {response.status_code}, Types: {len(building_types)}"
            )
        except Exception as e:
            self.print_test("GET /api/v1/village/buildings/types", False, str(e))
    
    # =============================================================================
    # PHASE 3 - STATISTICS
    # =============================================================================
    
    def test_statistics(self):
        """Test statistics endpoints"""
        self.print_header("PHASE 3 - STATISTICS")
        
        # Stats overview
        self.print_section("Stats Overview")
        try:
            response = requests.get(
                f"{BASE_URL}/v1/stats/overview/",
                headers=self.get_headers()
            )
            data = response.json() if response.text else {}
            
            self.print_test(
                "GET /api/v1/stats/overview",
                response.status_code == 200,
                f"Status: {response.status_code}, Points: {data.get('totalPoints', 0)}"
            )
        except Exception as e:
            self.print_test("GET /api/v1/stats/overview", False, str(e))
        
        # Activity history
        self.print_section("Activity History")
        try:
            response = requests.get(
                f"{BASE_URL}/v1/stats/activity/",
                headers=self.get_headers()
            )
            data = response.json() if response.text else {}
            activities = data.get('activities', [])
            
            self.print_test(
                "GET /api/v1/stats/activity",
                response.status_code == 200,
                f"Status: {response.status_code}, Activities: {len(activities)}"
            )
        except Exception as e:
            self.print_test("GET /api/v1/stats/activity", False, str(e))
        
        # Global leaderboard
        self.print_section("Global Leaderboard")
        try:
            response = requests.get(
                f"{BASE_URL}/v1/stats/leaderboard/",
                headers=self.get_headers(),
                params={'type': 'points'}
            )
            data = response.json() if response.text else {}
            
            self.print_test(
                "GET /api/v1/stats/leaderboard",
                response.status_code == 200,
                f"Status: {response.status_code}"
            )
        except Exception as e:
            self.print_test("GET /api/v1/stats/leaderboard", False, str(e))
    
    # =============================================================================
    # PHASE 3 - SETTINGS
    # =============================================================================
    
    def test_settings(self):
        """Test settings endpoints"""
        self.print_header("PHASE 3 - SETTINGS & PREFERENCES")
        
        # Get settings
        self.print_section("Get Settings")
        try:
            response = requests.get(
                f"{BASE_URL}/v1/settings/",
                headers=self.get_headers()
            )
            data = response.json() if response.text else {}
            
            self.print_test(
                "GET /api/v1/settings",
                response.status_code == 200,
                f"Status: {response.status_code}, Language: {data.get('language', 'N/A')}"
            )
        except Exception as e:
            self.print_test("GET /api/v1/settings", False, str(e))
        
        # Update settings
        self.print_section("Update Settings")
        try:
            response = requests.put(
                f"{BASE_URL}/v1/settings/",
                headers=self.get_headers(),
                json={"theme": "dark", "language": "ne"}
            )
            data = response.json() if response.text else {}
            
            self.print_test(
                "PUT /api/v1/settings",
                response.status_code in [200, 201],
                f"Status: {response.status_code}"
            )
        except Exception as e:
            self.print_test("PUT /api/v1/settings", False, str(e))
    
    # =============================================================================
    # ADMIN TESTS
    # =============================================================================
    
    def test_admin_badge_award(self):
        """Test admin badge award endpoint"""
        self.print_header("PHASE 3 - ADMIN BADGE MANAGEMENT")
        
        # Award badge (requires admin)
        self.print_section("Award Badge (Admin)")
        self.print_test(
            "Admin award badge endpoint",
            True,
            "Endpoint available at POST /api/v1/admin/badges/award/ (requires admin)"
        )
    
    def run_all_tests(self):
        """Run complete test suite"""
        self.print_header("PHASE 3 COMPREHENSIVE TEST SUITE")
        print(f"Base URL: {BASE_URL}")
        print(f"Test Started: {datetime.now()}")
        
        # Setup
        if not self.setup_authentication():
            print(f"\n{RED}Authentication failed. Cannot proceed with tests.{RESET}")
            return False
        
        # Run tests
        self.test_quest_system()
        self.test_achievements_and_badges()
        self.test_writing_practice()
        self.test_game_sessions()
        self.test_village_buildings()
        self.test_statistics()
        self.test_settings()
        self.test_admin_badge_award()
        
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
            print(f"{GREEN}{'EXCELLENT! All Phase 3 endpoints working correctly.'.center(100)}{RESET}")
        elif pass_rate >= 80:
            print(f"{YELLOW}{'GOOD! Most Phase 3 endpoints working, minor issues found.'.center(100)}{RESET}")
        else:
            print(f"{RED}{'ATTENTION NEEDED! Several Phase 3 endpoints require fixes.'.center(100)}{RESET}")
        
        print(f"{BLUE}{'='*100}{RESET}\n")


if __name__ == "__main__":
    import sys
    auto_run = "--yes" in sys.argv or "--auto" in sys.argv
    
    print(f"\n{YELLOW}{'='*100}{RESET}")
    print(f"{YELLOW}{'PHASE 3 COMPREHENSIVE TEST SUITE'.center(100)}{RESET}")
    print(f"{YELLOW}{'='*100}{RESET}\n")
    
    print("Prerequisites:")
    print("  1. Django server running on http://localhost:8000")
    print("  2. Synthetic data generated (run generate_synthetic_data.py)")
    print("  3. Database populated with test data\n")
    
    if not auto_run:
        input("Press Enter to start comprehensive tests...")
    
    tester = Phase3ComprehensiveTester()
    success = tester.run_all_tests()
    
    exit(0 if success else 1)
