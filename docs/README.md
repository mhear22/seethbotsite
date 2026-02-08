# Documentation

This folder contains documentation for the seethbotsite project. All developers and agents should read these documents before working on the codebase.

## 📂 Documents

### DECISIONS.md ⭐ (READ THIS FIRST!)
**Purpose:** Records all major architectural and design decisions made during development.

**When to read:** BEFORE working on ANY feature or modification.

**What's inside:**
- Architecture & Tech Stack decisions
- Authentication & Authorization choices
- Database & Data Storage strategy
- Frontend Architecture patterns
- Backend Architecture structure
- Features & Game Systems design
- Deployment & Infrastructure setup
- Testing & Quality Assurance approach
- Performance & Optimization decisions
- Security Decisions

**Key sections:**
- Why Vue 3 + TypeScript + Vite?
- Dual authentication system (User Auth + API Key Auth)
- SQLite for all data storage
- Docker multi-stage builds
- Optional user accounts
- Daily challenges & achievements
- RESTful API design
- Security best practices

**Why it matters:** Understanding the context and reasoning behind decisions prevents you from making choices that conflict with the existing architecture. It also helps you understand the trade-offs and constraints of the current implementation.

---

## 📋 Development Guidelines

The `guidelines/` folder contains coding standards and best practices for maintaining consistency across the codebase.

### Available Guidelines

- **[Component Naming](guidelines/component-naming.md)** - Naming conventions for components, utilities, stores, and composables
- **[File Organization](guidelines/file-organization.md)** - Standard folder structure and file placement guidelines
- **[Code Style](guidelines/code-style.md)** - TypeScript, Vue.js, and JavaScript best practices
- **[Testing](guidelines/testing.md)** - Testing patterns, coverage goals, and best practices

### When to Read Guidelines

- **Before starting new features** - Ensure your code follows established patterns
- **During code reviews** - Verify adherence to standards
- **Onboarding new developers** - Provide consistency for team members
- **Refactoring** - Maintain style consistency across changes

---

## 🔗 Other Documentation

The following documentation is located in the project root:

### AUTH.md
Authentication & Authorization Guide
- User Authentication (optional username/password)
- API Key Authentication
- Endpoints (public vs protected)
- Security details

### DEPLOYMENT.md
Deployment Guide
- Quick deploy script
- Manual deploy steps
- Environment variables
- Troubleshooting

### DISCORD_SETUP.md
Discord Build Notifications
- Webhook setup instructions
- Notification stages
- Troubleshooting

### AGENTS.md
Main Development Documentation
- Project overview
- Current architecture
- Project structure
- Application features
- State management
- Development workflow
- Testing checklist
- Migration history

---

## 📖 How to Use This Documentation

### For New Features:

1. **READ `docs/DECISIONS.md`** - Understand existing decisions and patterns
2. Read relevant sections (e.g., Authentication, Database, Features)
3. Check if your feature aligns with existing architecture
4. Follow established patterns (composables, repositories, controllers)
5. Update DECISIONS.md if you make new architectural decisions

### For Bug Fixes:

1. Read relevant sections of DECISIONS.md to understand the design
2. Check related documentation (AUTH.md, DEPLOYMENT.md)
3. Look at existing code that implements similar functionality
4. Fix the bug while respecting the original design decisions

### For Code Reviews:

1. Check if new code follows established patterns
2. Verify that architectural decisions are respected
3. Ensure documentation is updated for any new decisions
4. Look for consistency with existing codebase

---

## 📝 Updating Documentation

### When to Update DECISIONS.md:

- You make a new architectural decision
- You change an existing architectural pattern
- You introduce a new major feature with design decisions
- You refactor a significant part of the system

### How to Update:

1. Add a new decision section at the end
2. Include context, decision, reasoning, trade-offs, and impact
3. Use consistent format: "### Decision #: Title (Date)"
4. Update the summary section if needed
5. Update the "Last Updated" date

### Format Example:

```markdown
### Decision #: Title (YYYY-MM-DD)
**Context:** What problem or situation led to this decision?

**Decision:** What was decided?

**Reasoning:** Why was this decision made?

**Trade-offs:**
- Pro 1
- Pro 2
- Con 1
- Con 2

**Impact:** How does this affect the system?
```

---

## 🎯 Quick Reference

| Question | Document | Section |
|----------|----------|---------|
| Why this tech stack? | DECISIONS.md | Architecture & Tech Stack |
| How does auth work? | AUTH.md | Overview |
| How do I deploy? | DEPLOYMENT.md | Quick Deploy |
| What are the design patterns? | DECISIONS.md | All sections |
| How does the database work? | DECISIONS.md | Database & Data Storage |
| What's the API structure? | DECISIONS.md | Backend Architecture |
| How do features work? | DECISIONS.md | Features & Game Systems |

---

**Remember:** Documentation is a living document. Keep it updated as the project evolves!

---

*Last Updated: 2026-02-06*
