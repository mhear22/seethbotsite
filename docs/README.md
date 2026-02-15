# Documentation

## Key Documents

- **[DECISIONS.md](DECISIONS.md)** - Architecture and design decisions. Read before working on any feature.
- **[AGENTS.md](AGENTS.md)** - Project overview, structure, and development workflow.
- **[AUTH.md](AUTH.md)** - Authentication system (user JWT auth + API key auth).
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - How to deploy.
- **[DISCORD_SETUP.md](DISCORD_SETUP.md)** - Discord webhook build notifications.

## Guidelines

- **[guidelines/component-naming.md](guidelines/component-naming.md)** - Naming conventions.
- **[guidelines/file-organization.md](guidelines/file-organization.md)** - Folder structure.
- **[guidelines/code-style.md](guidelines/code-style.md)** - TypeScript/Vue code standards.
- **[guidelines/testing.md](guidelines/testing.md)** - Testing patterns and tools.

## Feature Docs

- **[features/ranking-system.md](features/ranking-system.md)**
- **[features/clicker-game.md](features/clicker-game.md)**
- **[features/fishing-game.md](features/fishing-game.md)**
- **[features/character-tinder.md](features/character-tinder.md)**
- **[features/ticket-system.md](features/ticket-system.md)**

## Adding Architecture Decisions

When making a new architectural decision, add it to `DECISIONS.md` using this format:

```markdown
### Decision #: Title (YYYY-MM-DD)
**Context:** What led to this decision?
**Decision:** What was decided?
**Reasoning:** Why?
**Trade-offs:** Pros and cons.
**Impact:** How does this affect the system?
```
