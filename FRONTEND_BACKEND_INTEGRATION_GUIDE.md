# Frontend-Backend Integration Guide
## Nepali Vyakaran Learning Platform

**Date:** January 14-15, 2026  
**Project:** Integrating React Frontend with Django Backend

---

## 📚 Learning Journey: From Zero to Integrated App

### Overview
This document captures the complete journey of integrating a React frontend with a Django backend, including authentication, API setup, and protected routes. This guide is written for developers new to React and API integration.

---


What's next for Phase 3
You can use this as a reference for learning or for continuing the project! 📚

Claude Haiku 4.5 • 0.3x## Phase 1: API Client Setup ✅

### What We Built

#### 1. Installed Axios
```bash
cd Frontend/-_-
npm install axios
```

**Why Axios?**
- Cleaner syntax than native fetch
- Automatic token management with interceptors
- Better error handling
- Request/response interceptors for global logic

#### 2. Created API Client (`src/services/apiClient.js`)

**Key Concepts Learned:**

**A. Axios Instance**
```javascript
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});
```
- `baseURL`: All API calls start with this URL
- `headers`: Tell backend we're sending JSON
- `timeout`: Cancel requests after 10 seconds

**B. Request Interceptor (Before sending request)**
```javascript
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```
- Gets JWT token from localStorage
- Automatically adds it to every request
- No need to manually add token to each API call

**C. Response Interceptor (After receiving response)**
```javascript
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Token expired - try to refresh
      const refreshToken = localStorage.getItem('refresh_token');
      const response = await axios.post('/auth/token/refresh/', { refresh: refreshToken });
      localStorage.setItem('access_token', response.data.access);
      // Retry original request with new token
      return apiClient(originalRequest);
    }
    return Promise.reject(error);
  }
);
```
- Handles token expiration automatically
- Refreshes token and retries failed request
- If refresh fails, redirects to login

#### 3. Created API Helper Functions (`src/services/api.js`)

**Pattern Used:**
```javascript
export const loginUser = async (credentials) => {
  try {
    const response = await apiClient.post('/auth/login/', credentials);
    const { access_token, refresh_token } = response.data;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};
```

**Functions Created:**
- Authentication: `registerUser`, `loginUser`, `logoutUser`, `getCurrentUser`
- Lessons: `getLessons`, `getLessonById`
- Questions: `getQuestions`, `submitAnswer`
- Games: `saveGameScore`, `getLeaderboard`
- Progress: `getUserProgress`, `getLessonProgress`, `completeLessonProgress`
- Achievements: `getAchievements`, `getUserStats`

#### 4. Environment Configuration (`.env`)
```
REACT_APP_API_URL=http://localhost:8000/api/v1
REACT_APP_ENV=development
REACT_APP_DEBUG=true
```

---

## Phase 2: Authentication Integration ✅

### What We Built

#### 1. Auth Context (`src/contexts/AuthContext.js`)

**What is React Context?**
Context is a way to share data across many components without passing props down manually at every level.

**The Problem Without Context:**
```
App → Header → UserMenu → UserProfile
  ↓ (pass user)  ↓ (pass user)  ↓ (pass user)
```

**The Solution With Context:**
```
<AuthProvider>  ← Store user data here
  <App />
    <Header />     ← Can access user directly
    <UserMenu />   ← Can access user directly
</AuthProvider>
```

**Key Concepts:**

**A. Creating Context**
```javascript
const AuthContext = createContext(null);
```

**B. Provider Component**
```javascript
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = !!user;

  // Check if user is already logged in on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        const userData = await getCurrentUser();
        setUser(userData);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (credentials) => {
    const data = await loginUser(credentials);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  const value = { user, loading, isAuthenticated, login, logout, register };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

**C. Custom Hook**
```javascript
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

**Usage in Components:**
```javascript
const { user, login, logout, isAuthenticated } = useAuth();
```

#### 2. Login Page (`src/pages/Auth/Login.js`)

**Key Concepts:**

**A. Controlled Components**
```javascript
const [formData, setFormData] = useState({
  email: '',
  password: '',
});

<input
  value={formData.email}
  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
/>
```
- React controls the input value (not the DOM)
- When user types → state updates → input re-renders

**B. Form Submission**
```javascript
const handleSubmit = async (e) => {
  e.preventDefault(); // Stop page reload
  setLoading(true);
  try {
    await login(formData);
    navigate('/'); // Redirect to home
  } catch (err) {
    setError('Login failed');
  } finally {
    setLoading(false);
  }
};
```

**C. Error Handling**
```javascript
{error && <ErrorMessage>{error}</ErrorMessage>}
```

#### 3. Register Page (`src/pages/Auth/Register.js`)

**Additional Concepts:**

