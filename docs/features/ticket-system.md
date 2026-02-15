# Ticket System

Internal project management and issue tracking. Use `node cli.js` for all ticket operations.

## Types & Priority

- **Types:** feature, bug, task, documentation
- **Priority:** high, medium, low

## Status Workflow

```
pending → in_progress → review → done
         ↓           ↓
      blocked   cancelled
```

A ticket is `blocked` if any of its `dependencies` are not `done`.

## CLI

```bash
node cli.js ticket list                              # All tickets
node cli.js ticket list --status pending             # Filter by status
node cli.js ticket show --id 218                     # Details
node cli.js ticket update --id 218 --status in_progress
node cli.js ticket complete --id 218 --response "Done!"
node cli.js ticket decline --id 218 --response "Won't do"
```

## API

```
GET    /api/tickets              # List (query: status, type, priority, blocked)
GET    /api/tickets/:id          # Single ticket
POST   /api/tickets              # Create { title, description, type, priority, tags, category, dependencies }
PUT    /api/tickets/:id          # Update { status, response, ... }
DELETE /api/tickets/:id          # Soft delete (is_deleted flag)
```

## Database Schema

```sql
CREATE TABLE tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  response TEXT,
  creator_id TEXT,
  type TEXT DEFAULT 'feature',
  priority TEXT DEFAULT 'medium',
  tags TEXT,
  category TEXT,
  dependencies TEXT,   -- JSON array of ticket IDs
  blocked INTEGER DEFAULT 0,
  is_deleted INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## Commit Convention

```
Fixes #218: Brief description of change
```

## Branch Workflow

```bash
# Create ticket branch
./scripts/setup-ticket-branch.sh   # creates ticket-218-slug branch + worktree

# Work, commit, push
git commit -m "Fixes #218: description"
git push origin ticket-218-feature-name
node cli.js ticket complete --id 218 --response "Done"
```

## Services

- `TicketsService` - CRUD
- `TicketsAdminService` - Admin ops
- `TicketsFilterService` - Filtering/querying
- `TicketsStatsService` - Statistics
