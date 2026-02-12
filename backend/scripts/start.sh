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

# Create .env file if it doesn't exist
if [ ! -f "${BASE_DIR}/.env" ]; then
  echo "Creating .env file..."
  echo 'DATABASE_URL="file:./data/dev.db"' > "${BASE_DIR}/.env"
fi

# Check if database exists and has tables
DB_PATH="${BASE_DIR}/data/dev.db"
DB_NEEDS_INIT=0

if [ ! -f "$DB_PATH" ]; then
  echo "Database does not exist. Will run migrations..."
  DB_NEEDS_INIT=1
elif [ ! -s "$DB_PATH" ]; then
  echo "Database file is empty. Will run migrations..."
  DB_NEEDS_INIT=1
else
  # Check if User table exists (basic check)
  TABLE_COUNT=$(echo "SELECT count(*) FROM sqlite_master WHERE type='table' AND name='User';" | sqlite3 "$DB_PATH" 2>/dev/null || echo "0")
  if [ "$TABLE_COUNT" = "0" ]; then
    echo "Database exists but has no tables. Will run migrations..."
    DB_NEEDS_INIT=1
  else
    echo "Database already initialized with tables."
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
