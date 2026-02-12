#!/bin/bash
# PostgreSQL restore script
# Usage: ./restore-postgres.sh <backup_file.sql.gz>

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
PG_HOST="${PG_HOST:-postgres}"
PG_PORT="${PG_PORT:-5432}"
PG_DB="${PG_DB:-seethbot}"
PG_USER="${PG_USER:-seethbot}"

# Check for backup file
if [ -z "$1" ]; then
    echo -e "${RED}Error: No backup file specified${NC}"
    echo "Usage: $0 <backup_file.sql.gz>"
    echo ""
    echo "Available backups:"
    ls -lh /home/seethbotsite/backups/postgres/ 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}Error: Backup file not found: $BACKUP_FILE${NC}"
    exit 1
fi

echo -e "${YELLOW}=== PostgreSQL Restore ===${NC}"
echo "Backup file: $BACKUP_FILE"
echo "Target: $PG_USER@$PG_HOST:$PG_PORT/$PG_DB"
echo ""

# Confirmation
read -p "⚠️  This will REPLACE all data in the database. Continue? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

# Set PGPASSWORD
export PGPASSWORD="${POSTGRES_PASSWORD:-seethbot_secure_change_me_in_production}"

# Check PostgreSQL connection
if ! psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DB" -c '\q' 2>/dev/null; then
    echo -e "${RED}Error: Cannot connect to PostgreSQL${NC}"
    exit 1
fi

# Perform restore
echo -e "${YELLOW}Restoring database...${NC}"
gunzip -c "$BACKUP_FILE" | psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DB"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Restore completed successfully!${NC}"
else
    echo -e "${RED}❌ Restore failed!${NC}"
    exit 1
fi
