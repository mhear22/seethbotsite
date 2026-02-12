#!/bin/bash
# PostgreSQL backup script
# Designed to run via cron or systemd timer

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/home/seethbotsite/backups/postgres}"
PG_HOST="${PG_HOST:-postgres}"
PG_PORT="${PG_PORT:-5432}"
PG_DB="${PG_DB:-seethbot}"
PG_USER="${PG_USER:-seethbot}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="${PG_DB}_${TIMESTAMP}.sql.gz"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "[$(date)] Starting PostgreSQL backup..."

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Set PGPASSWORD for pg_dump
export PGPASSWORD="${POSTGRES_PASSWORD:-seethbot_secure_change_me_in_production}"

# Perform backup
pg_dump -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DB" | gzip > "$BACKUP_DIR/$BACKUP_NAME"

# Check if backup succeeded
if [ -f "$BACKUP_DIR/$BACKUP_NAME" ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_NAME" | cut -f1)
    echo -e "${GREEN}[$(date)] Backup completed: $BACKUP_NAME ($BACKUP_SIZE)${NC}"
else
    echo "[$(date)] ❌ Backup failed!"
    exit 1
fi

# Remove old backups (based on RETENTION_DAYS)
find "$BACKUP_DIR" -name "${PG_DB}_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "[$(date)] Retention: $RETENTION_DAYS days"
echo "[$(date)] Backup directory: $BACKUP_DIR"

# Optional: Send notification (uncomment and configure)
# echo "Database backup completed: $BACKUP_NAME" | mail -s "PostgreSQL Backup" admin@example.com
