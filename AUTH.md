# Authentication & Authorization Guide

## Overview

The seethbotsite API implements **two authentication systems**:

1. **User Authentication** (NEW) - Optional username/password-based authentication with cross-device support
2. **API Key Authentication** - Simple API key-based authentication for admins and integrations

**Both systems are optional** - users can access the site without logging in, and read-only operations (GET endpoints) remain publicly accessible.

## User Authentication (Optional)

### Overview

User authentication allows individuals to create accounts, login across multiple devices, and manage their sessions. This is **completely optional** - users can still use all site features without logging in.

### Features

- ✅ **Password Hashing**: All passwords are securely hashed using bcrypt (10 salt rounds)
- ✅ **Cross-Device Login**: Login from multiple devices and manage sessions
- ✅ **JWT Tokens**: Secure token-based authentication with 30-day expiry
- ✅ **Session Management**: View, manage, and logout from specific devices
- ✅ **Account Management**: Change passwords, update display name, delete account

### Endpoints

#### Register a New User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "displayName": "My Name",
  "deviceName": "My iPhone",
  "deviceType": "mobile"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "display_name": "My Name",
    "created_at": "2026-02-04 11:06:09",
    "updated_at": "2026-02-04 11:06:09"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "deviceName": "My Desktop",
  "deviceType": "desktop"
}
```

**Response:** Same as register (user + token)

#### Get Current User
```bash
GET /api/auth/me
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "display_name": "My Name",
    "created_at": "2026-02-04 11:06:09",
    "updated_at": "2026-02-04 11:06:09"
  },
  "session": {
    "id": 1,
    "device_name": "My Desktop",
    "device_type": "desktop",
    "created_at": "2026-02-04 11:06:09",
    "last_used_at": "2026-02-04 11:07:00"
  }
}
```

#### Get All Sessions (Cross-Device View)
```bash
GET /api/auth/sessions
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "sessions": [
    {
      "id": 3,
      "user_id": 1,
      "device_name": "My iPhone",
      "device_type": "mobile",
      "created_at": "2026-02-04 11:06:19",
      "last_used_at": "2026-02-04 11:07:00"
    },
    {
      "id": 2,
      "user_id": 1,
      "device_name": "My Desktop",
      "device_type": "desktop",
      "created_at": "2026-02-04 11:06:11",
      "last_used_at": "2026-02-04 11:06:50"
    }
  ]
}
```

#### Logout Current Session
```bash
POST /api/auth/logout
Authorization: Bearer <your-jwt-token>
```

#### Logout from Specific Device
```bash
DELETE /api/auth/sessions/:sessionId
Authorization: Bearer <your-jwt-token>
```

#### Logout from All Devices
```bash
DELETE /api/auth/sessions/all
Authorization: Bearer <your-jwt-token>
```

#### Update Profile
```bash
PATCH /api/auth/profile
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "displayName": "New Display Name"
}
```

#### Change Password
```bash
PATCH /api/auth/password
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "oldPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

**Note:** Changing your password will invalidate all sessions - you'll need to login again on all devices.

#### Delete Account
```bash
DELETE /api/auth/account
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "password": "yourpassword123"
}
```

### Security Details

- **Password Hashing**: bcrypt with 10 salt rounds
- **JWT Secret**: Configurable via `SEETHBOT_JWT_SECRET` environment variable
- **Token Expiry**: 30 days (configurable via `SEETHBOT_JWT_EXPIRY`)
- **Session Storage**: SQLite database with automatic cleanup of expired sessions

---

## API Key Authentication

### Getting an API Key

When the server starts, it generates a default admin API key for development purposes. Check the server logs to find your API key:

