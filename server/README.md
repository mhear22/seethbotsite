# Seethbot Site - TypeScript Node.js Server

## Description
TypeScript-powered Express server serving the Vue.js webapp with API endpoints.

## Setup
```bash
cd server
npm install
```

## Development
```bash
npm run dev
```
Server runs on http://localhost:3000 with hot reload via ts-node-dev.

## Build
```bash
npm run build
```
Compiles TypeScript to `dist/` directory.

## Production
```bash
npm run build
npm start
```

## API Endpoints

### GET /api/health
Health check endpoint.
```json
{
  "status": "ok",
  "timestamp": "2024-01-29T10:00:00.000Z"
}
```

### GET /api/rankings
Returns the coolness rankings leaderboard.
```json
[
  { "avatar": "🌙", "name": "Orlando", "score": 3467 },
  { "avatar": "🌸", "name": "You", "score": 1467, "isCurrentUser": true },
  ...
]
```

## Environment Variables
- `PORT` - Server port (default: 3000)

## Static Files
Serves all files from parent directory (Vue.js app including components, styles, etc.)
