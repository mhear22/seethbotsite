#!/bin/bash
# Spin up postgres (docker), backend (port 3001), main frontend (port 3000), and mech frontend (port 3002)

POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-seethbot_secret_change_me}
DATABASE_URL="postgresql://seethbot:${POSTGRES_PASSWORD}@localhost:5432/seethbot?schema=public"

trap 'kill 0' EXIT

# Start postgres container if not already running
if ! docker ps --format '{{.Names}}' | grep -q '^seethbot-postgres$'; then
  echo "Starting postgres container..."
  docker compose up -d postgres
  echo "Waiting for postgres to be healthy..."
  until docker exec seethbot-postgres pg_isready -U seethbot -d seethbot &>/dev/null; do
    sleep 1
  done
  echo "Postgres ready."
else
  echo "Postgres already running."
fi

echo "Running migrations..."
(cd backend && DATABASE_URL="$DATABASE_URL" npx prisma migrate deploy)

echo "Starting backend on port 3001..."
(cd backend && DATABASE_URL="$DATABASE_URL" npm run dev) &

echo "Starting frontend on port 3000..."
(cd frontend && npm run dev) &

echo "Starting mech frontend app on port 3002..."
(cd apps/mech/frontend && npm run dev) &

wait
