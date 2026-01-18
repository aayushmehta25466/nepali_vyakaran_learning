# API Specification

## Overview

The Nepali Vyakaran Learning Platform provides a RESTful API built with Django REST Framework. The API supports educational content delivery, user progress tracking, gamification features, and administrative functions.

**Base URL**: `http://localhost:8000/api/v1/`
**Authentication**: JWT Bearer Token
**Content Type**: `application/json`

## Authentication Endpoints

### 1. User Login
**Endpoint**: `POST /api/v1/auth/login/`  
**Purpose**: Authenticate user and obtain JWT access token  
**Authentication**: None required

**Request Body**:
```json
{
  "username": "student123",
  "password": "secure_password"
}
```

**Response** (200 OK):
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 123,
    "username": "student123",
    "email": "student@example.com"
  }
}
```

### 2. Token Refresh
**Endpoint**: `POST /api/v1/auth/token/refresh/`  
**Purpose**: Refresh expired JWT access token using refresh token  
**Authentication**: None required

**Request Body**:
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Response** (200 OK):
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

## Learning Content Endpoints

### 3. List Available Lessons
**Endpoint**: `GET /api/v1/lessons/`  
**Purpose**: Retrieve paginated list of grammar lessons with progress indicators  
**Authentication**: JWT Bearer Token

**Query Parameters**:
- `category` (optional): Filter by lesson category
- `difficulty` (optional): Filter by difficulty level (1-5)
- `page` (optional): Page number for pagination

**Response** (200 OK):
```json
{
  "count": 45,
  "next": "http://localhost:8000/api/v1/lessons/?page=2",
  "previous": null,
  "results": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "title": "Nepali Nouns and Articles",
      "description": "Learn basic noun formation and article usage",
      "category": "grammar_basics",
      "difficulty": 2,
      "estimated_duration": 15,
      "is_completed": false,
      "progress_percentage": 30,
      "thumbnail_url": "/media/lesson_thumbnails/nouns.jpg"
    }
  ]
}
```

### 4. Get Lesson Details
**Endpoint**: `GET /api/v1/lessons/{lesson_id}/`  
**Purpose**: Retrieve complete lesson content including exercises and multimedia  
**Authentication**: JWT Bearer Token

**Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "title": "Nepali Nouns and Articles",
  "description": "Learn basic noun formation and article usage",
  "category": "grammar_basics",
  "difficulty": 2,
  "estimated_duration": 15,
  "content": {
    "sections": [
      {
        "type": "explanation",
        "title": "What are Nouns?",
        "content": "In Nepali, nouns (संज्ञा) are words that name people, places, things..."
      },
      {
        "type": "exercise",
        "question": "Identify the noun in: 'रामले किताब पढ्छ'",
        "options": ["राम", "किताब", "पढ्छ"],
        "correct_answer": 1
      }
    ]
  },
  "prerequisites": ["550e8400-e29b-41d4-a716-446655440000"],
  "user_progress": {
    "is_completed": false,
    "current_section": 2,
    "score": 85,
    "attempts": 1
  }
}
```

## Assessment Endpoints

### 5. Submit Quiz Answers
**Endpoint**: `POST /api/v1/quizzes/{quiz_id}/submit/`  
**Purpose**: Submit quiz answers and receive immediate feedback with scoring  
**Authentication**: JWT Bearer Token

**Request Body**:
```json
{
  "answers": [
    {
      "question_id": "550e8400-e29b-41d4-a716-446655440010",
      "selected_answer": 2,
      "time_spent": 30
    },
    {
      "question_id": "550e8400-e29b-41d4-a716-446655440011", 
      "selected_answer": 1,
      "time_spent": 25
    }
  ],
  "total_time_spent": 180
}
```

**Response** (200 OK):
```json
{
  "quiz_id": "550e8400-e29b-41d4-a716-446655440020",
  "score": 85,
  "total_questions": 10,
  "correct_answers": 8,
  "completion_time": 180,
  "results": [
    {
      "question_id": "550e8400-e29b-41d4-a716-446655440010",
      "is_correct": true,
      "explanation": "Correct! 'किताब' is a noun meaning 'book'"
    }
  ],
  "rewards": {
    "points_earned": 85,
    "coins_earned": 15,
    "achievements_unlocked": ["Grammar Master"]
  }
}
```

## User Progress Endpoints