**A. Client-Side Validation**
```javascript
const validateForm = () => {
  const newErrors = {};
  
  if (!formData.email.trim()) {
    newErrors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    newErrors.email = 'Email is invalid';
  }
  
  if (formData.password.length < 8) {
    newErrors.password = 'Password must be at least 8 characters';
  }
  
  if (formData.password !== formData.confirmPassword) {
    newErrors.confirmPassword = 'Passwords do not match';
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

**B. Backend Error Handling**
```javascript
catch (err) {
  if (err.response?.data) {
    const backendErrors = err.response.data;
    const formattedErrors = {};
    
    Object.keys(backendErrors).forEach(key => {
      if (Array.isArray(backendErrors[key])) {
        formattedErrors[key] = backendErrors[key][0];
      } else {
        formattedErrors[key] = backendErrors[key];
      }
    });
    
    setErrors(formattedErrors);
  }
}
```

#### 4. Protected Route (`src/components/Auth/ProtectedRoute.js`)

**Concept: Route Guards**
```javascript
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    // Save current location to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
```

**Usage:**
```javascript
<Route path="/lessons" element={
  <ProtectedRoute>
    <Lessons />
  </ProtectedRoute>
} />
```

#### 5. Updated App.js

**Integration:**
```javascript
function App() {
  return (
    <Router>
      <AuthProvider>  {/* Wrap entire app */}
        <AppContainer>
          <Header />
          <MainContent>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route path="/lessons" element={
                <ProtectedRoute><Lessons /></ProtectedRoute>
              } />
              {/* More protected routes... */}
            </Routes>
          </MainContent>
        </AppContainer>
      </AuthProvider>
    </Router>
  );
}
```

#### 6. Updated Header (`src/components/Header/Header.js`)

**Conditional Rendering:**
```javascript
const { isAuthenticated, user, logout } = useAuth();

{isAuthenticated ? (
  <>
    <StatItem><Trophy /> Level {gameState.level}</StatItem>
    <StatItem><Star /> {gameState.points}</StatItem>
    <StatItem><Coins /> {gameState.coins}</StatItem>
    <LogoutButton onClick={logout}>
      <LogOut /> {user?.username}
    </LogoutButton>
  </>
) : (
  <Link to="/login">
    <LoginButton><LogIn /> Login</LoginButton>
  </Link>
)}
```

---

## Key React Concepts Summary

### 1. State Management
```javascript
const [state, setState] = useState(initialValue);
```
- Stores data that can change
- When state changes, component re-renders

### 2. useEffect Hook
```javascript
useEffect(() => {
  // Run on component mount
  return () => {
    // Cleanup on unmount
  };
}, []); // Dependencies array
```
- Runs side effects (API calls, subscriptions)
- `[]` = run once on mount
- `[value]` = run when value changes

### 3. Context Pattern
```javascript
// 1. Create
const MyContext = createContext();

// 2. Provide
<MyContext.Provider value={data}>
  <App />
</MyContext.Provider>

// 3. Consume
const data = useContext(MyContext);
```

### 4. React Router
```javascript
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/home'); // Programmatic navigation

