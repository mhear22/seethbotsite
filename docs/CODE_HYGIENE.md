# Code Hygiene

## Status (2026-02-05)

Hygiene review completed. No critical issues found.

- Frontend and backend build successfully with no TypeScript errors
- No TODO/FIXME comments in source code
- Code structure follows consistent patterns (controllers, services, repositories, composables)
- One-off migration scripts archived to `scripts/archive/` and `backend/scripts/archive/` (excluded from git)

## Standards

- No one-off scripts in project root - use `node cli.js` instead
- TypeScript strict typing throughout (auto-generated types from OpenAPI spec)
- Meaningful commit messages (conventional commit format)
- Scoped styles in Vue components

## Recommendations

- Add ESLint + Prettier for automated style enforcement
- Increase test coverage (currently manual + some automated)
- Consider GitHub Actions for CI on push
