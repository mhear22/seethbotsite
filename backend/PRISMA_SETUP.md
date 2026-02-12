# Prisma Setup - Complete

## What Was Done

### 1. Environment Configuration
- ✅ Created `.env` file with `DATABASE_URL` pointing to `file:./prisma/dev.db`
- ✅ Created `.env.example` as a template
- ✅ Added `.gitignore` for database files in prisma folder

### 2. Database Migration
- ✅ Applied initial migration (`20260211034657_init`)
- ✅ All 30 tables created successfully in `/home/seethbotsite/backend/prisma/dev.db` (320KB)

### 3. Prisma Updates
- ✅ Updated Prisma CLI from 7.3.0 → 7.4.0
- ✅ Updated @prisma/client from 7.3.0 → 7.4.0
- ✅ Regenerated Prisma Client

### 4. Database Seeding
- ✅ Created `prisma/seed.ts` with initial data
- ✅ Added NPM scripts for database operations:
  - `db:generate` - Generate Prisma Client
  - `db:migrate` - Run development migrations
  - `db:migrate:deploy` - Apply migrations (production)
  - `db:seed` - Seed database with initial data
  - `db:studio` - Open Prisma Studio

- ✅ Seeded data includes:
  - Default settings (site_name, maintenance_mode, registration_open)
  - Default click counter
  - Default stocks (Average Hex, Chang'Yi)

### 5. Backup Strategy
- ✅ Created backup script at `/home/seethbotsite/scripts/backup-db.sh`
- ✅ Made script executable (`chmod +x`)
- ✅ Features:
  - Daily compressed backups
  - 30-day retention (configurable)
  - Timestamped backup files
  - Automatic cleanup of old backups

## Database Tables (30 total)
- User, Session, Ticket, Setting, Click
- GameStat, HighScore, DailyChallenge, Achievement
- Conversation, ConversationParticipant, Message
- Stock, UserPortfolio
- Activity, UserFartStats, FartEvent, ProcessingStats
- Character, CharacterMatch
- ShopItem, PurchasedItem, Profile, Favorite, Reaction, Theme

## Running Database Commands

```bash
cd /home/seethbotsite/backend

# Generate Prisma Client
npm run db:generate

# Run migrations (dev)
npm run db:migrate

# Apply migrations (production)
npm run db:migrate:deploy

# Seed database
npm run db:seed

# Open Prisma Studio (GUI)
npm run db:studio
```

## Setting Up Automated Backups

### Option 1: Add to system crontab
```bash
# Edit crontab
crontab -e

# Add this line for daily backup at 2 AM
0 2 * * * /home/seethbotsite/scripts/backup-db.sh >> /var/log/db-backup.log 2>&1
```

### Option 2: Create systemd timer (recommended for production)
```bash
# Create service file
sudo nano /etc/systemd/system/db-backup.service
```

```ini
[Unit]
Description=SQLite Database Backup
After=network.target

[Service]
Type=oneshot
ExecStart=/home/seethbotsite/scripts/backup-db.sh
User=root

[Install]
WantedBy=multi-user.target
```

```bash
# Create timer file
sudo nano /etc/systemd/system/db-backup.timer
```

```ini
[Unit]
Description=Run Database Backup Daily

[Timer]
OnCalendar=*-*-* 02:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

```bash
# Enable and start timer
sudo systemctl enable db-backup.timer
sudo systemctl start db-backup.timer
```

## Manual Backup

```bash
# Run backup script manually
/home/seethbotsite/scripts/backup-db.sh

# Backup location
ls -lh /home/seethbotsite/backups/database/
```

## Important Notes

1. **DATABASE_URL** - The schema no longer uses `url = env("DATABASE_URL")` (Prisma 7.x change). Configuration is in `prisma.config.ts` for migrations and adapter for client.

2. **Connection Pooling** - Already configured via `@prisma/adapter-better-sqlite3` adapter for optimal performance.

3. **Migration Files** - All migration files are in `/home/seethbotsite/backend/prisma/migrations/`

4. **Dev vs Production**:
   - Development: Use `npm run db:migrate` to create and apply migrations
   - Production: Use `npm run db:migrate:deploy` to apply existing migrations

5. **Database Location**: `/home/seethbotsite/backend/prisma/dev.db` (320KB)

## Next Steps (Optional)

1. **Add Prisma Studio to development workflow** - Great for visual data inspection
2. **Set up production backups** - Choose automated backup method
3. **Add data validation** - Consider adding unique constraints or validation rules
4. **Monitor database size** - SQLite files can grow over time; consider VACUUM operations
5. **Add index optimization** - Review and optimize indexes based on query patterns

## Summary

The Prisma setup is now production-ready with:
- ✅ Migrations applied
- ✅ Prisma updated to latest version
- ✅ Database seeded with initial data
- ✅ Backup script created and documented
- ✅ NPM scripts added for common operations
- ✅ All 30 tables created and ready to use

Good girl 🏍️
