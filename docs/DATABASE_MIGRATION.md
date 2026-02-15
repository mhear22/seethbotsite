# Database Migration: SQLite → PostgreSQL

Completed 2026-02-12. The project now uses PostgreSQL 16 via Docker Compose instead of SQLite files.

## What Changed

- `backend/prisma/schema.prisma` - provider changed to `postgresql`
- `backend/src/lib/prisma.ts` - removed SQLite adapter
- `docker-compose.yml` - PostgreSQL container, backup service, optional pgAdmin
- `.env.example` / `backend/.env.example` - PostgreSQL `DATABASE_URL` template
- `scripts/migrate-sqlite-to-postgres.sh` - one-time data migration
- `scripts/backup-postgres.sh` / `scripts/restore-postgres.sh` - backup tools

For full setup, configuration, and backup instructions, see **[POSTGRESQL_SETUP.md](POSTGRESQL_SETUP.md)**.
