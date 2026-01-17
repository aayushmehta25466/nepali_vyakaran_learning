# Nepali Vyakaran Learning - Complete Project Analysis

**Generated:** January 14, 2026  
**Project Type:** Full-Stack Web Application (React + Django REST Framework)

---

## 📊 Project Statistics

### Overall Structure
```
e:\Projects\Hackathon\Nepali\
├── Backend/                          # Django REST API
│   └── nepali_vyakaran_learning/     # Main Django Project
├── Frontend/                         # React Application
│   └── -_-/                          # React Project Root
└── docker-compose.yaml               # Container Orchestration
```

### Backend - Django REST Framework
**Framework:** Django 5.1 | **Python:** 3.12  
**Database:** SQLite (Development) / PostgreSQL-Ready  
**API Version:** v1

#### Installed Apps & Dependencies
- **Core:** Django, DRF, Gunicorn
- **Authentication:** SimpleJWT, django-allauth, dj-rest-auth
- **API Tools:** drf-spectacular (OpenAPI docs), django-filter, django-cors-headers
- **Image Processing:** Pillow
- **Storage:** django-storages
- **Environment:** python-dotenv

#### Custom Apps (2)

**1. accounts/** - User Management & Auth
- Models: `CustomUser`, `GameState`, `UserSettings`, `OTPVerification`, `ActivityLog`
- Views: 20+ endpoints including:
  - Auth (login, refresh, profile)
  - Admin operations (user management, badge awards)
  - Game statistics and leaderboards
  - Settings management
- Endpoints: ~15 routes under `/api/v1/auth/` and `/api/v1/admin/`
- Admin Panel: Custom actions for user management, streaks, points/coins

**2. learning_vyakaran/** - Learning Content & Gamification
- Models: `Topic`, `Lesson`, `Quiz`, `Question`, `Questionnaire`, `Badge`, `Achievement`, `Building`, `VillageLayout`, `WritingPrompt`, `WritingSubmission`, `GameSession`
- Views: 25+ endpoints including:
  - Lessons (CRUD, submissions)
  - Quizzes & Questions
  - Quests (start, progress, complete, daily)
  - Achievements (list, detail, claim)
  - Badges (award, list)
  - Writing Practice (prompts, submissions, grammar-check)
  - Games (sessions, leaderboard)
  - Village Building (add/upgrade/delete)
  - Stats & Activity Tracking
- Endpoints: ~20+ routes under `/api/v1/lessons/`, `/api/v1/quests/`, etc.
- Admin Panel: Content management, publish/unpublish lessons, quest activation

#### Configuration Highlights
- **JWT:** 24-hour access, 7-day refresh tokens
- **CORS:** Allows `localhost:3000`, `localhost:5173`
- **Static Files:** `/static/` → `staticfiles/` directory
- **Media Files:** `/media/` → `media/` directory
- **Rate Limiting:** 100 req/hr (anon), 1000 req/hr (users)
- **Email:** Console backend (dev) / Gmail SMTP (prod)
- **API Docs:** Swagger UI (`/api/docs`), ReDoc (`/api/redoc`), Schema (`/api/schema`)

#### Files & Structure
- **Main Settings:** [nepali_vyakaran_learning/settings.py](Backend/nepali_vyakaran_learning/nepali_vyakaran_learning/settings.py)
- **URLs:** [nepali_vyakaran_learning/urls.py](Backend/nepali_vyakaran_learning/nepali_vyakaran_learning/urls.py)
- **Requirements:** [requirements.txt](Backend/nepali_vyakaran_learning/requirements.txt) (20+ packages)
- **Tests:** [test_phase3_comprehensive.py](Backend/nepali_vyakaran_learning/test_phase3_comprehensive.py) - 94.7% pass rate
- **Migrations:** Both apps have database migrations
- **Data Generation:** [generate_synthetic_data.py](Backend/nepali_vyakaran_learning/generate_synthetic_data.py) for testing

#### Database Schema Summary
- **Users:** CustomUser (extended Django User)
- **Learning:** Topics, Lessons, Quizzes, Questions, Questionnaires
- **Gamification:** Badges, Achievements, Quests, GameStates
- **Content:** WritingPrompts, WritingSubmissions, VillageLayouts, Buildings
- **Analytics:** ActivityLogs (audit trail), GameSessions
- **Settings:** UserSettings, OTPVerification

---

### Frontend - React 18

**Framework:** React 18.2 | **Build Tool:** react-scripts 5.0  
**Node:** 18+ | **Package Manager:** npm

#### Key Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| react-router-dom | ^6.8.0 | Client-side routing |
| react-spring | ^9.7.0 | Smooth animations |
| framer-motion | ^10.0.0 | Advanced animations |
| phaser | ^3.90.0 | 2D game engine (Grammar Shooter) |
| styled-components | ^5.3.9 | CSS-in-JS styling |
| react-confetti | ^6.1.0 | Celebration effects |
| lucide-react | ^0.263.1 | Icon library |

#### Project Structure
```
src/
├── App.js              # Root component
├── App.css             # Global styles
├── index.js            # React entry point
├── components/         # Reusable components
│   ├── Games/          # Grammar Shooter, game UI
│   ├── Header/         # Navigation, branding
│   └── Lessons/        # Lesson display, progress
├── pages/              # Full-page components
│   ├── Games/          # Game pages
│   ├── Home/           # Landing/dashboard
│   ├── Lessons/        # Lesson progression
│   ├── Progress/       # Stats, achievements
│   ├── Settings/       # User preferences
│   ├── Village/        # Village building game
│   └── Writing/        # Writing practice
├── contexts/           # Global state management
│   ├── GameContext.js  # Game state (scores, level, etc.)
│   └── LanguageContext.js # Nepali/English toggle
└── public/
    └── index.html      # HTML template
```

#### Features & Pages
1. **Home** - Dashboard with user stats, progress overview
2. **Lessons** - Structured grammar lessons with progression
3. **Games** - Grammar Shooter (Phaser-based 2D game)
4. **Village** - Building/resource management game
5. **Writing** - Free-writing with AI grammar check
6. **Progress** - Achievements, leaderboard, stats
7. **Settings** - Language preference, notifications, reset
8. **Header** - Navigation, auth status, language switcher

#### State Management
- **GameContext:** Tracks user level, points, coins, achievements
- **LanguageContext:** Manages Nepali/English language preference
- **React Router:** Client-side routing with 6+ pages

#### Styling & Animation
- CSS modules + styled-components for component styles
- Framer-motion for smooth page transitions
- React-spring for complex animations
- Lucide icons for consistent UI
- Tailwind-ready structure (not currently used, can be added)

#### Build & Scripts
- `npm start` - Dev server (localhost:3000)
- `npm run build` - Production build to `build/` directory
- `npm test` - Jest test runner

---

## 🔌 API Integration Points

### Backend Serves
- **Port:** 8000
- **Base URL:** `http://localhost:8000` (dev) / `http://web:8000` (docker)
- **Endpoints:** 48+ under `/api/v1/`
- **Authentication:** JWT Bearer tokens (SimpleJWT)
- **Response Format:** JSON with standardized `success_response` / `error_response` wrappers
- **CORS:** Enabled for `localhost:3000`, `localhost:5173`

### Frontend Calls
- Lesson list/detail endpoints
- Quiz submission endpoints
- Quest start/complete endpoints
- Game session endpoints
- Writing practice & grammar check
- User profile & stats
- Achievement/badge claims
- Settings CRUD

---

## 🐳 Current Docker Setup

### Existing Files
- **[dockerfile](Backend/nepali_vyakaran_learning/dockerfile)** - Backend Dockerfile (⚠️ **Bug:** references `wedding.wsgi:application` instead of `nepali_vyakaran_learning.wsgi:application`)
- **[.dockerignore](Backend/nepali_vyakaran_learning/.dockerignore)** - Excludes `env/`, `node_modules/`, `.git`, etc.
- **[nginx/conf.d/default.conf](nginx/conf.d/default.conf)** - Nginx reverse proxy config
- **[docker-compose.yaml](docker-compose.yaml)** - Old multi-service setup (⚠️ **Needs overhaul:** missing frontend service, outdated references)

### Issues to Fix
1. Backend Dockerfile references wrong WSGI module (`wedding.wsgi` → should be `nepali_vyakaran_learning.wsgi`)
2. docker-compose.yaml missing:
   - React frontend service
   - PostgreSQL database service
   - Redis cache service
   - Proper environment configuration
   - Volumes for development
3. No frontend Dockerfile
4. Nginx config needs updates for multi-service setup

---

## 📦 Dependency Summary

### Backend (Python)
```
Core: Django (5.1), DRF (3.15), Gunicorn, Asgiref
Auth: SimpleJWT (5.3), django-allauth (65.0), dj-rest-auth (7.0)
API: drf-spectacular (0.28), django-cors-headers (4.6), django-filter (25.2)
Utils: Pillow (11.0), python-dotenv (1.0), django-storages (1.14)
```

### Frontend (JavaScript)
```
Core: React (18.2), react-dom (18.2), react-router-dom (6.8)
Games: phaser (3.90)
Animation: framer-motion (10.0), react-spring (9.7), react-confetti (6.1)
Styling: styled-components (5.3), lucide-react (0.263)
Testing: react-scripts (5.0), @testing-library (13+)
```

### Database
- **Development:** SQLite (included)
- **Production:** PostgreSQL (recommended, not yet configured)

### Caching
- **Optional:** Redis (recommended, not yet configured)

---

## 🚀 Deployment Readiness

### Current Status: ✅ Ready with Configuration Needed
- ✅ 48+ endpoints implemented and tested (94.7% pass rate)
- ✅ Comprehensive API documentation (Swagger/ReDoc)
- ✅ Authentication and permission system
- ✅ Admin panel with content management
- ✅ React frontend with all major pages
- ✅ Database schema and migrations
- ❌ Docker setup incomplete
- ❌ PostgreSQL integration
- ❌ Redis caching
- ❌ Production docker-compose

### Next Steps
1. **Fix & Update Docker Files** - Correct Dockerfile bugs, create frontend Dockerfile
2. **Production docker-compose** - Add PostgreSQL, Redis, proper networking
3. **Environment Configuration** - .env templates for dev/prod
4. **Testing & Load Testing** - Validate multi-container setup
5. **CI/CD Setup** - GitHub Actions or similar
6. **Monitoring** - Sentry for error tracking

---

## 📋 File Locations Reference

| Component | File Path |
|-----------|-----------|
| Backend Settings | `Backend/nepali_vyakaran_learning/nepali_vyakaran_learning/settings.py` |
| Backend URLs | `Backend/nepali_vyakaran_learning/nepali_vyakaran_learning/urls.py` |
| Requirements | `Backend/nepali_vyakaran_learning/requirements.txt` |
| Current Dockerfile | `Backend/nepali_vyakaran_learning/dockerfile` |
| Nginx Config | `nginx/conf.d/default.conf` |
| Frontend Package | `Frontend/-_-/package.json` |
| Docker Compose | `docker-compose.yaml` |
| Chat History | `Backend/nepali_vyakaran_learning/CHAT_HISTORY_2026-01-14.md` |

---

## 🎯 Summary

This is a **production-ready gamified education platform** with a robust Django REST backend (48+ endpoints, 94.7% test pass rate) and a modern React frontend featuring interactive games, lessons, and village building mechanics. The project supports Nepali-first bilingual learning for Class 4 students.

**Key Takeaway:** Backend API is fully implemented and documented. Frontend is feature-complete with animations and games. Main work needed: **Docker containerization, PostgreSQL setup, and production configuration.**

