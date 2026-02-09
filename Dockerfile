# Multi-stage build for full-stack application
# Force rebuild: goose-honk support

# Shared build base with dependencies
FROM node:20-alpine3.19 AS builder-base
RUN apk add --no-cache python3 make g++

# Stage 1: Build backend (TypeScript) - MUST BE FIRST to generate OpenAPI spec
FROM builder-base AS backend-builder

WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./

# Install with cache mount
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Copy backend source (separate layer for better caching)
COPY backend/tsconfig.json ./
COPY backend/build-info.json ./build-info.json
COPY backend/scripts ./scripts/
COPY backend/src ./src/

# Build backend (generates dist/openapi.json)
RUN npm run build

# Stage 2: Build frontend (Vite) - depends on backend's OpenAPI spec
FROM builder-base AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install with cache mount
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Copy backend OpenAPI spec for type generation
COPY --from=backend-builder /app/backend/dist/openapi.json ../backend/dist/openapi.json

# Copy frontend config files first (less frequently changed)
COPY frontend/vite.config.ts frontend/tsconfig.json frontend/tsconfig.node.json frontend/index.html ./
COPY frontend/*.css frontend/*.mp3 frontend/*.html ./

# Copy frontend source code (more frequently changed)
COPY frontend/main.ts frontend/App.vue ./
COPY frontend/components ./components/
COPY frontend/repositories ./repositories/
COPY frontend/config ./config/
COPY frontend/router ./router/
COPY frontend/utils ./utils/
COPY frontend/composables ./composables/
COPY frontend/stores ./stores/
COPY frontend/lib ./lib/
COPY frontend/public ./public/

# Build frontend (generates types from backend OpenAPI spec)
RUN npm run build

# Stage 3: Production dependencies
FROM node:20-alpine3.19 AS prod-deps

WORKDIR /app/backend

COPY backend/package*.json ./

# Install ONLY production dependencies
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

# Stage 4: Production image
FROM node:20-alpine3.19

WORKDIR /app/backend

# Copy production dependencies (smaller than full node_modules)
COPY --from=prod-deps /app/backend/node_modules ./node_modules
COPY --from=prod-deps /app/backend/package.json ./package.json

# Copy backend built files
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/build-info.json ./build-info.json

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
