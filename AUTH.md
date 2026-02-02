# Authentication & Authorization Guide

## Overview

The seethbotsite API implements a simple API key-based authentication system to protect destructive endpoints (POST/DELETE operations that modify data). Read-only operations (GET endpoints) remain publicly accessible.

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
- [ ] Change `SEETHBOT_JWT_SECRET` from default
- [ ] Use HTTPS for all API communications
- [ ] Configure proper CORS origins
- [ ] Set up monitoring for failed authentication attempts
- [ ] Review rate limit settings based on expected traffic
- [ ] Implement API key rotation strategy
- [ ] Add logging for security events

## Development Notes

- Default API keys are generated on server startup for development
- Rate limiting is stored in-memory (will reset on server restart)
- For production, consider using Redis for rate limit storage
- Authentication attempts are logged to the console

## Frontend Integration

When making authenticated requests from the frontend:

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

Handle authentication errors gracefully:
- Redirect users to a login page
- Show friendly error messages
- Allow users to retry after rate limit expires
- Store API key securely (never expose in client-side code)