<Link to="/about">About</Link> // Declarative navigation
```

### 5. Async/Await Pattern
```javascript
const fetchData = async () => {
  try {
    const response = await apiClient.get('/endpoint');
    setData(response.data);
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
```

---

## File Structure Created

```
Frontend/-_-/
├── src/
│   ├── services/
│   │   ├── apiClient.js         ← Axios configuration & interceptors
│   │   └── api.js                ← API helper functions
│   ├── contexts/
│   │   └── AuthContext.js        ← Authentication state management
│   ├── components/
│   │   └── Auth/
│   │       └── ProtectedRoute.js ← Route guard component
│   ├── pages/
│   │   └── Auth/
│   │       ├── Login.js          ← Login page
│   │       └── Register.js       ← Registration page
│   └── App.js                     ← Updated with AuthProvider
└── .env                           ← Environment variables
```

---

## API Endpoints Available

### Authentication
- `POST /api/v1/auth/registration/` - Register new user
- `POST /api/v1/auth/login/` - Login user
- `POST /api/v1/auth/logout/` - Logout user
- `GET /api/v1/auth/user/` - Get current user profile
- `POST /api/v1/auth/token/refresh/` - Refresh JWT token

### Lessons
- `GET /api/v1/lessons/` - Get all lessons
- `GET /api/v1/lessons/{id}/` - Get single lesson

### Questions
- `GET /api/v1/questions/` - Get questions
- `POST /api/v1/questions/{id}/submit/` - Submit answer

### Games
- `POST /api/v1/games/score/` - Save game score
- `GET /api/v1/games/leaderboard/` - Get leaderboard

### Progress
- `GET /api/v1/progress/` - Get user progress
- `GET /api/v1/progress/lessons/{id}/` - Get lesson progress
- `POST /api/v1/progress/lessons/{id}/complete/` - Mark lesson complete

### Achievements
- `GET /api/v1/achievements/` - Get user achievements
- `GET /api/v1/stats/` - Get user statistics

---

## Testing Phase 2

### Prerequisites
1. Django backend running on `http://localhost:8000`
2. React frontend running on `http://localhost:3000`

### Test Cases

#### 1. Registration Flow
**Steps:**
1. Open `http://localhost:3000`
2. Click "Login" button (top right)
3. Click "Create Account" link
4. Fill in form:
   - Username: `testuser`
   - Email: `test@example.com`
   - First Name: `Test`
   - Last Name: `User`
   - Password: `testpass123`
   - Confirm Password: `testpass123`
5. Click "Create Account"

**Expected:**
- ✅ Redirects to home page
- ✅ Username appears in header
- ✅ Navigation shows protected links
- ✅ Token stored in localStorage

#### 2. Protected Routes
**Steps:**
1. While logged in, click "Lessons"
2. Open incognito/private window
3. Go to `http://localhost:3000/lessons`

**Expected:**
- ✅ Logged in: Lessons page loads
- ✅ Not logged in: Redirects to login

#### 3. Logout Flow
**Steps:**
1. Click username/logout button in header
2. Try to access `/lessons`

**Expected:**
- ✅ Username button changes to "Login"
- ✅ Protected links disappear
- ✅ Redirected to login when accessing protected routes
- ✅ Tokens removed from localStorage

#### 4. Login Flow
**Steps:**
1. Click "Login"
2. Enter credentials:
   - Email: `test@example.com`
   - Password: `testpass123`
3. Submit

**Expected:**
- ✅ Redirects to home
- ✅ User data loaded
- ✅ Protected routes accessible

#### 5. Token Refresh
**Steps:**
1. Login
2. Wait for access token to expire (or manually delete it from localStorage)
3. Try to access a protected route

**Expected:**
- ✅ Token automatically refreshed
- ✅ Request retried with new token
- ✅ Page loads successfully

---

## Common Issues & Solutions

### Issue 1: CORS Error
**Symptom:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
Check Django `settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]
```

### Issue 2: 401 Unauthorized
**Symptom:**
```
401 Unauthorized
```

**Solution:**
- Token might be expired → Logout and login again
- Check if token is in localStorage
- Verify backend authentication is working

### Issue 3: Network Error
**Symptom:**
```
Network Error
```

**Solution:**
- Check if Django backend is running on port 8000
- Verify `.env` file has correct `REACT_APP_API_URL`
- Check firewall/antivirus settings

### Issue 4: "Cannot read property 'user' of undefined"
**Symptom:**
```
TypeError: Cannot read property 'user' of undefined
```

**Solution:**
- Make sure component is inside `<AuthProvider>`
- Check that `useAuth()` is called within a component

### Issue 5: react-scripts not found
**Symptom:**
```
'react-scripts' is not recognized
```

**Solution:**
```bash
cd Frontend/-_-
rm -rf node_modules package-lock.json
npm install
```

---

## What's Next: Phase 3

### Planned Features

1. **Lessons Integration**
   - Fetch lessons from backend
   - Display in Lessons page
   - Show questions dynamically
   - Track lesson progress

2. **Games Integration**
   - Load questions for Grammar Shooter
   - Post scores to backend
   - Display leaderboard
   - Award points and badges

3. **Progress Integration**
   - Fetch user progress from API
   - Display stats in Progress page
   - Show achievements
   - Level progression

4. **State Management Enhancement**
   - Add more context providers
   - Cache API responses
   - Optimistic UI updates

---

## Additional Resources

### React Documentation
- [React Official Docs](https://react.dev)
- [React Router](https://reactrouter.com)
- [Context API](https://react.dev/reference/react/useContext)

### Axios Documentation
- [Axios Official Docs](https://axios-http.com)
- [Interceptors Guide](https://axios-http.com/docs/interceptors)

### JWT Authentication
- [JWT.io](https://jwt.io)
- [Django REST Framework JWT](https://www.django-rest-framework.org/api-guide/authentication/#json-web-token-authentication)

---

## Credits

**Project:** Nepali Vyakaran Learning Platform  
**Stack:** React + Django REST Framework  
**Date:** January 2026  
**Status:** Phase 2 Complete ✅

---

## Appendix: Complete Code Examples

### Example: Using API in a Component

```javascript
import React, { useState, useEffect } from 'react';
import { getLessons } from '../services/api';

const LessonsPage = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const data = await getLessons();
        setLessons(data);
      } catch (err) {
        setError('Failed to load lessons');
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {lessons.map(lesson => (
        <div key={lesson.id}>
          <h3>{lesson.title}</h3>
          <p>{lesson.description}</p>
        </div>
      ))}
    </div>
  );
};

export default LessonsPage;
```

### Example: Protected API Call with Auth

```javascript
import { useAuth } from '../contexts/AuthContext';
import { getUserProgress } from '../services/api';

const ProgressPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchProgress = async () => {
        const data = await getUserProgress();
        setProgress(data);
      };
      fetchProgress();
    }
  }, [isAuthenticated]);

  return (
    <div>
      <h1>Welcome, {user?.username}!</h1>
      {progress && (
        <div>
          <p>Level: {progress.level}</p>
          <p>Points: {progress.points}</p>
          <p>Completed Lessons: {progress.completed_lessons}</p>
        </div>
      )}
    </div>
  );
};
```

---

**End of Documentation**
