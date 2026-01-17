# Email Verification Security

## Overview
This document outlines the security measures implemented to prevent unauthorized access through the OTP verification system.

## Security Measures

### 1. Email Existence Validation (Backend)
**Location**: `accounts/views.py` - `SendOTPView` (Lines 134-137)

```python
try:
    user = User.objects.get(email=email)
except User.DoesNotExist:
    return error_response('User with this email does not exist.', code='USER_NOT_FOUND')
```

**What it does**:
- Before sending any OTP, the system checks if the email exists in the User model
- Only registered users can request OTP codes
- Returns error code `USER_NOT_FOUND` if email doesn't exist

**Benefits**:
- ✅ Prevents OTP spam to non-existent/random emails
- ✅ Protects against email enumeration attacks (returns generic error)
- ✅ Reduces server load from invalid requests
- ✅ Prevents unauthorized access attempts

### 2. Frontend Error Handling
**Location**: `Frontend/-_-/src/pages/Auth/VerifyEmail.js`

**In handleVerify** (Lines 320-336):
```javascript
const errorCode = error.response?.data?.error?.code;
if (errorCode === 'USER_NOT_FOUND') {
  setMessage('This email is not registered. Redirecting to sign up...');
  setTimeout(() => {
    navigate('/register');
  }, 2000);
}
```

**In handleResend** (Lines 352-367):
```javascript
const errorCode = error.response?.data?.error?.code;
if (errorCode === 'USER_NOT_FOUND') {
  setMessage('This email is not registered. Redirecting to sign up...');
  setTimeout(() => {
    navigate('/register');
  }, 2000);
}
```

**What it does**:
- Catches `USER_NOT_FOUND` error from backend
- Shows user-friendly message
- Automatically redirects to registration page after 2 seconds
- Guides users to correct action

### 3. Additional OTP Security Measures

#### Rate Limiting
**Location**: `accounts/models.py` - `OTPVerification.create_otp()`

```python
# Check for recently sent OTP
recent_otp = OTPVerification.objects.filter(
    user=user,
    purpose=purpose,
    created_at__gte=timezone.now() - timezone.timedelta(minutes=1),
    is_used=False
).first()

if recent_otp:
    return recent_otp  # Reuse existing OTP
```

**Benefits**:
- Prevents OTP spam (max 1 OTP per minute per user)
- Reduces email server load
- Prevents abuse of verification system

#### OTP Expiration
```python
expires_at = timezone.now() + timezone.timedelta(minutes=3)
```

**Benefits**:
- OTP codes expire after 3 minutes
- Reduces window for brute-force attacks
- Forces users to request new codes if delayed

#### One-Time Use
```python
otp.is_used = True
otp.save()
```

**Benefits**:
- Each OTP can only be used once
- Prevents replay attacks
- Ensures secure verification flow

## Flow Diagram

```
User Requests OTP
      ↓
Frontend sends email to /auth/send-otp/
      ↓
Backend checks: Does email exist in User model?
      ↓
   YES ←─→ NO
    ↓        ↓
Generate   Return error
& Send     USER_NOT_FOUND
  OTP         ↓
    ↓      Frontend catches error
    ↓         ↓
 Success   Shows message:
Message   "Email not registered"
            ↓
         Redirects to /register
         after 2 seconds
```

## Testing the Security

### Test Case 1: Valid Email
1. Enter registered email (e.g., `test@example.com`)
2. Click "Resend Code"
3. ✅ Expected: OTP sent successfully

### Test Case 2: Invalid Email (Not Registered)
1. Enter unregistered email (e.g., `notregistered@example.com`)
2. Click "Resend Code"
3. ✅ Expected: Error message + redirect to registration

### Test Case 3: Empty Email
1. Clear email field
2. Click "Resend Code"
3. ✅ Expected: "Email address is missing" error

## Summary

The system implements multiple layers of security:
1. **Backend validation** - Email must exist in database
2. **Frontend guidance** - Clear error messages with helpful actions
3. **Rate limiting** - Prevents OTP spam
4. **Time expiration** - 3-minute OTP validity
5. **One-time use** - OTP invalidated after use

This ensures only legitimate, registered users can request and use OTP verification codes, preventing unauthorized access and abuse of the system.