### 6. Get User Game State
**Endpoint**: `GET /api/v1/me/game-state/`  
**Purpose**: Retrieve user's complete progress including village, achievements, and statistics  
**Authentication**: JWT Bearer Token

**Response** (200 OK):
```json
{
  "user_profile": {
    "level": 12,
    "experience_points": 2580,
    "coins": 450,
    "streak_days": 7,
    "total_lessons_completed": 25
  },
  "village": {
    "buildings": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440030",
        "type": "library",
        "level": 3,
        "position": {"x": 100, "y": 150},
        "last_upgraded": "2026-01-15T10:30:00Z"
      }
    ],
    "resources": {
      "knowledge_stones": 125,
      "wisdom_crystals": 40
    }
  },
  "achievements": [
    {
      "id": "first_lesson",
      "name": "First Steps",
      "description": "Complete your first lesson",
      "earned_date": "2026-01-10T15:45:00Z"
    }
  ],
  "statistics": {
    "accuracy_rate": 87.5,
    "average_lesson_time": 12.5,
    "favorite_category": "verb_conjugation"
  }
}
```

## Gamification Endpoints

### 7. Add Building to Village
**Endpoint**: `POST /api/v1/village/buildings/add/`  
**Purpose**: Purchase and place a new building in user's virtual village  
**Authentication**: JWT Bearer Token

**Request Body**:
```json
{
  "building_type": "temple",
  "position": {
    "x": 200,
    "y": 300
  }
}
```

**Response** (201 Created):
```json
{
  "building_id": "550e8400-e29b-41d4-a716-446655440040",
  "building_type": "temple",
  "level": 1,
  "position": {"x": 200, "y": 300},
  "cost": {
    "coins": 100,
    "knowledge_stones": 25
  },
  "remaining_resources": {
    "coins": 350,
    "knowledge_stones": 100
  },
  "benefits": {
    "daily_bonus_multiplier": 1.1,
    "unlocked_lessons": ["advanced_prayers"]
  }
}
```

**Error Response** (400 Bad Request):
```json
{
  "error": "insufficient_resources",
  "message": "Not enough coins to purchase this building",
  "required": {"coins": 100},
  "available": {"coins": 50}
}
```

## System Monitoring

### 8. Health Check
**Endpoint**: `GET /api/health/`  
**Purpose**: System health verification for monitoring and load balancers  
**Authentication**: None required

**Response** (200 OK):
```json
{
  "status": "healthy",
  "timestamp": "2026-01-18T14:30:00Z",
  "services": {
    "database": {
      "status": "connected",
      "response_time_ms": 5
    },
    "redis": {
      "status": "connected",
      "response_time_ms": 2
    }
  },
  "version": "1.0.0",
  "uptime_seconds": 86400
}
```

## Error Handling

All endpoints follow consistent error response format:

**Authentication Error** (401 Unauthorized):
```json
{
  "error": "authentication_required",
  "message": "Valid JWT token required",
  "code": 401
}
```

**Validation Error** (400 Bad Request):
```json
{
  "error": "validation_error",
  "message": "Request validation failed",
  "details": {
    "username": ["This field is required"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

**Resource Not Found** (404 Not Found):
```json
{
  "error": "resource_not_found", 
  "message": "Lesson with specified ID does not exist",
  "resource_type": "lesson",
  "resource_id": "550e8400-e29b-41d4-a716-446655440099"
}
```

## Rate Limiting

API endpoints are rate-limited to ensure fair usage and system stability:

- **Authentication endpoints**: 5 requests per minute per IP
- **Content endpoints**: 100 requests per minute per user
- **Game state updates**: 30 requests per minute per user
- **Health check**: No limit

Rate limit headers included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642521600
```

## Pagination

List endpoints use cursor-based pagination:

**Request**: `GET /api/v1/lessons/?page=2&page_size=20`

**Response**:
```json
{
  "count": 150,
  "next": "http://localhost:8000/api/v1/lessons/?page=3",
  "previous": "http://localhost:8000/api/v1/lessons/?page=1",
  "results": [...]
}
```

## API Versioning

The API uses URL-based versioning with the current version being `v1`. Future versions will be introduced as `v2`, `v3`, etc., with backward compatibility maintained for previous versions during transition periods.

**Current Version**: `v1`  
**Deprecation Policy**: 6-month notice for breaking changes  
**Support Window**: Previous version supported for 12 months after new version release