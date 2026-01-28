# JWT Token Flow in Car Portal

## Overview
Your application uses JWT tokens for secure authentication across 5 different flows. All tokens use the same `JWT_SECRET` but with different expiration times.

---

## 1. LOGIN FLOW ✅

```
User Login Page
    ↓
Email & Password submitted
    ↓
Backend: POST /api/auth/login
    ├─ Validate email exists in User collection
    ├─ Compare password with bcrypt hash
    ├─ Check user role matches login type (user/admin)
    └─ ✅ Generate JWT Token
        │
        ├─ Payload: { id: user._id }
        ├─ Secret: JWT_SECRET
        └─ Expiry: 7 days
    ↓
Response: { token, user: { id, name, email, role } }
    ↓
Frontend: localStorage.setItem('token', token)
    ↓
API Interceptor attaches to all requests:
Authorization: Bearer ${token}
    ↓
✅ User logged in & redirected to dashboard
```

### Code Reference
- **Backend**: `authController.js` line 79
- **Frontend**: `Login.jsx` line 20
- **API Interceptor**: `api.js` line 11

---

## 2. FORGOT PASSWORD FLOW 🔄

```
User Forgot Password Page
    ↓
Email submitted
    ↓
Backend: POST /api/auth/forgot-password
    ├─ Check if email exists in User collection
    ├─ If NOT found → Return success message (security)
    ├─ If found → Generate Reset Token
    │   ├─ Payload: { id: user._id, email: user.email }
    │   ├─ Secret: JWT_SECRET
    │   └─ Expiry: 1 hour ⏰ (short-lived for security)
    ├─ Create reset link: /reset-password?token=${resetToken}
    └─ Send email with reset link
    ↓
Response: { message, token, userId }
    ↓
Frontend: sessionStorage.setItem('resetToken', token)
    ↓
Email received by user
    ↓
✅ User clicks reset link → ResetPassword page loads
```

### Code Reference
- **Backend**: `authController.js` line 104
- **Frontend**: `ForgotPassword.jsx` line 25

---

## 3. RESET PASSWORD FLOW 🔐

```
User clicks email reset link
    ↓
ResetPassword page loads with token from URL query param
    ↓
User enters new password & confirms
    ↓
Backend: POST /api/auth/reset-password
    ├─ Extract token from request body
    ├─ Verify token with JWT_SECRET
    │   └─ If expired → Error: "Reset link has expired"
    ├─ If valid → Decode token to get user ID
    ├─ Update user password (bcrypt hash)
    └─ Generate NEW JWT Token (for auto-login)
        ├─ Payload: { id: user._id }
        ├─ Secret: JWT_SECRET
        └─ Expiry: 7 days
    ↓
Response: { message, token, user: { id, name, email, role } }
    ↓
Frontend: localStorage.setItem('token', token)
    ↓
✅ Auto-login & redirect to dashboard
```

### Code Reference
- **Backend**: `authController.js` line 158
- **Frontend**: `ResetPassword.jsx` line 41

---

## 4. REGISTRATION + OTP VERIFICATION FLOW 📧

```
User Registration Page
    ↓
Fill registration form & submit
    ↓
Backend: POST /api/auth/register
    ├─ Validate all fields
    ├─ Check if email in User collection (verified users)
    │   └─ If exists → Reject (already verified)
    ├─ Check if email in PendingUser collection
    │   ├─ If exists & OTP NOT expired → Reject
    │   └─ If exists & OTP expired → Delete old record ✨ NEW FEATURE
    ├─ Hash password with bcrypt
    ├─ Generate 6-digit OTP (100000-999999)
    ├─ Set OTP expiry: 10 minutes
    └─ Create PendingUser record
    ↓
Send OTP via email
    ↓
Response: { message, userId: pendingUser._id }
    ↓
Frontend: Redirect to OTP Verification page

─────────────────────────────────

Verify OTP Page
    ↓
User enters OTP received in email
    ↓
Backend: POST /api/auth/verify-otp
    ├─ Validate userId & OTP from request
    ├─ Find PendingUser by ID
    ├─ Check OTP matches & not expired
    ├─ If valid:
    │   ├─ Create new User record (verified)
    │   ├─ Delete PendingUser record
    │   └─ Generate JWT Token
    │       ├─ Payload: { id: user._id }
    │       ├─ Secret: JWT_SECRET
    │       └─ Expiry: 7 days
    ├─ Return token & user data
    └─ If invalid → Error message
    ↓
Frontend: localStorage.setItem('token', res.data.token)
    ↓
✅ Account verified & user logged in
```

### Code Reference
- **Registration**: `authController.js` line 8-65
- **OTP Verification**: `authController.js` line 195-210
- **Frontend**: `VerifyOtp.jsx` line 32

---

## 5. PROTECTED ROUTES 🛡️

```
User makes API request (e.g., /api/cars)
    ↓
API Interceptor (api.js)
    ├─ Get token from localStorage
    ├─ Attach header: Authorization: Bearer ${token}
    └─ Send request
    ↓
Backend: authMiddleware checks request
    ├─ Extract token from Authorization header
    ├─ Verify token signature with JWT_SECRET
    ├─ Decode token to get user._id
    │   └─ If invalid/expired → 401 Unauthorized
    ├─ Attach user info to req.user
    └─ Allow request to proceed
    ↓
✅ User can access protected resources
```

### Code Reference
- **Middleware**: `authMiddleware.js` line 9
- **API Interceptor**: `api.js` line 11

---

## Token Summary Table

| Flow | Token Type | Secret | Expiry | Payload | Storage |
|------|-----------|--------|--------|---------|---------|
| Login | Auth | JWT_SECRET | 7d | { id } | localStorage |
| Forgot Password | Reset | JWT_SECRET | 1h | { id, email } | sessionStorage |
| Reset Password | Auth | JWT_SECRET | 7d | { id } | localStorage |
| OTP Verification | Auth | JWT_SECRET | 7d | { id } | localStorage |
| Protected Routes | Auth | JWT_SECRET | 7d | { id } | localStorage |

---

## Security Features 🔒

1. **Password Hashing**: bcryptjs (10 salt rounds)
2. **Token Secret**: Environment variable `JWT_SECRET`
3. **Token Expiry**: Automatic expiration after set time
4. **OTP Timeout**: 10-minute window for verification
5. **Email Verification**: OTP required before account activation
6. **Reset Link Expiry**: 1-hour window for password reset
7. **Expired OTP Cleanup**: Old pending users deleted on re-registration ✨

---

## New Feature: Smart Registration Retry ✨

When user abandons OTP verification:
- Old PendingUser record is automatically deleted after OTP expires
- User can register again with same email
- New OTP is generated with fresh 10-minute window
- No need to wait for original OTP to expire manually

```javascript
if (pendingExists) {
  const now = new Date();
  if (pendingExists.otpExpires < now) {
    await PendingUser.deleteOne({ email }); // Clean up
    // Allow re-registration with new OTP
  }
}
```

---

## Common Questions

**Q: Why 1 hour for reset token but 7 days for auth token?**
A: Reset tokens are sensitive and should expire quickly for security. Auth tokens are for active sessions and last longer.

**Q: What happens if token expires?**
A: User redirected to login page. API interceptor catches 401 errors.

**Q: Can tokens be refreshed?**
A: Currently, no refresh token system. Users must login again after 7 days.

**Q: Is the token validated on every request?**
A: Yes, authMiddleware validates before processing protected routes.

**Q: How is the secret stored?**
A: In `.env` file as `JWT_SECRET=your-secret-key`
