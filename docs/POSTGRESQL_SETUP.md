# PostgreSQL Migration & Setup Guide

## Overview

This guide covers migrating from SQLite to PostgreSQL using Docker, including setup, backups, and migration of existing data.

## Architecture

```
┌─────────────────────────────────────────┐
│         Docker Compose Stack            │
├─────────────────────────────────────────┤
│  PostgreSQL 16 (port 5432)             │
│  ├── Automatic backups (daily)         │
│  ├── Volume persistence                 │
│  └── Health checks                      │
│                                         │
│  pgAdmin (port 5050) - Optional        │
│  └── Database management UI              │
│                                         │
│  PostgreSQL Backup Service              │
│  └── Automated scheduled backups         │
└─────────────────────────────────────────┘
```

## Prerequisites

- Docker and Docker Compose installed
- Node.js 20+ and npm 10+
- Python 3 (for SQLite migration script)

## Quick Start

### 1. Setup PostgreSQL Container

```bash
# Copy environment template
cp .env.example .env

# Edit .env and change POSTGRES_PASSWORD to a secure value
nano .env

# Start PostgreSQL container
docker-compose up -d postgres

# Check container status
docker-compose ps
```

### 2. Update Application Configuration

```bash
# Create backend .env
cp backend/.env.example backend/.env

# Edit backend/.env with PostgreSQL connection
nano backend/.env
```

Add this line to `backend/.env`:
```bash
DATABASE_URL="postgresql://seethbot:your_password@localhost:5432/seethbot?schema=public"
```

### 3. Migrate Prisma Schema

```bash
cd backend

# Generate new migration for PostgreSQL
npx prisma migrate dev --name switch-to-postgres

# Apply migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### 4. Migrate Existing Data (Optional)

If you have existing SQLite data you want to migrate:

```bash
# Run migration script
cd /home/seethbotsite
./scripts/migrate-sqlite-to-postgres.sh

# The script will:
# - Export all tables from SQLite to JSON
# - Import data into PostgreSQL
# - Verify data integrity
```

### 5. Seed Database

```bash
cd backend
npm run db:seed
```

### 6. Restart Application

```bash
# Stop old container
cd /home/seethbotsite
./deploy.sh

# Or rebuild if needed
docker-compose up -d --build
```

## Docker Compose Services

### PostgreSQL (postgres)

Main database service.

**Environment Variables:**
- `POSTGRES_DB`: Database name (default: `seethbot`)
- `POSTGRES_USER`: Database user (default: `seethbot`)
- `POSTGRES_PASSWORD`: Database password (**change in production**)

**Volumes:**
- `postgres_data`: Persistent data storage
- `./scripts/postgres-init`: SQL scripts for initialization

**Health Check:**
```bash
# Check PostgreSQL health
docker-compose ps postgres
```

### pgAdmin (Optional)

Web-based database management UI.

**Access:** http://localhost:5050

**Default Credentials:**
- Email: `admin@seethbot.local`
- Password: `admin` (**change in production**)

**Start with pgAdmin:**
```bash
docker-compose --profile admin up -d
```

### PostgreSQL Backup Service

Automated backup service.

**Schedule:** Daily (configurable via `SCHEDULE` environment variable)

**Retention Policy:**
- Daily backups: 30 days
- Weekly backups: 8 weeks
- Monthly backups: 6 months

**Backup Location:** `./backups/postgres/`

**Configuration:**
```yaml
environment:
  SCHEDULE: '@daily'              # Cron-like schedule
  BACKUP_KEEP_DAYS: 30            # Keep daily backups for 30 days
  BACKUP_KEEP_WEEKS: 8            # Keep weekly backups for 8 weeks
  BACKUP_KEEP_MONTHS: 6           # Keep monthly backups for 6 months
```

## Backup & Restore

### Manual Backup

```bash
# Run backup script
./scripts/backup-postgres.sh