```
[Auth] Default admin key: sk_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**⚠️ IMPORTANT:** In production, set your own API keys using the `SEETHBOT_API_KEYS` environment variable:

```bash
export SEETHBOT_API_KEYS=your-secret-key-1,your-secret-key-2
```

### Using API Keys

You can authenticate requests in two ways:

#### Option 1: X-API-Key Header (Recommended)

```bash
curl -X POST https://your-api.com/api/movies \
  -H "X-API-Key: sk_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" \
  -H "Content-Type: application/json" \
  -d '{"title":"The Matrix","suggestedBy":"Cam"}'
```

#### Option 2: Authorization Bearer Header

```bash
curl -X POST https://your-api.com/api/movies \
  -H "Authorization: Bearer sk_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" \
  -H "Content-Type: application/json" \
  -d '{"title":"The Matrix","suggestedBy":"Cam"}'
```

## Protected Endpoints

The following endpoints **require API key authentication**:

### Movie Management
- `POST /api/movies` - Add a new movie
- `DELETE /api/movies/:id` - Delete a movie
- `POST /api/movies/voting-round/start` - Start a voting round
- `POST /api/movies/voting-round/end` - End a voting round
- `POST /api/movies/voting-round/reset` - Reset voting
- `POST /api/movies/vote` - Submit a vote

### Stock Market
- `POST /api/stocks/buy` - Buy shares
- `POST /api/stocks/sell` - Sell shares

### Click Counter
- `POST /api/clicks/increment` - Increment click count
- `POST /api/clicks/reset` - Reset click count

## Public Endpoints (No Authentication Required)

The following endpoints are **publicly accessible**:

### General
- `GET /api/health` - Health check
- `GET /api/rankings` - Get rankings

### Movies
- `GET /api/movies` - List all movies
- `GET /api/movies/voting-round` - Get current voting round
- `GET /api/movies/votes` - Get all votes
- `GET /api/movies/vote/:userId` - Get a user's vote

### Stock Market
- `GET /api/stocks` - List all stocks
- `GET /api/stocks/:name` - Get stock details
- `GET /api/portfolio/:userId` - Get user portfolio

### Other
- `GET /api/quote` - Get a random Northernlion quote
- `POST /api/gender` - Gender detection (has input validation, no auth)

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Authentication required",
  "message": "Please provide an API key via X-API-Key or Authorization: Bearer header"
}
```

### 403 Forbidden (Invalid API Key)
```json
{
  "error": "Invalid API key",
  "message": "The provided API key is not valid"
}
```

### 403 Forbidden (Insufficient Permissions)
```json
{
  "error": "Insufficient permissions",
  "message": "This endpoint requires read_write permissions"
}
```

### 429 Too Many Requests
```json
{
  "error": "Too many requests",
  "retryAfter": 45,
  "message": "Rate limit exceeded. Try again in 45 seconds."
}
```

## Rate Limiting

All API requests are rate limited to **100 requests per minute** per IP address.

Rate limit headers are included in all responses:
- `X-RateLimit-Limit`: Maximum requests allowed (100)
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Unix timestamp when the window resets
- `Retry-After`: Seconds to wait before retrying (only on 429 errors)

## Input Validation & Sanitization

All endpoints include input validation and sanitization:

- **String sanitization**: HTML tags are stripped, special characters are escaped
- **Length limits**: Fields have maximum length constraints (e.g., titles: 200 chars, names: 100 chars)
- **Type validation**: Numbers, arrays, and other types are validated
- **Character validation**: Fields must match allowed character patterns

### Validation Error Response
```json
{
  "error": "Validation failed",
  "details": [
    {
      "msg": "Title contains invalid characters",
      "param": "title",
      "location": "body"
    }
  ]
}
```

## Security Features

1. **Input Sanitization**: Prevents XSS attacks by escaping HTML entities
2. **Rate Limiting**: Prevents abuse and DDoS attacks
3. **API Key Authentication**: Protects destructive operations
4. **Security Headers**: Adds X-Content-Type-Options, X-Frame-Options, X-XSS-Protection
5. **Request Logging**: Authenticates and logs authentication attempts

## Production Deployment Checklist

