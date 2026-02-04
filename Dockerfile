# Multi-stage build for full-stack application
# Force rebuild: goose-honk support

# Stage 1: Build backend (TypeScript) - MUST BE FIRST to generate OpenAPI spec
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend

# Install build dependencies for native modules (better-sqlite3)
RUN apk add --no-cache python3 make g++

# Copy backend package files
COPY backend/package*.json ./
RUN npm ci

# Copy backend source
COPY backend/tsconfig.json ./
COPY backend/src ./src/
COPY backend/scripts ./scripts/

# Build backend (generates dist/openapi.json)
RUN npm run build

# Stage 2: Build frontend (Vite) - depends on backend's OpenAPI spec
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./
RUN npm ci

# Copy backend OpenAPI spec for type generation
COPY --from=backend-builder /app/backend/dist/openapi.json ../backend/dist/openapi.json

# Copy frontend source
COPY frontend/vite.config.ts frontend/tsconfig.json frontend/tsconfig.node.json frontend/index.html ./
COPY frontend/main.ts frontend/App.vue ./
COPY frontend/components ./components/
COPY frontend/repositories ./repositories/
COPY frontend/config ./config/
COPY frontend/router ./router/
COPY frontend/utils ./utils/
COPY frontend/composables ./composables/
COPY frontend/stores ./stores/
COPY frontend/*.css frontend/*.mp3 frontend/*.html ./
COPY frontend/public ./public/

# Build frontend (generates types from backend OpenAPI spec)
RUN npm run build

# Stage 3: Production image
FROM node:20-alpine

WORKDIR /app/backend

# Install runtime dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy backend built files and dependencies
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/node_modules ./node_modules
COPY --from=backend-builder /app/backend/package.json ./package.json

# Copy frontend build
COPY --from=frontend-builder /app/frontend/dist ./webdist

# Create data directory for SQLite database
RUN mkdir -p /app/backend/data

# Set git hash as environment variable
ARG GIT_HASH=unknown
ARG GIT_BRANCH=unknown
ENV GIT_HASH=${GIT_HASH}
ENV GIT_BRANCH=${GIT_BRANCH}
ENV PORT=3000

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD ["node", "dist/index.js"]
