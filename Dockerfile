# Multi-stage build for full-stack application

# Stage 1: Build frontend (Vite)
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy frontend package files
COPY package*.json ./
RUN npm install

# Copy frontend source
COPY vite.config.ts tsconfig.json tsconfig.node.json index.html ./
COPY main.ts App.ts ./
COPY components ./components/
COPY *.css *.mp3 *.html ./

# Build frontend
RUN npm run build

# Stage 2: Build backend (TypeScript)
FROM node:20-alpine AS backend-builder

WORKDIR /app/server

# Install build dependencies for native modules (better-sqlite3)
RUN apk add --no-cache python3 make g++

# Copy backend package files
COPY server/package*.json ./
RUN npm install

# Copy backend source
COPY server/tsconfig.json ./
COPY server/src ./src/

# Build backend
RUN npm run build

# Stage 3: Production image
FROM node:20-alpine

WORKDIR /app/server

# Install runtime dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy backend built files and dependencies
COPY --from=backend-builder /app/server/dist ./dist
COPY --from=backend-builder /app/server/node_modules ./node_modules
COPY --from=backend-builder /app/server/package.json ./package.json

# Copy frontend build
COPY --from=frontend-builder /app/dist ./webdist

# Create data directory for SQLite database
RUN mkdir -p /app/server/data

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD ["node", "dist/index.js"]