- [ ] Set `SEETHBOT_API_KEYS` environment variable with production keys
- [ ] **Set `SEETHBOT_JWT_SECRET` to a strong, random value** (required for user auth)
- [ ] **Set `SEETHBOT_JWT_EXPIRY` if you want custom token expiry** (default: 30d)
- [ ] Use HTTPS for all API communications
- [ ] Configure proper CORS origins
- [ ] Set up monitoring for failed authentication attempts
- [ ] Review rate limit settings based on expected traffic
- [ ] Implement API key rotation strategy
- [ ] Add logging for security events
- [ ] Backup the `users.db` database regularly (stored in `backend/data/`)

## Development Notes

- Default API keys are generated on server startup for development
- Rate limiting is stored in-memory (will reset on server restart)
- For production, consider using Redis for rate limit storage
- Authentication attempts are logged to the console

## Frontend Integration

### Using User Authentication (Recommended for End Users)

```javascript
// Store JWT token securely (e.g., in localStorage or httpOnly cookie)
const USER_TOKEN = localStorage.getItem('authToken');

// Get current user info
async function getUser() {
  const response = await fetch('/api/auth/me', {
    headers: {
      'Authorization': `Bearer ${USER_TOKEN}`
    }
  });

  if (!response.ok) {
    // Token invalid or expired, redirect to login
    window.location.href = '/login';
    return null;
  }

  return await response.json();
}

// Make authenticated request with user token
async function submitVote(movieId) {
  const response = await fetch('/api/movies/vote', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${USER_TOKEN}`
    },
    body: JSON.stringify({ movieId })
  });

  if (response.status === 401) {
    // Token expired, redirect to login
    window.location.href = '/login';
    return;
  }

  return await response.json();
}

// Register new user
async function register(email, password, displayName) {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      displayName,
      deviceName: navigator.userAgent,
      deviceType: 'desktop'
    })
  });

  const data = await response.json();
  if (response.ok) {
    localStorage.setItem('authToken', data.token);
    return data.user;
  }
  throw new Error(data.error);
}

// Login
async function login(email, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      deviceName: navigator.userAgent,
      deviceType: 'desktop'
    })
  });

  const data = await response.json();
  if (response.ok) {
    localStorage.setItem('authToken', data.token);
    return data.user;
  }
  throw new Error(data.error);
}

// Get all sessions (cross-device view)
async function getSessions() {
  const response = await fetch('/api/auth/sessions', {
    headers: { 'Authorization': `Bearer ${USER_TOKEN}` }
  });
  return await response.json();
}

// Logout from specific device
async function logoutDevice(sessionId) {
  const response = await fetch(`/api/auth/sessions/${sessionId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${USER_TOKEN}` }
  });
  return await response.json();
}

// Logout from all devices
async function logoutAllDevices() {
  const response = await fetch('/api/auth/sessions/all', {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${USER_TOKEN}` }
  });
  localStorage.removeItem('authToken');
  return await response.json();
}
```

### Using API Key Authentication (Admin/Integrations)

```javascript
// Store API key securely (e.g., in localStorage or a secure cookie)
const API_KEY = 'sk_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';

// Make authenticated request
fetch('/api/movies', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY
  },
  body: JSON.stringify({
    title: 'The Matrix',
    suggestedBy: 'Cam'
  })
})
.then(response => {
  if (response.status === 401 || response.status === 403) {
    // Handle authentication error
    // Redirect to login or show error message
    console.error('Authentication failed');
  }
  return response.json();
})
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

### Handling Authentication Errors

Both authentication systems use the same error codes:

- **401 Unauthorized**: No credentials provided or token expired
- **403 Forbidden**: Invalid credentials or insufficient permissions

Handle errors gracefully:
- Redirect users to login page (for user auth)
- Show friendly error messages
- Allow users to retry after rate limit expires
- Store tokens securely (never expose in client-side code)
- For user auth, implement automatic token refresh logic if needed