# Or use Docker Compose backup service
docker-compose up postgres-backup
```

### Restore from Backup

```bash
# List available backups
ls -lh backups/postgres/

# Restore from specific backup
./scripts/restore-postgres.sh backups/postgres/seethbot_20260212_100000.sql.gz
```

### Automated Backups

#### Option 1: Docker Compose Backup Service (Recommended)

The backup service is already configured in `docker-compose.yml`. It runs automatically on the schedule defined in `SCHEDULE`.

**Backup service logs:**
```bash
docker-compose logs -f postgres-backup
```

#### Option 2: Cron Job

Add to crontab:
```bash
crontab -e

# Add this line for daily backup at 2 AM
0 2 * * * /home/seethbotsite/scripts/backup-postgres.sh >> /var/log/postgres-backup.log 2>&1
```

#### Option 3: Systemd Timer

Create service file:
```bash
sudo nano /etc/systemd/system/postgres-backup.service
```

```ini
[Unit]
Description=PostgreSQL Database Backup
After=docker.service

[Service]
Type=oneshot
ExecStart=/home/seethbotsite/scripts/backup-postgres.sh
User=root
WorkingDirectory=/home/seethbotsite

[Install]
WantedBy=multi-user.target
```

Create timer file:
```bash
sudo nano /etc/systemd/system/postgres-backup.timer
```

```ini
[Unit]
Description=Run PostgreSQL Backup Daily

[Timer]
OnCalendar=*-*-* 02:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

Enable and start:
```bash
sudo systemctl enable postgres-backup.timer
sudo systemctl start postgres-backup.timer
```

## Monitoring

### Check PostgreSQL Status

```bash
# Container status
docker-compose ps postgres

# Database connection
docker-compose exec postgres psql -U seethbot -d seethbot -c "SELECT version();"

# Database size
docker-compose exec postgres psql -U seethbot -d seethbot -c "SELECT pg_size_pretty(pg_database_size('seethbot'));"

# Table counts
docker-compose exec postgres psql -U seethbot -d seethbot -c "SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size FROM pg_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"
```

### View Logs

```bash
# PostgreSQL logs
docker-compose logs -f postgres

# Backup service logs
docker-compose logs -f postgres-backup

# All logs
docker-compose logs -f
```

## Maintenance

### Update PostgreSQL

```bash
# Pull latest image
docker-compose pull postgres

# Recreate container (preserves data)
docker-compose up -d postgres
```

### Database Vacuum & Reindex

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U seethbot -d seethbot

# Run VACUUM ANALYZE
VACUUM ANALYZE;

# Reindex all tables
REINDEX DATABASE seethbot;
```

### Backup Data Directory

```bash
# Stop PostgreSQL
docker-compose stop postgres

# Backup Docker volume
docker run --rm -v seethbot_postgres_data:/data -v $(pwd)/backups:/backup ubuntu tar czf /backup/postgres_data_$(date +%Y%m%d).tar.gz /data

# Restart PostgreSQL
docker-compose start postgres
```

## Troubleshooting

### Cannot Connect to PostgreSQL

```bash
# Check if container is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Check network
docker-compose exec postgres ping seethbot-server

# Test connection from host
psql -h localhost -U seethbot -d seethbot
```

### Migration Errors

```bash
# Reset PostgreSQL (WARNING: deletes all data)
docker-compose exec postgres psql -U seethbot -d seethbot -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Run Prisma migrations
cd backend
npx prisma migrate reset
```

### Backup Failures

```bash
# Check backup service logs
docker-compose logs postgres-backup

# Verify backup directory permissions
ls -la backups/postgres/

# Manual backup test
./scripts/backup-postgres.sh
```

## Performance Tuning

### PostgreSQL Configuration

Create custom config:
```bash
mkdir -p config/postgres
nano config/postgresql.conf
```

Add to docker-compose.yml:
```yaml
postgres:
  volumes:
    - ./config/postgresql.conf:/etc/postgresql/postgresql.conf:ro
  command: postgres -c config_file=/etc/postgresql/postgresql.conf
