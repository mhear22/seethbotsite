#!/bin/bash
# Migration script: SQLite to PostgreSQL
# This script exports data from SQLite and imports it into PostgreSQL

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SQLITE_DB="${1:-./backend/prisma/dev.db}"
PG_HOST="${PG_HOST:-localhost}"
PG_PORT="${PG_PORT:-5432}"
PG_DB="${PG_DB:-seethbot}"
PG_USER="${PG_USER:-seethbot}"
PG_PASSWORD="${PG_PASSWORD:-seethbot_secure_change_me_in_production}"
EXPORT_DIR="./data/migration"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo -e "${GREEN}=== SQLite to PostgreSQL Migration ===${NC}"
echo "SQLite DB: $SQLITE_DB"
echo "PostgreSQL: $PG_USER@$PG_HOST:$PG_PORT/$PG_DB"
echo ""

# Check if SQLite database exists
if [ ! -f "$SQLITE_DB" ]; then
    echo -e "${RED}Error: SQLite database not found at $SQLITE_DB${NC}"
    exit 1
fi

# Create export directory
mkdir -p "$EXPORT_DIR"

# Export SQLite data to JSON files
echo -e "${YELLOW}Step 1: Exporting data from SQLite...${NC}"

cd backend

# Get list of tables
TABLES=$(sqlite3 "$SQLITE_DB" "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_%' ORDER BY name;")

# Export each table to JSON
for table in $TABLES; do
    echo "  Exporting table: $table"
    sqlite3 "$SQLITE_DB" <<EOF | python3 -c "import json, sys; print(json.dumps([{'column': row[0], 'type': row[1], 'notnull': row[2], 'dflt_value': row[3], 'pk': row[4]} for row in [tuple(r.split('|')) for r in sys.stdin.read().splitlines()]]))" > "$EXPORT_DIR/${table}_schema.json"
.headers on
.mode csv
.output
PRAGMA table_info($table);
EOF

    # Export data
    sqlite3 "$SQLITE_DB" <<EOF | python3 -c "import json, csv, sys; reader = csv.DictReader(sys.stdin); print(json.dumps([dict(row) for row in reader]))" > "$EXPORT_DIR/${table}_data.json"
.headers on
.mode csv
SELECT * FROM $table;
EOF
done

cd ..

echo -e "${GREEN}✅ SQLite export complete${NC}"
echo ""

# Import into PostgreSQL
echo -e "${YELLOW}Step 2: Importing data into PostgreSQL...${NC}"

# Set PGPASSWORD for psql
export PGPASSWORD="$PG_PASSWORD"

# Check PostgreSQL connection
if ! psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DB" -c '\q' 2>/dev/null; then
    echo -e "${RED}Error: Cannot connect to PostgreSQL${NC}"
    echo "Please ensure:"
    echo "  - PostgreSQL container is running: docker-compose up -d postgres"
    echo "  - Database credentials are correct"
    exit 1
fi

# Import data
for table in $TABLES; do
    if [ -f "$EXPORT_DIR/${table}_data.json" ]; then
        echo "  Importing table: $table"
        python3 <<PYTHON_SCRIPT
import json
import subprocess

# Read data
with open('$EXPORT_DIR/${table}_data.json', 'r') as f:
    data = json.load(f)

if data:
    # Generate INSERT statements
    for row in data:
        # Sanitize values
        values = []
        for value in row.values():
            if value is None:
                values.append('NULL')
            elif value == '':
                values.append("''")
            else:
                # Escape single quotes
                escaped = str(value).replace("'", "''")
                values.append(f"'{escaped}'")

        columns = ', '.join(row.keys())
        values_str = ', '.join(values)

        sql = f"INSERT INTO $table ({columns}) VALUES ({values_str}) ON CONFLICT DO NOTHING;"
        print(sql)
PYTHON_SCRIPT
    fi
done | psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DB"

echo -e "${GREEN}✅ PostgreSQL import complete${NC}"
echo ""

# Verification
echo -e "${YELLOW}Step 3: Verifying migration...${NC}"

for table in $TABLES; do
    sqlite_count=$(sqlite3 "$SQLITE_DB" "SELECT COUNT(*) FROM $table;")
    pg_count=$(psql -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" -d "$PG_DB" -t -c "SELECT COUNT(*) FROM \"$table\";")
    pg_count=$(echo "$pg_count" | tr -d ' ')

    if [ "$sqlite_count" -eq "$pg_count" ]; then
        echo -e "  ${GREEN}✓${NC} $table: $sqlite_count rows (matches)"
    else
        echo -e "  ${RED}✗${NC} $table: SQLite=$sqlite_count, PostgreSQL=$pg_count (mismatch!)"
    fi
done

echo ""
echo -e "${GREEN}=== Migration Complete ===${NC}"
echo "Exported data saved to: $EXPORT_DIR"
echo ""
echo "Next steps:"
echo "  1. Run: cd backend && npx prisma migrate dev"
echo "  2. Run: cd backend && npm run db:seed"
echo "  3. Update .env with DATABASE_URL=postgresql://..."
echo ""
