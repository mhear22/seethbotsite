# Ticket System

## Overview

The Ticket System is a project management and issue tracking tool built into the application. It handles feature requests, bug reports, and task management with a complete workflow from submission to completion.

## Core Concepts

### Ticket Types

- **Feature**: New functionality or enhancements
- **Bug**: Software defects or unexpected behavior
- **Task**: General work items or chores
- **Documentation**: Documentation updates or improvements

### Priority Levels

- **HIGH**: Urgent, important issues
- **MEDIUM**: Normal priority items
- **LOW**: Nice-to-have features or issues

### Status Workflow

Tickets progress through several states:

```
pending → in_progress → review → done
         ↓           ↓        ↓
      blocked   cancelled  reopened
```

#### Status Descriptions

- **pending**: New ticket, not yet started
- **in_progress**: Currently being worked on
- **review**: Work complete, awaiting review
- **done**: Completed and verified
- **blocked**: Waiting on dependencies or external factors
- **cancelled**: No longer relevant or needed
- **reopened**: Previously done, now needs more work

## Workflow

### 1. Ticket Submission

Anyone can submit a ticket with:
- **Title**: Brief description of the issue/feature
- **Description**: Detailed explanation
- **Type**: Feature, bug, task, or documentation
- **Priority**: HIGH, MEDIUM, or LOW
- **Category**: Optional categorization
- **Tags**: Optional labels
- **Dependencies**: Related tickets (optional)

### 2. Grooming & Triage

Tickets are reviewed and groomed:
- Clarify requirements
- Set proper priority
- Add dependencies if needed
- Assign to appropriate category
- Estimate effort

### 3. Assignment

Tickets are assigned to developers:
- Based on expertise
- Based on availability
- Based on team workload

### 4. Development

Developers work on tickets:
- Move to `in_progress`
- Make code changes
- Test changes locally
- Document implementation

### 5. Code Review

Changes are reviewed:
- Code quality checks
- Testing verification
- Documentation review
- Edge case analysis

### 6. Completion

Tickets are marked done:
- Move to `review` status
- After approval, move to `done`
- Close any related tickets
- Update documentation

## Dependencies

### Ticket Dependencies

Tickets can depend on other tickets:

```json
{
  "dependencies": [10, 15, 20]
}
```

This means:
- Ticket must wait for dependencies #10, #15, and #20 to complete
- Dependent tickets auto-set to `blocked` status
- Blocked tickets are unblocked when dependencies complete

### Dependency Validation

- Circular dependencies are prevented
- Dependency tickets must exist
- Dependencies can't be deleted while referenced

### Blocking Status

A ticket is blocked if:
- It has incomplete dependencies
- Any dependency is not in `done` status

## API Endpoints

### List Tickets
```
GET /api/tickets
```

Returns a list of tickets with optional filtering.

**Query Parameters:**
- `status`: Filter by status
- `type`: Filter by type
- `priority`: Filter by priority
- `creator_id`: Filter by creator
- `blocked`: Filter blocked/unblocked tickets

**Response:**
```json
{
  "tickets": [
    {
      "id": 218,
      "title": "Documentation: Feature docs",
      "description": "Create feature documentation...",
      "status": "pending",
      "response": null,
      "creator_id": "user123",
      "type": "feature",
      "priority": "high",
      "tags": null,
      "category": null,
      "dependencies": [],
      "blocked": false,
      "created_at": "2026-02-07 12:39:35",
      "updated_at": "2026-02-07 12:39:35"
    }
  ]
}
```

### Get Single Ticket
```
GET /api/tickets/:id
```

Returns a single ticket by ID.

**Response:** Same as list, but single ticket object.

### Create Ticket
```
POST /api/tickets
```

Creates a new ticket.

**Request Body:**
```json
{
  "title": "Fix login bug",
  "description": "Users cannot log in with special characters in password",
  "creator_id": "user123",
  "type": "bug",
  "priority": "high",
  "category": "auth",
  "tags": "urgent,security",
  "dependencies": []
}
```

**Response:**
```json
{
  "id": 219,
  "title": "Fix login bug",
  "description": "Users cannot log in with special characters in password",
  "status": "pending",
  "creator_id": "user123",
  "type": "bug",
  "priority": "high",
  "category": "auth",
  "tags": "urgent,security",
  "dependencies": [],
  "blocked": false,
  "created_at": "2026-02-08 12:00:00",
  "updated_at": "2026-02-08 12:00:00"
}
```

### Update Ticket
```
PUT /api/tickets/:id
```

Updates an existing ticket.

**Request Body:**
```json
{
  "status": "in_progress",
  "response": "Working on the fix now"
}
```

**Response:** Updated ticket object.

### Delete Ticket
```
DELETE /api/tickets/:id
```

Soft-deletes a ticket (sets `is_deleted` flag).

**Response:**
```json
{
  "message": "Ticket deleted successfully"
}
```

## Grooming Workflow

