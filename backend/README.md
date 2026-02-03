# Seethbot Site - TypeScript Node.js Server

## Description
TypeScript-powered Express server serving the Vue.js webapp with API endpoints.

## Setup
```bash
cd backend
npm install
```

## Quick Start

### Development Mode (with hot reload)
```bash
npm run dev
```
Server runs on http://localhost:3000 with hot reload via ts-node-dev.

### Production Mode
```bash
npm run build    # Build TypeScript to JavaScript
npm start        # Run the built server
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to `dist/` directory
- `npm start` - Run production server (requires build first)
- `npm run watch` - Watch mode for TypeScript compilation

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

## Requirements
- Node.js 20.x or later
- npm or yarn

## Troubleshooting

### better-sqlite3 Build Issues
If you encounter build errors with `better-sqlite3`, try:
```bash
npm install better-sqlite3@latest
```

This native module needs to be compatible with your Node.js version.

## Environment Variables
- `PORT` - Server port (default: 3001)
- `SEETHBOT_API_KEYS` - Comma-separated API keys for authentication (generates default key if not set)

## Static Files
Serves all files from parent directory (Vue.js app including components, styles, etc.)
