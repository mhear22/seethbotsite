# Seethbotsite Improvement Plan

## Goals
1. Add comprehensive frontend tests for all page components
2. Break up oversized files (>500 lines) into smaller, testable modules
3. Improve overall webapp usability and code quality

## Project Context
- **Frontend:** Vue 3 + TypeScript + Pinia
- **Backend:** Express + TypeScript + SQLite/PostgreSQL
- **Test framework:** Vitest (frontend), existing tests in `frontend/tests/`
- **Test locations:** `frontend/tests/components/`, `frontend/tests/composables/`, `frontend/tests/repositories/`
- **Package manager:** pnpm (npm has a scoped-package installation bug on this host — use `pnpm install` and `pnpm exec vitest`)

## Pages Missing Frontend Tests (46 components)
- AboutPage, Achievements, AnalyticsPage, ApiDocsPage, ArchiveHistoryPage, AuthPage
- BatteryCalculatorPage, BusTrackerPage, CarPage, CatsPage, CharacterTinderPage, ClickerPage
- ClocksPage, CountdownPage, DailyChallenges, FavoritesPage, FishingPage, GenderPage
- GirlModePage, HomeLoanPage, HomePage, KeanuPage, MechBattlePage, MechBuilderPage
- MessagesPage, MoldPage, MoviePage, MusicPage, NotFoundPage, OpinionPage
- OrbitalMechanicsPage, PatchNotesPage, ProfilePage, QldRedistributionPage, RankingsPage
- SearchPage, SettingsPage, ShopPage, SolarPanelPage, StatsPage, StockMarket, TicketsPage
- VibeCodingPage, VideosPage, WordCloudPage

## Large Files to Refactor (>500 lines)
- `frontend/src/types/openapi.ts` — 8913 lines (auto-generated, skip)
- `frontend/components/pages/QldRedistributionPage.vue` — 3353→3205 lines
- `frontend/components/pages/OrbitalMechanicsPage.vue` — 1561 lines
- `frontend/components/pages/MechBattlePage.vue` — 1542 lines
- `frontend/components/pages/ShopPage.vue` — 1187 lines
- `frontend/components/pages/CharacterTinderPage.vue` — 996 lines
- `frontend/components/pages/TicketsPage.vue` — 992 lines
- `frontend/components/pages/HomeLoanPage.vue` — 988 lines
- `frontend/components/pages/ClickerPage.vue` — 938 lines
- `frontend/components/pages/SolarPanelPage.vue` — 912 lines
- `frontend/components/pages/ArchiveHistoryPage.vue` — 862 lines
- `frontend/components/pages/VibeCodingPage.vue` — 860 lines
- `frontend/components/pages/MechBuilderPage.vue` — 800 lines

## Agent Reminders
- ALWAYS update plan.md after every task or partial task
- ALWAYS check the run log first to see where the last run left off
- NEVER assume you know what's been done — read the plan fresh each run
- If you run out of tasks: update plan.md, commit, and reply with: "All tasks in plan.md are complete. @Mika needs to review and add new goals."
- Do NOT invent new tasks beyond what's listed — escalate to this chat instead
- Each run should end with a git commit (even if just updating plan.md)

## Current Progress
- [x] Started
- [x] Fixed test runner (pnpm install resolves npm scoped package bug)
- [x] NotFoundPage tests written and passing (8 tests)
- [x] QldRedistributionPage components extracted and tested (37 tests)
- [x] GenderPage, CatsPage, MusicPage tests (23 tests)
- [x] ClocksPage, KeanuPage, OpinionPage, MoldPage, WordCloudPage tests (25 tests)
- [x] AboutPage tests written and passing (10 tests)
- [ ] Next: Write tests for remaining ~36 pages
- [ ] Next: Refactor more large files (OrbitalMechanicsPage, MechBattlePage, etc.)

## Run Log
| Time | What Was Done | Status |
|------|---------------|--------|
| 2026-06-10 16:00 | Initial plan created | ✅ |
| 2026-06-10 16:00 | Added NotFoundPage.test.ts (blocked - vitest dependency issue) | 🛑 |
| 2026-06-10 16:20 | Fixed vitest: npm has scoped-package install bug on this host. Switched to pnpm. | ✅ |
| 2026-06-10 16:20 | NotFoundPage.test.ts fixed (wrapper.find instead of document.body.querySelector) — 8/8 passing | ✅ |
| 2026-06-10 16:22 | Extracted 5 components from QldRedistributionPage.vue (HeroSection, InfoCardsSection, MapModal, MapExpandedModal, BoothModal). File reduced from 3353→3205 lines. | ✅ |
| 2026-06-10 16:22 | Wrote 37 tests for extracted QldRedistributionPage components — all passing | ✅ |
| 2026-06-10 16:24 | GenderPage, CatsPage, MusicPage tests — 23 tests passing | ✅ |
| 2026-06-10 16:27 | ClocksPage, KeanuPage, OpinionPage, MoldPage, WordCloudPage tests — 25 tests passing | ✅ |
| 2026-06-10 16:54 | AboutPage tests — 10/10 passing | ✅ |
