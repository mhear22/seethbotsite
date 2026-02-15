# PostgreSQL Setup Guide

PostgreSQL 16 runs in Docker Compose alongside the app. Automated daily backups are included.

## Quick Start

```bash
# 1. Set up environment
cp .env.example .env         # Edit POSTGRES_PASSWORD
cp backend/.env.example backend/.env  # Edit DATABASE_URL

# 2. Start PostgreSQL
docker-compose up -d postgres

# 3. Apply Prisma migrations and seed
cd backend
npx prisma migrate deploy
npx prisma generate
npm run db:seed

# 4. Deploy
cd ..
./deploy.sh

# 5. Verify
docker-compose exec postgres psql -U seethbot -d seethbot -c "SELECT 1;"
```

`DATABASE_URL` format: `postgresql://seethbot:your_password@localhost:5432/seethbot?schema=public`

## Prisma Commands

```bash
cd backend
npm run db:generate       # Regenerate Prisma Client
npm run db:migrate        # Create + apply migration (dev)
npm run db:migrate:deploy # Apply existing migrations (production)
npm run db:seed           # Seed initial data
npm run db:studio         # Open Prisma Studio (GUI)
```

## Backup & Restore

```bash
# Manual backup
./scripts/backup-postgres.sh

# List and restore
ls -lh backups/postgres/
./scripts/restore-postgres.sh backups/postgres/seethbot_20260212_100000.sql.gz

# Check backup service logs
docker-compose logs -f postgres-backup
```

Automated backups run daily via Docker Compose. Retention: 30 days daily, 8 weeks weekly, 6 months monthly. Stored in `./backups/postgres/`.

## pgAdmin (Optional)

```bash
docker-compose --profile admin up -d
# Access: http://localhost:5050
# Default: admin@seethbot.local / admin (change in production)
```

## Monitoring

```bash
docker-compose ps postgres
docker-compose logs -f postgres
docker-compose exec postgres psql -U seethbot -d seethbot -c "SELECT pg_size_pretty(pg_database_size('seethbot'));"
```

## Troubleshooting

```bash
# Can't connect
docker-compose logs postgres
docker-compose ps postgres

# Reset schema (WARNING: deletes all data)
docker-compose exec postgres psql -U seethbot -d seethbot -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
cd backend && npx prisma migrate reset
```

## Migrating from SQLite

```bash
docker-compose up -d postgres
./scripts/migrate-sqlite-to-postgres.sh   # exports SQLite → imports PostgreSQL
# Then update backend/.env DATABASE_URL and redeploy
./deploy.sh
```

The old `backend/prisma/dev.db` is preserved until PostgreSQL is confirmed working.

## Security Checklist

- [ ] Change `POSTGRES_PASSWORD` from default in `.env`
- [ ] Set `PGADMIN_DEFAULT_PASSWORD` if using pgAdmin
- [ ] PostgreSQL is isolated to Docker network (not exposed to internet)
- [ ] Test backup restoration
- [ ] Use `SEETHBOT_JWT_SECRET` and `SEETHBOT_API_KEYS` env vars (not defaults)
