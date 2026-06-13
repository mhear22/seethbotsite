# syntax=docker/dockerfile:1.7
# Multi-stage build for full-stack application (pnpm workspace monorepo)
# Build arguments for version tracking
ARG GIT_HASH=dev
ARG GIT_BRANCH=main
ARG BUILD_COUNT=1

# ---------------------------------------------------------------------------
# Base: Node + pnpm (via corepack) + native build tools
# Debian-slim for native module compatibility (bcrypt, sharp, prisma engines)
# ---------------------------------------------------------------------------
FROM node:24-slim AS base
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt/lists,sharing=locked \
    apt-get update && apt-get install -y --no-install-recommends python3 make g++ openssl && rm -rf /var/lib/apt/lists/*
ENV PNPM_HOME=/pnpm
ENV PATH="$PNPM_HOME:$PATH"
# Don't re-run an install/deps-status check before each `pnpm run`/`exec`
ENV PNPM_CONFIG_VERIFY_DEPS_BEFORE_RUN=false
RUN corepack enable && corepack prepare pnpm@11.5.2 --activate
WORKDIR /app

# ---------------------------------------------------------------------------
# Workspace manifest layer — only the files needed to resolve/install deps.
# Kept separate so the (expensive) install layer is cached on lockfile changes.
# ---------------------------------------------------------------------------
FROM base AS manifests
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
COPY apps/mech/frontend/package.json ./apps/mech/frontend/
COPY apps/tickets/frontend/package.json ./apps/tickets/frontend/
COPY apps/datacenter/frontend/package.json ./apps/datacenter/frontend/
# Prisma schema is needed by @prisma/client's install/generate
COPY backend/prisma ./backend/prisma/
COPY backend/prisma.config.ts ./backend/

# ---------------------------------------------------------------------------
# deps: install the WHOLE workspace once (dev + prod), cached on the lockfile.
# pnpm store is cache-mounted so unchanged packages are not re-downloaded.
# ---------------------------------------------------------------------------
FROM manifests AS deps
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile

# Shared files + validation script used by backend/frontend prebuild checks
# (validate-shared-files.js compares backend/src/shared vs frontend/shared)
FROM deps AS shared-src
COPY scripts/validate-shared-files.js ./scripts/validate-shared-files.js

# ---------------------------------------------------------------------------
# Stage: build backend (TypeScript) — generates dist/openapi.json for frontend
# ---------------------------------------------------------------------------
FROM shared-src AS backend-builder
ARG GIT_HASH
ARG GIT_BRANCH
ARG BUILD_COUNT
# Generate Prisma client (engines installed via deps)
RUN --mount=type=cache,target=/tmp/prisma \
    pnpm --filter ./backend exec prisma generate
# Backend + shared sources
COPY backend/tsconfig.json ./backend/
COPY backend/scripts ./backend/scripts/
COPY backend/src ./backend/src/
COPY frontend/shared ./frontend/shared/
RUN GIT_HASH="${GIT_HASH}" GIT_BRANCH="${GIT_BRANCH}" BUILD_COUNT="${BUILD_COUNT}" \
    pnpm --filter ./backend run build

# ---------------------------------------------------------------------------
# Stage: build frontend (Vite) — depends on backend's OpenAPI spec
# ---------------------------------------------------------------------------
FROM shared-src AS frontend-builder
# Backend OpenAPI spec for type generation
COPY --from=backend-builder /app/backend/dist/openapi.json ./backend/dist/openapi.json
# Frontend source + both shared trees (for prebuild validation)
COPY frontend/ ./frontend/
COPY backend/src/shared ./frontend/src/shared/
RUN --mount=type=cache,target=/app/frontend/public/assets/images/resized \
    pnpm --filter ./frontend run build

# ---------------------------------------------------------------------------
# Stage: build mech frontend app
# ---------------------------------------------------------------------------
FROM deps AS mech-frontend-builder
COPY apps/mech/frontend/ ./apps/mech/frontend/
RUN pnpm --filter ./apps/mech/frontend run build

# ---------------------------------------------------------------------------
# Stage: build tickets frontend app (relies on hoisted @vue/tsconfig from workspace)
# ---------------------------------------------------------------------------
FROM deps AS tickets-frontend-builder
COPY apps/tickets/frontend/ ./apps/tickets/frontend/
RUN pnpm --filter ./apps/tickets/frontend run build

# ---------------------------------------------------------------------------
# Stage: build datacenter frontend app
# ---------------------------------------------------------------------------
FROM deps AS datacenter-frontend-builder
COPY apps/datacenter/frontend/ ./apps/datacenter/frontend/
RUN pnpm --filter ./apps/datacenter/frontend run build

# ---------------------------------------------------------------------------
# Stage: production dependencies — extract a self-contained backend with only
# prod deps via `pnpm deploy`, then generate the Prisma client into it.
# ---------------------------------------------------------------------------
FROM deps AS prod-deps
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm --filter ./backend deploy --legacy --prod /prod
# Generate the Prisma client inside the isolated deploy dir (direct bin: it's
# outside the workspace, so the pnpm run-wrapper's deps check doesn't apply)
RUN --mount=type=cache,target=/tmp/prisma \
    cd /prod && ./node_modules/.bin/prisma generate

# ---------------------------------------------------------------------------
# Stage: production image (minimal)
# ---------------------------------------------------------------------------
FROM node:24-slim
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt/lists,sharing=locked \
    apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app/backend

# Production node_modules + package.json (self-contained from pnpm deploy)
COPY --from=prod-deps /prod/node_modules ./node_modules
COPY --from=prod-deps /prod/package.json ./

# Backend built files
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/build-info.json ./
COPY --from=backend-builder /app/backend/prisma ./prisma
COPY --from=backend-builder /app/backend/prisma.config.ts ./

# Startup script
COPY --from=backend-builder /app/backend/scripts/start.sh ./scripts/start.sh
RUN chmod +x ./scripts/start.sh

# Frontend builds (each app's `build` emits into backend/<app>-webdist)
COPY --from=frontend-builder /app/frontend/dist ./webdist
COPY --from=mech-frontend-builder /app/backend/mech-webdist ./mech-webdist
COPY --from=tickets-frontend-builder /app/backend/tickets-webdist ./tickets-webdist
COPY --from=datacenter-frontend-builder /app/backend/datacenter-webdist ./datacenter-webdist

# Data directory for SQLite database
RUN mkdir -p /app/backend/data

ENV GIT_HASH=${GIT_HASH}
ENV GIT_BRANCH=${GIT_BRANCH}
ENV PORT=3000

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["./scripts/start.sh"]