### Grooming Steps

1. **Review New Tickets**: Check `pending` tickets
2. **Clarify Requirements**: Ask questions if unclear
3. **Set Priority**: Assign appropriate priority level
4. **Add Dependencies**: Link related tickets
5. **Categorize**: Assign to appropriate category
6. **Estimate Effort**: Add time estimates (optional)
7. **Assign**: Assign to developer (optional)

### Grooming CLI

The ticket system includes grooming commands:

```bash
# List tickets needing grooming
node cli.js ticket list --status pending

# Update ticket status
node cli.js ticket update --id 218 --status in_progress

# Mark ticket complete
node cli.js ticket complete --id 218 --response "Implemented successfully"
```

## Branch Workflow

### Ticket Branches

The system supports ticket-based branching:

```bash
# Create a new branch for a ticket
./scripts/setup-ticket-branch.sh

# Script outputs:
# READY:ticket-218-documentation-feature-docs:218:/home/seethbotsite/worktrees/ticket-218
```

This:
- Creates a new branch: `ticket-<id>-<slug>`
- Creates a git worktree: `/home/seethbotsite/worktrees/ticket-<id>`
- Checks out the new branch

### Commit Messages

Standard commit message format:

```
Fixes #<ticket-id>: <brief description>
```

Example:
```
Fixes #218: Create feature documentation for all major features
```

### Merge Process

1. Work in ticket branch
2. Test changes locally
3. Commit with "Fixes #<id>" message
4. Push to origin
5. Create PR or merge directly
6. Mark ticket complete via CLI

## Analytics & Stats

### Ticket Statistics

The system tracks:
- Total tickets by status
- Total tickets by type
- Total tickets by priority
- Blocked tickets count
- Tickets by creator
- Tickets by category

### Querying Stats

```bash
# Get ticket statistics
node cli.js ticket stats

# Filter by type
node cli.js ticket stats --type feature

# Filter by status
node cli.js ticket stats --status pending
```

## Database Schema

### Tickets Table

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
  dependencies TEXT,  -- JSON array
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_deleted INTEGER DEFAULT 0,
  blocked INTEGER DEFAULT 0
)
```

### Indexes

```sql
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_type ON tickets(type);
CREATE INDEX idx_tickets_priority ON tickets(priority);
CREATE INDEX idx_tickets_creator ON tickets(creator_id);
```

## Service Architecture

### Core Services

- **TicketsService**: Main CRUD operations
- **TicketsAdminService**: Admin-specific operations
- **TicketsFilterService**: Filtering and querying
- **TicketsStatsService**: Statistics and analytics
- **TicketsDB**: Database operations

### Controller

The main controller (`tickets.controller.ts`) handles:
- HTTP request routing
- Input validation
- Response formatting
- Error handling

## Best Practices

### Ticket Creation

- **Clear titles**: Be specific and concise
- **Detailed descriptions**: Include context and requirements
- **Proper typing**: Use appropriate ticket types
- **Priority assignment**: Don't overuse HIGH priority

### Dependency Management

- **Minimal dependencies**: Only depend on what's necessary
- **Clear relationships**: Document why dependencies exist
- **Avoid circular deps**: Prevent blocking cycles

### Status Management

- **Update promptly**: Move tickets as they progress
- **Don't skip states**: Follow the workflow
- **Use blocked wisely**: Only block when truly waiting

### Commit Hygiene

- **Standard format**: Use "Fixes #<id>" in commit messages
- **Atomic commits**: One logical change per commit
- **Describe changes**: Explain what and why, not just how

## Use Cases

1. **Feature Development**: Track new features from idea to release
2. **Bug Tracking**: Log and resolve software defects
3. **Task Management**: Manage general work items
4. **Documentation**: Track documentation improvements
5. **Release Planning**: Group tickets for releases

## Related Features

- [Character Tinder](./character-tinder.md) - Could track voting history as tickets
- [Stats System](./fishing-game.md#stats-integration) - Could extend stats to tickets
- [Activity Feed](./ranking-system.md) - Ticket activity can appear in feed

## CLI Commands

### Ticket Management

```bash
# List tickets
node cli.js ticket list

# List by status
node cli.js ticket list --status pending

# Create ticket
node cli.js ticket create --title "New feature" --type feature

# Update ticket
node cli.js ticket update --id 218 --status in_progress

# Complete ticket
node cli.js ticket complete --id 218 --response "Done!"

# Delete ticket
node cli.js ticket delete --id 218

# Get statistics
node cli.js ticket stats

# Groom tickets
node cli.js ticket groom
```

## Future Enhancements

Potential additions:
- **Assignees**: Track who is working on what
- **Comments**: Add discussion to tickets
- **Attachments**: Upload screenshots or files
- **Time tracking**: Track hours spent
- **Milestones**: Group tickets by release
- **Webhooks**: Notify external systems
- **Bulk operations**: Update multiple tickets at once
