#!/bin/sh
set -e

echo "Starting SeethBot backend..."

# Determine the base directory (Docker vs local)
if [ -d "/app/backend" ]; then
  BASE_DIR="/app/backend"
else
  BASE_DIR="$(pwd)"
fi

# Determine prisma binary path (Docker has flat node_modules, local has node_modules dir)
if [ -f "$BASE_DIR/.bin/prisma" ]; then
  PRISMA_CMD="$BASE_DIR/.bin/prisma"
else
  PRISMA_CMD="node_modules/.bin/prisma"
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL environment variable is not set."
  echo "Please set DATABASE_URL to your PostgreSQL connection string."
  echo "Example: DATABASE_URL=\"postgresql://user:password@localhost:5432/seethbotsite?schema=public\""
  exit 1
fi

# Check if we need to run migrations
DB_NEEDS_INIT=0

if ! $PRISMA_CMD migrate status 2>/dev/null | grep -q "Can't reach database"; then
  if ! $PRISMA_CMD migrate status 2>/dev/null | grep -q "Last migration"; then
    echo "Database needs initialization. Will run migrations..."
    DB_NEEDS_INIT=1
  else
    echo "Database already initialized with migrations."
  fi
else
  echo "Cannot connect to database. Will run migrations..."
  DB_NEEDS_INIT=1
fi

# Run migrations if needed
if [ "$DB_NEEDS_INIT" = "1" ]; then
  echo "Running database migrations..."
  $PRISMA_CMD migrate deploy
  echo "Database migrations completed."
fi

# Start the application
echo "Starting Node.js application..."
exec node dist/index.js
