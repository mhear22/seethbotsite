# Multi-stage build for full-stack application

# Multi-stage build for full-stack application
# Build arguments for version tracking
ARG GIT_HASH=dev
ARG GIT_BRANCH=main
ARG BUILD_COUNT=1

# Shared build base with native compilation tools
# Using Debian-slim for better native module compatibility (libsql)
FROM node:24-slim AS builder-base
RUN apt-get update && apt-get install -y python3 make g++ openssl && rm -rf /var/lib/apt/lists/*

# Stage 1: Build backend (TypeScript) - generates OpenAPI spec for frontend
FROM builder-base AS backend-builder

WORKDIR /app/backend

# Copy backend package files (cached unless package*.json changes)
COPY backend/package*.json ./

# Install with cache mount - use ci for faster, reproducible installs
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline --no-audit

# Copy backend source files
COPY backend/tsconfig.json backend/prisma.config.ts ./
COPY backend/scripts ./scripts/
COPY backend/prisma ./prisma/
COPY backend/src ./src/

# Copy shared files and validation script for prebuild validation
COPY scripts/validate-shared-files.js ../scripts/validate-shared-files.js
COPY backend/src/shared ../backend/src/shared
COPY frontend/shared ../frontend/shared

# Generate Prisma Client with cache
RUN --mount=type=cache,target=/tmp/prisma \
    npx prisma generate

# Build backend (generates dist/openapi.json)
RUN GIT_HASH="${GIT_HASH}" GIT_BRANCH="${GIT_BRANCH}" BUILD_COUNT="${BUILD_COUNT}" npm run build

# Stage 2: Build frontend (Vite) - depends on backend's OpenAPI spec
FROM builder-base AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install with cache mount - use ci for faster, reproducible installs
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline --no-audit

# Copy backend OpenAPI spec for type generation
COPY --from=backend-builder /app/backend/dist/openapi.json ../backend/dist/openapi.json

# Copy all frontend source (relies on .dockerignore to exclude node_modules/dist)
COPY frontend/ ./

# Copy shared files and validation script for prebuild validation
COPY scripts/validate-shared-files.js ../scripts/validate-shared-files.js
COPY backend/src/shared ../backend/src/shared
COPY frontend/shared ../frontend/shared

# Build frontend
RUN npm run build

# Stage 3: Production dependencies (needs native build tools for bcrypt)
FROM builder-base AS prod-deps

WORKDIR /app/backend

COPY backend/package*.json ./
COPY backend/prisma.config.ts ./
COPY backend/prisma ./prisma/

# Install ONLY production dependencies with cache mount
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --prefer-offline --no-audit

# Generate Prisma Client for production with cache
RUN --mount=type=cache,target=/tmp/prisma \
    npx prisma generate

# Stage 4: Build mech frontend app
FROM builder-base AS mech-frontend-builder

WORKDIR /app/apps/mech/frontend

COPY apps/mech/frontend/package*.json ./

RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline --no-audit

COPY apps/mech/frontend/ ./

RUN npm run build

# Stage 5: Production image (minimal)
FROM node:24-slim

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app/backend

# Copy production dependencies and package.json together
COPY --from=prod-deps /app/backend/node_modules /app/backend/package.json ./

# Copy backend built files in combined layer
COPY --from=backend-builder /app/backend/dist /app/backend/build-info.json /app/backend/prisma /app/backend/prisma.config.ts ./

# Copy startup script with permissions
COPY --from=backend-builder /app/backend/scripts/start.sh ./scripts/start.sh
RUN chmod +x ./scripts/start.sh

# Copy frontend builds
COPY --from=frontend-builder /app/frontend/dist ./webdist
COPY --from=mech-frontend-builder /app/backend/mech-webdist ./mech-webdist

# Create data directory for SQLite database
RUN mkdir -p /app/backend/data

# Set git hash as environment variable
ENV GIT_HASH=${GIT_HASH}
ENV GIT_BRANCH=${GIT_BRANCH}
ENV PORT=3000

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["./scripts/start.sh"]