```

### Recommended Settings (for production)

```postgresql
# Memory Settings
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
work_mem = 16MB

# Connection Settings
max_connections = 100

# WAL Settings
wal_buffers = 16MB
checkpoint_completion_target = 0.9

# Query Planning
random_page_cost = 1.1

# Logging
log_min_duration_statement = 1000
```

### Connection Pooling

Consider adding PgBouncer for production:

```yaml
pgbouncer:
  image: edoburu/pgbouncer
  container_name: seethbot-pgbouncer
  environment:
    DATABASES_HOST: postgres
    DATABASES_PORT: 5432
    DATABASES_USER: seethbot
    DATABASES_PASSWORD: ${POSTGRES_PASSWORD}
    DATABASES_DBNAME: seethbot
    POOL_MODE: transaction
    MAX_CLIENT_CONN: 1000
    DEFAULT_POOL_SIZE: 25
  ports:
    - "6432:5432"
  depends_on:
    - postgres
  networks:
    - seethbot-network
```

Update DATABASE_URL to use PgBouncer:
```bash
DATABASE_URL="postgresql://seethbot:password@localhost:6432/seethbot?schema=public"
```

## Security Checklist

- [ ] Change default passwords in `.env`
- [ ] Enable SSL connections (for remote access)
- [ ] Restrict PostgreSQL to Docker network only
- [ ] Use strong passwords for all services
- [ ] Enable PostgreSQL authentication (scram-sha-256)
- [ ] Regularly update Docker images
- [ ] Test backup restoration procedures
- [ ] Monitor database logs for suspicious activity
- [ ] Implement rate limiting on API endpoints
- [ ] Use environment variables for secrets

## Comparison: SQLite vs PostgreSQL

| Feature               | SQLite                          | PostgreSQL                      |
|-----------------------|---------------------------------|---------------------------------|
| Deployment            | Single file                     | Server-based                   |
| Concurrency           | Write-locks                     | Full MVCC                      |
| Scalability           | Limited                         | Excellent                      |
| Backup                | File copy                       | pg_dump / continuous archiving|
| Performance           | Good for small datasets         | Excellent for large datasets   |
| JSON Support          | Limited                         | Full JSONB indexing            |
| Full-Text Search      | Basic FTS5                      | Advanced with tsvector         |
| Data Types            | Limited                         | Rich (UUID, JSONB, arrays)    |
| Replication           | None                            | Built-in streaming replication|
| Backups               | Manual file copy                | Point-in-time recovery (PITR)  |

## Migration Checklist

- [ ] Docker Compose PostgreSQL container running
- [ ] Environment variables configured
- [ ] Prisma schema updated to PostgreSQL
- [ ] Migrations applied successfully
- [ ] Existing data migrated (if applicable)
- [ ] Database seeded with initial data
- [ ] Application connecting to PostgreSQL
- [ ] Backup service running
- [ ] Backups verified
- [ ] Restoration tested
- [ ] Documentation updated

## Next Steps

1. **Production Deployment:**
   - Use production-grade passwords
   - Enable SSL/TLS
   - Set up monitoring (Prometheus/Grafana)
   - Configure log aggregation

2. **High Availability:**
   - Configure PostgreSQL replication (primary/standby)
   - Load balancing with PgBouncer
   - Failover automation with Patroni

3. **Optimization:**
   - Regular VACUUM/ANALYZE
   - Index optimization
   - Query performance monitoring
   - Connection pooling

## References

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker PostgreSQL Image](https://hub.docker.com/_/postgres)
- [Prisma PostgreSQL Guide](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [pgAdmin Documentation](https://www.pgadmin.org/docs/)

## Support

For issues or questions:
- Check logs: `docker-compose logs -f`
- Verify connectivity: `docker-compose exec postgres psql -U seethbot -d seethbot`
- Review Prisma docs: https://www.prisma.io/docs
- PostgreSQL docs: https://www.postgresql.org/docs/
