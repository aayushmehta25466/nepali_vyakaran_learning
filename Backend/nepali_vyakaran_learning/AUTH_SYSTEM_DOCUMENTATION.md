# Custom Authentication System Documentation

## Overview

This document explains how the custom authentication system works in the Nepali Vyakaran Learning platform. The system is built on **Django REST Framework (DRF)**, **SimpleJWT**, **dj-rest-auth**, and **django-allauth**, with custom OTP-based email verification designed specifically for React SPA integration.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Components](#core-components)
3. [Authentication Flows](#authentication-flows)
4. [API Endpoints](#api-endpoints)
5. [Frontend Integration](#frontend-integration)
6. [Security Considerations](#security-considerations)
7. [Database Models](#database-models)

---

## Architecture Overview

### Technology Stack

| Component | Purpose | Library |
|-----------|---------|---------|
| **User Management** | Create users, validate credentials | Django Auth + dj-rest-auth |
| **Token Generation** | Issue JWT access/refresh tokens | djangorestframework-simplejwt |
| **OTP System** | Generate 6-digit codes for verification | Custom implementation |
| **Email Service** | Send beautiful verification emails | Django Mail + Custom templates |
| **REST API** | Expose auth flows as JSON endpoints | Django REST Framework |
| **SPA Routing** | Handle redirects without server pages | React Router (frontend) |

### Why Custom OTP Over Built-in allauth?

The default django-allauth email verification uses **token URLs** and **server-rendered pages**:

```
❌ allauth default: /accounts/confirm-email/<long-token-key>/
```

For a React SPA, this doesn't work because:
- No Django templates to render
- Long tokens are not mobile-friendly
- Can't easily redirect to React app after verification
- Breaks the API-first design

Our custom OTP system:

```
✅ Custom OTP: 6-digit code + frontend link
   localhost:3000/verify-email?email=user@example.com&otp=123456
```

Benefits:
- Mobile-friendly (easy to type)
- API-native (JSON request/response)
- Auto-verify via URL OR manual entry
- Consistent with password reset flow
- Works 100% with React SPA

---

## Core Components

### 1. Backend Views (`accounts/views.py`)

#### **CustomTokenObtainPairView**
```python
Endpoint: POST /api/v1/auth/login/
Request:  { email, password }
Response: { access, refresh, user, gameState }
Purpose:  Authenticate user and return JWT tokens
```
- Validates email/password via Django auth
- Generates JWT tokens using SimpleJWT
- Includes user profile and game state in response
- Logs login activity

#### **CustomTokenRefreshView**
```python
Endpoint: POST /api/v1/auth/refresh-token/
Request:  { refresh }
Response: { access }
Purpose:  Get new access token when it expires
```
- Validates refresh token
- Issues new short-lived access token
- Refresh token remains unchanged

#### **LogoutView**
```python
Endpoint: POST /api/v1/auth/logout/
Request:  { refresh }
Response: { success: true, message }
Purpose:  Logout user and blacklist token
```
- Blacklists refresh token (if enabled)
- Clears session
- Logs logout activity

#### **SendOTPView**
```python
Endpoint: POST /api/v1/auth/send-otp/
Request:  { email, purpose }
Response: { success: true, data: { expires_in: 180 } }
Purpose:  Send OTP code to user's email
```
- Validates user exists
- Generates 6-digit OTP
- Stores in `OTPVerification` model with 3-minute expiry
- Sends beautiful email with verification link
- Purpose: 'verification', 'password_reset', 'login'

#### **VerifyOTPView**
```python
Endpoint: POST /api/v1/auth/verify-otp/
Request:  { email, otp_code, purpose }
Response: { success: true, message }
Purpose:  Verify OTP and confirm action
```
- Finds unused OTP record
- Checks expiry (3 minutes)
- Marks OTP as used
- If purpose='verification': sets `user.is_email_verified=True`
- If purpose='password_reset': generates temporary password reset token

#### **ForgotPasswordView**
```python
Endpoint: POST /api/v1/auth/forgot-password/
Request:  { email }
Response: { success: true, message }
Purpose:  Send password reset OTP
```
- Wrapper around `SendOTPView` with purpose='password_reset'
- User then calls `ResetPasswordView` with OTP

#### **ResetPasswordView**
```python
Endpoint: POST /api/v1/auth/reset-password/
Request:  { email, otp_code, new_password }
Response: { success: true, message }
Purpose:  Reset password using OTP
```
- Verifies OTP
- Updates user password
- Password is hashed using Django's password hashing

### 2. Serializers (`accounts/serializers.py`)

#### **CustomRegisterSerializer**
- Inherits from `dj_rest_auth.registration.serializers.RegisterSerializer`
- Validates username uniqueness and email uniqueness
- Checks password match and strength
- On save:
  - Creates user via allauth
  - Creates `GameState` and `UserSettings` records
  - Generates OTP
  - Sends verification email

#### **OTPRequestSerializer**
```python
Fields: email (required), purpose (optional, default='verification')
Validates: User exists, email is valid
```

#### **OTPVerifySerializer**
```python
Fields: email (required), otp_code (required), purpose (optional)
Validates: User exists, OTP length=6, valid characters
```

### 3. Models (`accounts/models.py`)

#### **OTPVerification**
```python
Fields:
  - user (ForeignKey)
  - otp_code (CharField, 6 digits)
  - purpose (CharField: 'verification', 'password_reset', 'login')
  - created_at (DateTimeField)
  - is_used (BooleanField)

Methods:
  - create_otp(user, purpose) → Creates and returns OTP
  - is_valid → Checks if not expired (3 minutes)
```

#### **GameState**
- Created automatically when user registers
- Tracks coins, points, unlocked zones, lessons completed
- Associated with every authenticated request

#### **UserSettings**
- Created automatically when user registers
- Stores language, theme, notification preferences
- Associated with every authenticated request

#### **User** (Django built-in)
```python
Custom fields:
  - is_email_verified (BooleanField, default=False)
  - avatar (ImageField, optional)
  - bio (TextField, optional)
```

### 4. Email Templates (`accounts/utils.py`)

#### **get_email_base_template()**
- Returns professional HTML template with:
  - Gradient header with icon
  - Centered content card
  - Responsive design for mobile
  - Footer with branding

#### **send_otp_email(user, otp_code, purpose)**
- Sends purpose-specific emails:
  - **verification**: "Email Verification" - includes verify button
  - **password_reset**: "Password Reset" - includes reset button
  - **login**: "Login Verification" - includes login button
- Email contains:
  - OTP code in large, easy-to-read format
  - Expiry countdown (3 minutes)
  - Action button linking to frontend
  - Security warning

#### **send_welcome_email(user)**
- Sent after successful email verification
- Includes:
  - Welcome message
  - Getting started guide
  - Links to lessons, games, achievements
  - Call-to-action buttons

---

## Authentication Flows

### Flow 1: User Registration

```
┌─────────────────────────────────────────────────────────────┐
│                     REGISTRATION FLOW                       │
└─────────────────────────────────────────────────────────────┘

1. User fills Register form (username, email, password, names)
   │
   ├─→ Frontend validates locally
   │
2. POST /api/v1/auth/register/
   │
   ├─→ Backend: CustomRegisterSerializer
   │   ├─ Validate username unique
   │   ├─ Validate email unique
   │   ├─ Validate passwords match & strength
   │   ├─ Create User via dj_rest_auth
   │   ├─ Create GameState & UserSettings
   │   ├─ Generate OTP code (6 digits)
   │   └─ Send verification email
   │
3. Response: { access, refresh, user }
   │
   ├─→ Frontend: api.js registerUser()
   │   ├─ Extract access/refresh tokens
   │   ├─ Store in localStorage
   │   ├─ Normalize response structure
   │   └─ Return { access_token, refresh_token, user }
   │
4. Frontend: AuthContext.register()
   │
   ├─→ Update user state globally
   │   └─ User is logged in
   │
5. Frontend: Register.js
   │
   └─→ Redirect to /verify-email with email in state
       └─ Prompt user to verify email
```

### Flow 2: Email Verification

```
┌─────────────────────────────────────────────────────────────┐
│                  EMAIL VERIFICATION FLOW                    │
└─────────────────────────────────────────────────────────────┘

1. User receives email with:
   ├─ OTP code: 123456
   └─ Button: "Verify Email" linking to:
      localhost:3000/verify-email?email=user@example.com&otp=123456

2. Option A: Click button (auto-verify)
   │
   ├─→ Frontend: VerifyEmail.js
   │   ├─ Parse URL params (email, otp)
   │   ├─ Auto-fill OTP input
   │   └─ Auto-submit verification
   │
3. Option B: Manual entry
   │
   ├─→ Frontend: VerifyEmail.js
   │   ├─ User manually enters 6 digits
   │   └─ Click "Verify Email" button
   │
4. POST /api/v1/auth/verify-otp/
   │   Request: { email, otp_code: "123456", purpose: "verification" }
   │
   ├─→ Backend: VerifyOTPView
   │   ├─ Find OTP record for user/purpose
   │   ├─ Check if is_used = False
   │   ├─ Check if not expired (< 3 minutes)
   │   ├─ If valid:
   │   │  ├─ Set otp.is_used = True
   │   │  ├─ Set user.is_email_verified = True
   │   │  └─ Save to database
   │   └─ Return { success: true }
   │
5. Frontend: VerifyEmail.js
   │
   ├─→ Show success animation
   ├─→ Display "Email verified!" message
   └─→ Redirect to /login after 3 seconds

6. Resend OTP (if needed)
   │
   ├─→ POST /api/v1/auth/send-otp/
   │   Request: { email, purpose: "verification" }
   │
   └─→ Generate new OTP, send email
       (cooldown: 60 seconds between resends)
```

### Flow 3: User Login

```
┌─────────────────────────────────────────────────────────────┐
│                       LOGIN FLOW                            │
└─────────────────────────────────────────────────────────────┘

1. User enters email & password in Login form
   │
   ├─→ Frontend validates locally
   │
2. POST /api/v1/auth/login/
   │   Request: { email, password }
   │
   ├─→ Backend: CustomTokenObtainPairView
   │   ├─ Use dj-rest-auth + SimpleJWT
   │   ├─ Validate email/password via Django auth
   │   ├─ If invalid: return 401 Unauthorized
   │   ├─ If valid:
   │   │  ├─ Generate JWT access token (5 min expiry)
   │   │  ├─ Generate JWT refresh token (24 hour expiry)
   │   │  ├─ Fetch user data
   │   │  ├─ Fetch game state
   │   │  └─ Log activity
   │   │
   │   └─ Response: { access, refresh, user, gameState }
   │
3. Frontend: api.js loginUser()
   │
   ├─→ Extract tokens
   ├─→ Store in localStorage
   │   - localStorage.setItem('access_token', <token>)
   │   - localStorage.setItem('refresh_token', <token>)
   ├─→ Return normalized response
   │
4. Frontend: AuthContext.login()
   │
   ├─→ Update user state globally
   │   └─ isAuthenticated = true
   │
5. Frontend: Router
   │
   ├─→ Redirect to home or dashboard
   └─→ ProtectedRoute allows access
```

### Flow 4: Automatic Token Refresh

```
┌─────────────────────────────────────────────────────────────┐
│                  TOKEN REFRESH FLOW                         │
└─────────────────────────────────────────────────────────────┘

1. Frontend makes API request
   │
   ├─→ apiClient.js adds header:
   │   Authorization: Bearer <access_token>
   │
2. Backend receives request
   │
   ├─→ Check token in Authorization header
   │
3. If token expired (> 5 minutes old)
   │
   ├─→ Return 401 Unauthorized
   │
4. Frontend: apiClient.js interceptor
   │
   ├─→ Detect 401 response
   ├─→ POST /api/v1/auth/refresh-token/
   │   Request: { refresh: <refresh_token> }
   │
   ├─→ Backend: CustomTokenRefreshView
   │   ├─ Validate refresh token signature
   │   ├─ Check if blacklisted (if enabled)
   │   ├─ Generate new access token
   │   └─ Return { access: <new_token> }
   │
   ├─→ Frontend stores new access token
   │   localStorage.setItem('access_token', <new_token>)
   │
   └─→ Retry original request with new token
       └─ Request succeeds (user never sees interruption)
```

### Flow 5: Password Reset

```
┌─────────────────────────────────────────────────────────────┐
│                   PASSWORD RESET FLOW                       │
└─────────────────────────────────────────────────────────────┘

1. User on ForgotPassword.js enters email
   │
   ├─→ POST /api/v1/auth/send-otp/
   │   Request: { email, purpose: "password_reset" }
   │
2. Backend: SendOTPView
   │
   ├─→ Find user by email
   ├─→ Generate OTP
   ├─→ Send email with:
   │   ├─ OTP code
   │   └─ Link: localhost:3000/reset-password?email=...&otp=...
   │
3. User receives email, clicks link (or navigates to ResetPassword.js)
   │
   ├─→ Frontend: ResetPassword.js
   │   ├─ Show 6 digit input fields
   │   ├─ User enters OTP
   │   └─ User enters new password
   │
4. POST /api/v1/auth/reset-password/
   │   Request: { email, otp_code, new_password }
   │
5. Backend: ResetPasswordView
   │
   ├─→ Verify OTP (same as verify-otp flow)
   ├─→ Update user.password with hashed new_password
   ├─→ Mark OTP as used
   └─→ Return { success: true }
   │
6. Frontend: ResetPassword.js
   │
   ├─→ Show success message
   └─→ Redirect to /login
```

### Flow 6: Logout

```
┌─────────────────────────────────────────────────────────────┐
│                       LOGOUT FLOW                           │
└─────────────────────────────────────────────────────────────┘

1. User clicks logout in Header
   │
   ├─→ Frontend: Header.js
   │   └─ Calls logout() from AuthContext
   │
2. Frontend: AuthContext.logout()
   │
   ├─→ POST /api/v1/auth/logout/
   │   Request: { refresh: <refresh_token> }
   │
3. Backend: LogoutView
   │
   ├─→ If token blacklist enabled:
   │   └─ Add refresh_token to blacklist
   │
   ├─→ Log activity
   └─→ Return { success: true }
   │
4. Frontend: AuthContext.logout()
   │
   ├─→ Set user = null
   ├─→ Remove tokens from localStorage
   │   - localStorage.removeItem('access_token')
   │   - localStorage.removeItem('refresh_token')
   │
5. Frontend: Router
   │
   └─→ Redirect to /login
       └─ isAuthenticated = false
           └─ ProtectedRoute blocks access
```

---

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Request | Response | Auth | Purpose |
|--------|----------|---------|----------|------|---------|
| POST | `/api/v1/auth/register/` | username, email, password1, password2, first_name, last_name | access, refresh, user | No | Create account |
| POST | `/api/v1/auth/login/` | email, password | access, refresh, user, gameState | No | Login |
| POST | `/api/v1/auth/logout/` | refresh | success, message | Yes | Logout |
| POST | `/api/v1/auth/refresh-token/` | refresh | access | No | Get new access token |
| POST | `/api/v1/auth/send-otp/` | email, purpose | success, expires_in | No | Send OTP email |
| POST | `/api/v1/auth/verify-otp/` | email, otp_code, purpose | success, message | No | Verify OTP |
| POST | `/api/v1/auth/forgot-password/` | email | success, message | No | Request password reset |
| POST | `/api/v1/auth/reset-password/` | email, otp_code, new_password | success, message | No | Reset password |

### User Profile Endpoints

| Method | Endpoint | Request | Response | Auth | Purpose |
|--------|----------|---------|----------|------|---------|
| GET | `/api/v1/users/me/` | — | user object | Yes | Get current user profile |
| PUT | `/api/v1/users/me/` | first_name, last_name, avatar, bio | user object | Yes | Update profile |
| DELETE | `/api/v1/users/me/` | — | success, message | Yes | Delete account |
| GET | `/api/v1/users/me/game-state/` | — | game state object | Yes | Get game progress |
| POST | `/api/v1/auth/change-password/` | old_password, new_password | success, message | Yes | Change password |

---

## Frontend Integration

### 1. API Client (`src/services/api.js`)

**Purpose:** Central location for all API calls

**Key Functions:**

```javascript
// Registration
registerUser(userData)
  - Input: { username, email, password, first_name, last_name }
  - Output: { access_token, refresh_token, user }
  - Stores tokens in localStorage

// Login
loginUser(credentials)
  - Input: { email, password }
  - Output: { access_token, refresh_token, user, gameState }
  - Stores tokens in localStorage

// Logout
logoutUser()
  - Sends refresh token to backend
  - Blacklists token
  - Removes tokens from localStorage

// Current User
getCurrentUser()
  - Fetches authenticated user profile
  - Called on app load to restore session

// OTP
sendOTP(email, purpose)
  - Input: email, purpose ('verification', 'password_reset')
  - Sends OTP email

verifyOTP(email, otp, purpose)
  - Input: email, otp_code, purpose
  - Marks email as verified / password as reset
```

### 2. Auth Context (`src/contexts/AuthContext.js`)

**Purpose:** Global auth state management

**Provides:**
```javascript
{
  user,              // Current user object or null
  isAuthenticated,   // boolean
  loading,           // Is auth check in progress?
  login(credentials),       // Function
  logout(),                 // Function
  register(userData)        // Function
}
```

**Usage in Components:**
```javascript
const { user, isAuthenticated, login } = useAuth();
```

### 3. Protected Routes (`src/components/Auth/ProtectedRoute.js`)

**Purpose:** Restrict access to authenticated pages

```javascript
<Route path="/lessons">
  <ProtectedRoute>
    <Lessons />
  </ProtectedRoute>
</Route>
```

If user not authenticated → redirects to `/login`

### 4. API Client with Interceptors (`src/services/apiClient.js`)

**Purpose:** Automatically add tokens to requests and handle refresh

```javascript
// Every request:
- Check if access_token in localStorage
- Add to Authorization header
- If response is 401 (expired):
  - Call refresh-token endpoint
  - Update localStorage
  - Retry original request
```

### 5. Frontend Pages

#### **Login.js**
- Email/password form
- Forgot password link
- Error messages from backend
- Redirect to home on success

#### **Register.js**
- Username, email, names, password form
- Client-side validation
- Backend error handling
- Redirect to /verify-email on success

#### **VerifyEmail.js**
- 6-digit OTP input (auto-advance)
- Auto-verify if URL has ?email=...&otp=...
- Resend OTP with 60s cooldown
- Success animation
- Redirect to /login

#### **ForgotPassword.js**
- Email input
- Shows "Check your email" message
- Countdown timer
- Link to login

#### **ResetPassword.js**
- 6-digit OTP input
- New password field
- Confirm password field
- Submit to reset

---

## Security Considerations

### 1. Password Security

```python
# Django handles password hashing automatically
from django.contrib.auth.hashers import make_password

user.password = make_password(new_password)
# Uses PBKDF2 by default (strong hashing)
```

### 2. JWT Token Security

```python
# settings.py
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=5),    # Short-lived
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),      # Longer-lived
    'ROTATE_REFRESH_TOKENS': True,                    # Rotate on refresh
    'BLACKLIST_AFTER_ROTATION': True,                 # Invalidate old token
}
```

### 3. OTP Security

```python
# 6-digit code: 1 in 1,000,000 chance of guessing
# 3-minute expiry: window for brute force is limited
# is_used flag: can't reuse same code
```

### 4. Email Security

```
✅ No sensitive data in emails
✅ Links use FRONTEND_URL (no backend links)
✅ OTP in email + optional click-link (two factors)
✅ HTTPS recommended for production
```

### 5. Token Storage

```javascript
// localStorage: Accessible to XSS but convenient
// For production, consider:
// - Secure HttpOnly cookies (server sets)
// - localStorage + refresh token rotation
```

### 6. CORS Security

```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Development
    "https://yourdomain.com", # Production
]

CORS_ALLOW_CREDENTIALS = True  # Allow credentials in CORS
```

---

## Database Models

### OTPVerification Model

```python
class OTPVerification(models.Model):
    PURPOSES = [
        ('verification', 'Email Verification'),
        ('password_reset', 'Password Reset'),
        ('login', 'Login Verification'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    otp_code = models.CharField(max_length=10)
    purpose = models.CharField(max_length=20, choices=PURPOSES)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)
    
    @property
    def is_valid(self):
        """Check if OTP is not expired (3 minutes)"""
        return (timezone.now() - self.created_at).seconds < 180
    
    @classmethod
    def create_otp(cls, user, purpose):
        """Create new OTP for user"""
        otp_code = generate_otp()
        return cls.objects.create(
            user=user,
            otp_code=otp_code,
            purpose=purpose
        )
```

### User Model (Extended)

```python
class User(AbstractUser):
    is_email_verified = models.BooleanField(default=False)
    avatar = models.ImageField(upload_to='avatars/', null=True)
    bio = models.TextField(blank=True)
    
    # Auto-created on registration
    gamestate  # OneToOne to GameState
    usersettings  # OneToOne to UserSettings
```

### GameState Model

```python
class GameState(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    coins = models.IntegerField(default=100)
    points = models.IntegerField(default=0)
    level = models.IntegerField(default=1)
    unlocked_zones = models.ManyToManyField(Zone)
    lessons_completed = models.ManyToManyField(Lesson)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

---

## Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Backend Auth** | dj-rest-auth + SimpleJWT | User creation, JWT tokens |
| **Email Verification** | Custom OTP system | Mobile-friendly, SPA-native |
| **Password Reset** | Custom OTP system | Consistent with verification |
| **Token Management** | SimpleJWT + localStorage | Secure, stateless |
| **Frontend State** | React Context + localStorage | Global auth state |
| **API Calls** | Axios + interceptors | Auto token injection/refresh |
| **Protected Routes** | React Router guards | Prevent unauthorized access |

This architecture provides a **secure, mobile-friendly, SPA-native authentication system** that works seamlessly between the Django backend and React frontend without any server-side page rendering.
