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

# Launch the standalone mech game backend in the background.
# The main backend reverse-proxies mech /api + /ws traffic to it on MECH_PORT.
# Both processes must share the same SEETHBOT_JWT_SECRET (provided via the
# container environment / env_file) so tokens minted by main validate here.
MECH_DIR="/app/apps/mech/backend"
MECH_PORT="${MECH_PORT:-3011}"
export MECH_PORT

MECH_PID=""
if [ -f "$MECH_DIR/dist/index.js" ]; then
  echo "Starting mech game backend on port $MECH_PORT..."
  ( cd "$MECH_DIR" && exec node dist/index.js ) &
  MECH_PID=$!
else
  echo "Warning: mech backend not found at $MECH_DIR/dist/index.js; skipping mech backend."
fi

# Start the main application. It is the container's primary process (healthcheck
# targets it on port 3000). Run it in the background and `wait` on it so this
# entrypoint can forward termination signals and tear down the mech process.
echo "Starting Node.js application..."
node dist/index.js &
MAIN_PID=$!

# Forward shutdown signals to both processes; always clean up the mech process.
trap 'kill "$MAIN_PID" "$MECH_PID" 2>/dev/null' INT TERM
trap 'kill "$MECH_PID" 2>/dev/null' EXIT

# Block on the main backend; when it exits (or a signal arrives) the traps above
# ensure the mech backend is also stopped.
wait "$MAIN_PID"
