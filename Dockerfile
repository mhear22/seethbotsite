# Multi-stage build for full-stack application

# Shared build base with native compilation tools
FROM node:22-alpine3.19 AS builder-base
RUN apk add --no-cache python3 make g++

# Stage 1: Build backend (TypeScript) - generates OpenAPI spec for frontend
FROM builder-base AS backend-builder

WORKDIR /app/backend

# Copy backend package files (cached unless package*.json changes)
COPY backend/package*.json ./

# Install with cache mount
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Copy backend source (separate layer for better caching)
COPY backend/tsconfig.json ./
COPY backend/build-info.json ./build-info.json
COPY backend/scripts ./scripts/
COPY backend/prisma ./prisma/
COPY backend/src ./src/

# Generate Prisma Client
RUN npx prisma generate

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

# Copy all frontend source in one layer (relies on .dockerignore to exclude node_modules/dist)
COPY frontend/ ./

# Build frontend
RUN npm run build

# Stage 3: Production dependencies (needs native build tools for bcrypt)
FROM builder-base AS prod-deps

WORKDIR /app/backend

COPY backend/package*.json ./

# Install ONLY production dependencies
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

# Stage 4: Production image (minimal)
FROM node:22-alpine3.19

WORKDIR /app/backend

# Copy production dependencies
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

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "dist/index.js"]
