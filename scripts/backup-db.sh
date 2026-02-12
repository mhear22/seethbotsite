#!/bin/bash
# Backup script for SQLite database
# Run this daily via cron or systemd timer

BACKUP_DIR="/home/seethbotsite/backups/database"
DB_FILE="/home/seethbotsite/backend/prisma/dev.db"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Backup database
echo "[$(date)] Starting database backup..."
cp "$DB_FILE" "$BACKUP_DIR/dev.db_$DATE"

# Compress backup
gzip "$BACKUP_DIR/dev.db_$DATE"

# Remove backups older than RETENTION_DAYS
find "$BACKUP_DIR" -name "dev.db_*.gz" -mtime +$RETENTION_DAYS -delete

echo "[$(date)] Backup completed: dev.db_$DATE.gz"
echo "[$(date)] Retention: $RETENTION_DAYS days"
