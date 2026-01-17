# Phase 3 Integration Guide - Nepali Learning Platform

**Status**: 🟢 Phase 3 Integration Started  
**Date**: January 16, 2026  
**Frontend**: http://localhost:3000 ✅  
**Backend**: http://localhost:8000 ✅

---

## ✅ Completed Integrations

### 1. Profile Page - LIVE
**File**: `src/pages/Profile/Profile.js`  
**Integration**: Real user stats from `/api/users/me/game-state/`  
**Features**:
- Fetches level, points, coins, streak from backend
- Displays badges and achievements (when earned)
- Falls back to localStorage if backend unavailable
- Shows all user statistics in attractive stat cards

**Example Response**:
```json
{
  "level": 5,
  "points": 2500,
  "coins": 750,
  "currentStreak": 12,
  "completedLessons": ["lesson-1", "lesson-2"],
  "badges": [],
  "achievements": []
}
```

---

## 🔄 In Progress Integrations

### 2. Lessons Page Integration
**File**: `src/pages/Lessons/Lessons.js`  
**API Endpoint**: `/api/lessons/`  
**Next Steps**:
1. Fetch lessons from backend on component mount
2. Display lesson content with real Nepali grammar content
3. Track lesson completion via `/api/lessons/{id}/complete/`
4. Award points and coins on completion

**Implementation**:
```javascript
// In Lessons.js useEffect
const fetchLessons = async () => {
  const lessons = await getLessons();
  setLessons(lessons);
};
```

### 3. Village Page Integration
**File**: `src/pages/Village/Village.js`  
**API Endpoints**:
- `GET /api/village/` - Fetch village layout
- `POST /api/village/buildings/add/` - Add building
- `POST /api/village/buildings/{id}/upgrade/` - Upgrade
- `GET /api/village/resources/` - Get resources

**Features to Implement**:
- Real-time building management
- Resource tracking (coins, knowledge points)
- Persistent village state on backend

### 4. Quests System
**File**: `src/pages/Village/Village.js` (Modal)  
**API Endpoints**:
- `GET /api/quests/daily/` - Daily quests
- `POST /api/quests/{id}/start/` - Start quest
- `POST /api/quests/{id}/complete/` - Complete & reward

**Reward Distribution**:
- XP (experience points)
- Coins
- Badges (achievement unlocks)

### 5. Writing System
**File**: `src/pages/Writing/Writing.js`  
**API Endpoints**:
- `GET /api/writing/prompts/` - Get prompts
- `POST /api/writing/submit/` - Submit writing
- `POST /api/writing/save-draft/` - Save draft
- `POST /api/writing/grammar-check/` - Grammar check

**Features**:
- Fetch writing prompts based on level
- Submit completed writings for review
- Save drafts locally and in backend
- Grammar checking with feedback

### 6. Games System
**File**: `src/pages/Games/Games.js` & `GrammarShooter.js`  
**API Endpoints**:
- `GET /api/games/grammar-shooter/questions/` - Get questions
- `POST /api/games/grammar-shooter/validate/` - Validate answer
- `POST /api/games/{id}/end/` - End game session & record score
- `GET /api/games/{id}/leaderboard/` - Get leaderboard

**Features**:
- Fetch dynamic questions from backend
- Validate answers with immediate feedback
- Track high scores on leaderboard
- Adjust difficulty based on performance

---

## 📊 Data Flow Architecture

```
Frontend (React)
    ↓
AuthContext (Token Management)
    ↓
API Services (src/services/api.js)
    ↓
Backend (Django REST API)
    ↓
Database (SQLite)
    ↓
GameContext (State Management)
    ↓
Components (UI Update)
```

---

## 🔐 Authentication Flow

**1. Login Endpoint**: `POST /api/v1/auth/login/`
```javascript
// Response
{
  "access": "jwt_token",
  "refresh": "refresh_token",
  "user": {
    "id": "user-uuid",
    "username": "learner",
    "email": "user@example.com"
  },
  "gameState": { /* initial game state */ }
}
```

**2. Token Storage**: localStorage
- `access_token` - Used for all API requests
- `refresh_token` - Used to refresh expired tokens

**3. Token Refresh**: `POST /api/v1/auth/token/refresh/`

---

## 📝 Integration Checklist

- [x] Frontend server running (http://localhost:3000)
- [x] Backend server running (http://localhost:8000)
- [x] Profile page fetching real stats
- [ ] Lessons page integrated with backend data
- [ ] Village page storing buildings in backend
- [ ] Quests system awarding real rewards
- [ ] Writing system accepting submissions
- [ ] Games system validating answers
- [ ] GameContext synced with backend
- [ ] End-to-end testing completed

---

## 🚀 Quick Start for Next Integration

**To integrate Lessons**:

1. Open `src/pages/Lessons/Lessons.js`
2. Add `useEffect` to fetch from `/api/lessons/`
3. Map backend data to lesson cards
4. Connect lesson completion to `/api/lessons/{id}/complete/`
5. Update GameContext with returned points/coins
6. Test: Click lesson → Open modal → Complete → Check points updated

**API Response Format**:
```json
[
  {
    "id": "lesson-uuid",
    "title": "नाम (Noun)",
    "description": "Learn about nouns in Nepali",
    "category": "grammar",
    "level": 1,
    "content": "Lesson content here",
    "exercises": [
      {
        "question": "यो के हो?",
        "options": ["..."],
        "correctAnswer": 0
      }
    ],
    "points": 50
  }
]
```

---

## 🐛 Common Issues & Solutions

**Issue**: API returns 401 Unauthorized
- **Solution**: Check token in localStorage, ensure login first

**Issue**: CORS errors
- **Solution**: Backend already has CORS enabled, check .env

**Issue**: Data not persisting after reload
- **Solution**: Ensure GameContext saved to localStorage after API response

---

## 📞 Backend API Documentation

Full API endpoints available in:
`Backend/nepali_vyakaran_learning/BACKEND_API_REQUIREMENTS.txt`

Quick reference:
- **Base URL**: `http://localhost:8000/api/v1`
- **Auth**: All endpoints require `Authorization: Bearer {token}`
- **Errors**: Standard HTTP status codes + JSON error messages

---

## Next Priority

**Focus Area**: Lessons Integration (Most Visible Impact)

1. Update Lessons.js to fetch from backend
2. Display real lesson content
3. Track lesson completion and rewards
4. Test end-to-end flow

This will establish the pattern for integrating remaining features.

