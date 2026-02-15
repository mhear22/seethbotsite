# Prisma Setup

Prisma ORM manages the SQLite database (migrated to PostgreSQL - see `docs/POSTGRESQL_SETUP.md`).

## Status

Initial migration applied (`20260211034657_init`). All 30 tables created. Database seeded with default data.

## Database Tables (30 total)

User, Session, Ticket, Setting, Click, GameStat, HighScore, DailyChallenge, Achievement, Conversation, ConversationParticipant, Message, Stock, UserPortfolio, Activity, UserFartStats, FartEvent, ProcessingStats, Character, CharacterMatch, ShopItem, PurchasedItem, Profile, Favorite, Reaction, Theme

## Commands

```bash
cd backend

npm run db:generate       # Regenerate Prisma Client after schema changes
npm run db:migrate        # Create + apply new migration (dev)
npm run db:migrate:deploy # Apply existing migrations (production)
npm run db:seed           # Seed with initial data
npm run db:studio         # Open Prisma Studio (visual DB browser)
```

## Backups

Automated daily backups via `scripts/backup-db.sh`. To set up:

```bash
# Option 1: crontab (daily at 2 AM)
crontab -e
# add: 0 2 * * * /home/seethbotsite/scripts/backup-db.sh >> /var/log/db-backup.log 2>&1

# Manual backup
/home/seethbotsite/scripts/backup-db.sh
ls -lh /home/seethbotsite/backups/database/
```

## Important Notes

- `DATABASE_URL` is configured in `prisma.config.ts` (not `schema.prisma`) due to Prisma 7.x changes
- Connection pooling via `@prisma/adapter-better-sqlite3`
- Dev: `npm run db:migrate` | Production: `npm run db:migrate:deploy`
- Seeded data: default settings, click counter, initial stocks
