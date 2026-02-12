#!/bin/sh
set -e

echo "Starting SeethBot backend..."

# Determine the base directory (Docker vs local)
if [ -d "/app/backend" ]; then
  BASE_DIR="/app/backend"
else
  BASE_DIR="$(pwd)"
fi

# Create data directory if it doesn't exist
mkdir -p "${BASE_DIR}/data"

# Check if DATABASE_URL is already set (from Docker Compose)
if [ -z "$DATABASE_URL" ]; then
  # Not set from Docker Compose, use SQLite for local development
  if [ ! -f "${BASE_DIR}/.env" ]; then
    echo "Creating .env file for local development (SQLite)..."
    echo 'DATABASE_URL="file:./data/dev.db"' > "${BASE_DIR}/.env"
  fi
fi

# Check if we need to run migrations
# For PostgreSQL, DATABASE_URL starts with postgresql://
DB_NEEDS_INIT=0

if echo "$DATABASE_URL" | grep -q "^postgresql://"; then
  # PostgreSQL: Use Prisma to check if migrations are applied
  echo "Using PostgreSQL database."
  if ! npx prisma migrate status 2>/dev/null | grep -q "Can't reach database"; then
    if ! npx prisma migrate status 2>/dev/null | grep -q "Last migration"; then
      echo "Database needs initialization. Will run migrations..."
      DB_NEEDS_INIT=1
    else
      echo "Database already initialized with migrations."
    fi
  else
    echo "Cannot connect to database. Will run migrations..."
    DB_NEEDS_INIT=1
  fi
else
  # SQLite: Check if database file exists and has tables
  DB_PATH="${BASE_DIR}/data/dev.db"
  if [ ! -f "$DB_PATH" ]; then
    echo "Database does not exist. Will run migrations..."
    DB_NEEDS_INIT=1
  elif [ ! -s "$DB_PATH" ]; then
    echo "Database file is empty. Will run migrations..."
    DB_NEEDS_INIT=1
  else
    TABLE_COUNT=$(echo "SELECT count(*) FROM sqlite_master WHERE type='table' AND name='User';" | sqlite3 "$DB_PATH" 2>/dev/null || echo "0")
    if [ "$TABLE_COUNT" = "0" ]; then
      echo "Database exists but has no tables. Will run migrations..."
      DB_NEEDS_INIT=1
    else
      echo "Database already initialized with tables."
    fi
  fi
fi

# Run migrations if needed
if [ "$DB_NEEDS_INIT" = "1" ]; then
  echo "Running database migrations..."
  npx prisma migrate deploy
  echo "Database migrations completed."
fi

# Start the application
echo "Starting Node.js application..."
exec node dist/index.js
