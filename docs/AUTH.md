# Authentication & Authorization Guide

## Overview

Two independent auth systems coexist. All features work without authentication.

1. **User Auth** - Optional JWT-based accounts for cross-device sync
2. **API Key Auth** - Admin/integration access to write endpoints

---

## User Authentication

JWT tokens (30-day rolling expiry), bcrypt/10 rounds, session tracking per device.

**Flow:** Register → get JWT → include in `Authorization: Bearer <token>` header → auto-extends on activity.

**Password change** invalidates all sessions.

### User Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register (email, password, displayName, deviceName, deviceType) |
| POST | `/api/auth/login` | No | Login |
| POST | `/api/auth/refresh` | No | Refresh token |
| GET | `/api/auth/me` | Yes | Current user info |
| POST | `/api/auth/logout` | Yes | Logout current session |
| GET | `/api/auth/sessions` | Yes | List all sessions |
| DELETE | `/api/auth/sessions/:id` | Yes | Delete specific session |
| DELETE | `/api/auth/sessions/all` | Yes | Delete all sessions |
| PATCH | `/api/auth/profile` | Yes | Update display name |
| PATCH | `/api/auth/avatar` | Yes | Update avatar URL |
| PATCH | `/api/auth/banner` | Yes | Update banner URL |
| PATCH | `/api/auth/bio` | Yes | Update bio |
| PATCH | `/api/auth/status` | Yes | Update status message |
| PATCH | `/api/auth/privacy` | Yes | Update privacy settings |
| PATCH | `/api/auth/password` | Yes | Change password |
| DELETE | `/api/auth/account` | Yes | Delete account |
| GET | `/api/profile/:id` | No | Public user profile |
| GET/PUT | `/api/auth/theme` | Yes | Get/update theme preferences |
| POST | `/api/auth/discord/link` | Yes | Link Discord account |
| DELETE | `/api/auth/discord/unlink` | Yes | Unlink Discord account |

### Middleware

```typescript
import { requireAuth, optionalAuth, requireUserIdMatch } from '../middleware/auth'

router.get('/protected', requireAuth, handler)        // Requires valid JWT
router.get('/public', optionalAuth, handler)          // Attaches user if present
router.get('/users/:id', requireAuth, requireUserIdMatch, handler)  // Own data only
```

### Session Fields

`id`, `user_id`, `device_name`, `device_type`, `token`, `expires_at`, `created_at`, `last_used_at`

Auto-extends: if 5+ minutes since last use, `expires_at` resets to 30 days from now.

---

## API Key Authentication

Keys stored in `SEETHBOT_API_KEYS` env var (comma-separated). A default dev key is generated on startup.

**Types:** `READ_ONLY`, `READ_WRITE`, `ADMIN`

**Send via:** `X-API-Key: <key>` or `Authorization: Bearer <key>`

### Middleware

```typescript
import { requireApiKey, ApiKeyType } from '../auth'

router.post('/admin/data', requireApiKey(), handler)                      // READ_WRITE+
router.delete('/admin/users/:id', requireApiKey(ApiKeyType.ADMIN), handler)
```

---

## Public vs Protected Endpoints

**Public (no auth):** All GET endpoints - rankings, cats, movies, stocks, stats, achievements, challenges, characters, public profiles.

**User auth required:** `/api/auth/*` endpoints, theme preferences.

**API key required:** POST/PATCH/DELETE for movies, stocks admin, admin operations.

**Hybrid (optional auth):** `/api/stats`, `/api/achievements`, `/api/challenges` - returns personalized data if authenticated.

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SEETHBOT_JWT_SECRET` | Yes (prod) | `change-this-in-production-secret-key` | JWT signing secret |
| `SEETHBOT_API_KEYS` | Yes (prod) | (auto-generated) | Comma-separated admin keys |
| `SEETHBOT_JWT_EXPIRY` | No | `30d` | Token expiry |

---

## Security

- bcrypt/10 rounds, minimum 8-char passwords, no plaintext storage
- Input validation: HTML stripped, length limits, type checks
- Headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`
- Rate limiting: 10,000 req/min per IP

---

## Common Errors

- `"Authentication required"` - Missing `Authorization: Bearer <token>` header
- `"Invalid or expired token"` - Token expired or session deleted; login again
- `"Invalid API key"` - Key not in `SEETHBOT_API_KEYS`
- `"Insufficient permissions"` - Use higher-permission key (ADMIN vs READ_ONLY)
- `"Email already registered"` - Use different email or login instead

---

## Code References

- `backend/src/auth.ts` - API key auth
- `backend/src/users.ts` - User auth
- `backend/src/middleware/auth.ts` - Middleware
- `backend/src/controllers/auth.controller.ts` - Auth endpoints
- `backend/prisma/schema.prisma` - User/Session schema
