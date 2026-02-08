# Seethbot Site

A playful, interactive personal website with a variety of features and games.

## Quick Links

- 📚 [Documentation](docs/README.md) - Start here!
- 🚀 [Deployment Guide](DEPLOYMENT.md)
- 🤖 [Agent Development Guide](AGENTS.md)
- 🔐 [Authentication Guide](AUTH.md)

## Quick Start

### Development

```bash
# Frontend development server
cd frontend/
npm run dev

# Backend development server
cd backend/
npm run dev
```

### Production Build

```bash
# Quick deploy
./deploy.sh

# Manual steps
cd frontend && npm run build
cd ../backend && npm run build
docker build -t seethbot-app .
docker run -d -p 80:80 --name seethbot-server seethbot-app
```

## CLI Tool

This project includes a unified CLI tool for common operations. Located at `cli.js` in the project root.

### Basic Commands

```bash
# Show help
node cli.js --help

# Show system status
node cli.js status
```

### Ticket Management

```bash
# List all tickets
node cli.js ticket list

# List pending tickets
node cli.js ticket list --status pending

# List tickets with limit
node cli.js ticket list --limit 10

# Show ticket details
node cli.js ticket show --id 128

# Complete a ticket
node cli.js ticket complete --id 128 --response "Fixed the issue"

# Decline a ticket
node cli.js ticket decline --id 128 --response "Won't implement"

# Update ticket priority
node cli.js ticket update --id 128 --priority high
```

### CLI Features

- **Colored output:** Easy-to-read terminal messages with status indicators
- **Flexible filtering:** Filter tickets by status, limit results
- **Help documentation:** Built-in help for all commands
- **API integration:** Direct communication with backend ticket system

## Project Structure

```
.
├── frontend/           # Vue 3 + TypeScript frontend
├── backend/            # Node.js + Express backend
├── docs/               # Project documentation
├── scripts/            # Utility scripts
│   └── archive-root/   # Archived root-level scripts
├── cli.js              # Unified CLI tool
├── deploy.sh           # Deployment script
└── README.md           # This file
```

## Key Features

- **Multi-route SPA:** Home, rankings, cats, stocks, movies, and more
- **Dark mode:** Toggle between light and dark themes
- **Interactive games:** Stock market simulation, movie voting
- **Real-time data:** Rankings, cats, live feeds
- **Audio system:** Background music, sound effects

## Documentation

All developers and agents should read the documentation before working on the codebase:

1. **[docs/README.md](docs/README.md)** - Start here! Overview of all documentation
2. **[docs/DECISIONS.md](docs/DECISIONS.md)** - Architectural decisions and reasoning
3. **[AGENTS.md](AGENTS.md)** - Development workflow and patterns
4. **[DEPLOYMENT.md](DEPLOYMENT.md)** - How to deploy changes

## Development Workflow

### For Sub-Agents

1. Check ticket status with CLI: `node cli.js ticket list --status pending`
2. Read relevant documentation
3. Work on the ticket (branch, code changes, test)
4. Commit and push
5. Mark complete: `node cli.js ticket complete --id 128 --response "Done"`

### Git Workflow

```bash
# Create feature branch
git checkout -b ticket-128-feature-name

# Make changes
git add .
git commit -m "Fixes #128: Brief description"
git push origin ticket-128-feature-name
```

## Tech Stack

- **Frontend:** Vue 3, TypeScript, Vite, Pinia, Vue Router
- **Backend:** Node.js, Express, TypeScript
- **Database:** SQLite
- **Deployment:** Docker, Nginx

## Important Notes

- **Root-level scripts:** Do NOT create new utility scripts in project root. Use `node cli.js` instead
- **Documentation first:** Always read documentation before implementing features
- **Commit messages:** Follow conventional commit format (feat:, fix:, docs:, etc.)
- **Testing:** Test all routes and features before deploying

## License

Internal project - not for public distribution.

---
*Last updated for ticket workflow test*
