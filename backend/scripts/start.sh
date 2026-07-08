#!/bin/bash
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

  # Readiness gate: wait for the mech backend to accept connections before
  # starting main, so main never reverse-proxies to a not-yet-listening port.
  # Fail fast (non-zero exit → container restart) if it dies or never binds.
  echo "Waiting for mech game backend to become ready on port $MECH_PORT..."
  MECH_READY=0
  i=0
  while [ "$i" -lt 30 ]; do
    if ! kill -0 "$MECH_PID" 2>/dev/null; then
      echo "Error: mech game backend exited during startup."
      exit 1
    fi
    if node -e "require('http').get('http://127.0.0.1:'+process.env.MECH_PORT+'/api/mech/multiplayer/stats',function(r){process.exit(0)}).on('error',function(){process.exit(1)})" 2>/dev/null; then
      MECH_READY=1
      break
    fi
    i=$((i + 1))
    sleep 0.5
  done
  if [ "$MECH_READY" != "1" ]; then
    echo "Error: mech game backend did not become ready within timeout."
    kill "$MECH_PID" 2>/dev/null || true
    exit 1
  fi
  echo "Mech game backend is ready."
else
  echo "Warning: mech backend not found at $MECH_DIR/dist/index.js; skipping mech backend."
fi

# Start the main application. It is the container's primary process (healthcheck
# targets it on port 3000).
echo "Starting Node.js application..."
node dist/index.js &
MAIN_PID=$!

# Forward shutdown signals to both processes, and always tear both down on exit.
trap 'kill "$MAIN_PID" "$MECH_PID" 2>/dev/null' INT TERM
trap 'kill "$MAIN_PID" "$MECH_PID" 2>/dev/null' EXIT

# Block until EITHER process exits. If the mech backend crashes, we must not keep
# serving a healthy-looking main with a dead game behind the proxy — so we tear
# down main and exit non-zero to trigger the container's restart policy.
set +e
if [ -n "$MECH_PID" ]; then
  wait -n "$MAIN_PID" "$MECH_PID"
  EXIT_CODE=$?
else
  wait "$MAIN_PID"
  EXIT_CODE=$?
fi
echo "A monitored process exited (code $EXIT_CODE); shutting down container."
exit "$EXIT_CODE"
