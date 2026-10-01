# Design

## Context

See proposal.md Why. Current state: NestJS + Prisma (Postgres) backend with `Event`/`MediumArticle` models and `events` module pattern (controller + service + class-validator DTOs, `AuthenticatedGuard` + `RolesGuard('admin')` for writes); React + React Router frontend with per-page `Sidebar` (`NAV` array in `Dashboard.tsx`, `Events.tsx`), `lib/dashboard.ts` + `DashboardService.getStats`, and `ProtectedRoute`. `Dashboard.tsx` currently renders from `MOCK_DASHBOARD` (auth unwired for FE testing) — achievements work must land on the live `fetchDashboard()` path.

## Goals / Non-Goals

**Goals:**
- Single `Achievement` table + admin-gated CRUD API reusing existing guard chain.
- Achievements list/form UI matching Events page UX (search, filter, pagination styling, delete confirm).
- Dashboard KPI extension without breaking existing stats fields.
- Ordered delivery per requester: schema/seed → frontend → backend wiring → security check.

**Non-Goals:**
- Public (unauthenticated) achievements feed; reads stay authenticated like dashboard.
- Image uploads / R2 storage for achievements (no image fields).
- Per-member user linkage, export/analytics beyond total/finalist/champion plus per-year counts.
- Sidebar refactor into a shared component unless duplication blocks review (accepted duplication: update each page's `NAV`).

## Decisions

1. **Prisma model with member rows, codes unique in DB** — `Achievement` holds competition fields (`category`, `customCategory?`, `level`, `result`, `competitionName`, `competitionYearMonth String YYYY-MM`, timestamps, indexes); members live in `AchievementMember` (`achievementId` FK cascade, `name`, `assistantCode @unique`). Rationale: one member ↔ one code is structural (no parallel-array drift), and `@unique` enforces cross-record code uniqueness at the DB level with a friendly 409 mapped in the service. Alternative (parallel `memberNames[]` + `assistantCodes[]`): rejected — index-drift bugs and no DB-enforceable element uniqueness.
2. **Member + category rules in service, not DB constraints** — 1+ members each with non-empty name and own code; codes normalized `trim().toUpperCase()`, validated `/^[A-Z]{4}$/`, unique within the submission and across records (409 on conflict, backed by `@unique`); if `category == 'Other'` require `customCategory` (1–100 chars, trimmed) and expose `effectiveCategory = customCategory`; year-month validated `/^\d{4}-(0[1-9]|1[0-2])$/`, stored verbatim. Rationale: single validation site (DTO + service) mirrors `EventsService` date checks; keeps DB simple beyond the uniqueness key.
3. **Champion bucket = podium (`1st`/`2nd`/`3rd Place`); Finalist bucket = `Finalist`** — no `Champion` result option exists; counted in `DashboardService` via `count({ where: { result: { in: [...] } } })`, plus `groupBy competitionYearMonth` for `achievementsByYear`. List ordering is `competitionYearMonth desc, updatedAt desc`. Documented in spec so UI and API agree.
4. **Backend mirrors `events` module** — `achievements/` module with `achievements.controller.ts` (`GET /api/achievements` + `GET /api/achievements/:id` with `AuthenticatedGuard`; `POST/PUT/DELETE` with `AuthenticatedGuard, RolesGuard` + `@Roles('admin')`), `achievements.service.ts`, `dto.ts` (class-validator: `IsArray/ArrayMinSize`, `Matches`, `IsIn`, `ValidateIf`). Dashboard stats extended in the existing `Promise.all`. Rationale: least surprise, Swagger + guard behavior identical to events; no new auth primitive.
5. **Frontend after schema, before backend wiring (requester order)** — build `lib/achievements.ts` types + fetchers, `pages/Achievements.tsx` (table + search + category/level/result/year filters + year-month sort + pagination, Events-page styling), `pages/AchievementForm.tsx` (per-member name + code rows with uppercase transform, category dropdown + conditional Other text field, level/result dropdowns without Champion, `type=month` year-month input), routes `/achievements`, `/achievements/new`, `/achievements/:id/edit`, sidebar `NAV` + Trophy icon entries, dashboard KPI row of exactly 3 cards (Total events, Total articles, Total achievements — the Drafts card is deleted, grid stays `grid-cols-3`). Rationale: honors requested build order; frontend types are written against the agreed DTO contract so wiring is mechanical. Develop against MSW/mocks until backend lands.
6. **Seeds: 5 sample rows** covering Hackathon/1st Place/International/`2026-09`, UI-UX/Finalist/National/`2026-05`, Essay/2nd Place/National/`2025-11`, SE/1st Place/International/`2025-08`, Other (`Game Jam`)/3rd Place/National/`2026-02`, each member with their own unique code. Rationale: exercises every filter bucket, both KPI details, and year filter/sort on first run.

## Risks / Trade-offs

- [Risk] Frontend built before backend drifts from DTO contract → Mitigation: freeze field names/enums in spec; `lib/achievements.ts` imports the same literal unions; wiring task runs contract check first.
- [Risk] `Other` free-text sprawl (typos, duplicates) pollutes category analytics → Mitigation: trim + 100-char cap, display `customCategory` with `(Other)` suffix, search covers both fields; no dedup in v1 (noted non-goal).
- [Risk] `MOCK_DASHBOARD` in `Dashboard.tsx` hides KPI until rewire → Mitigation: wiring task deletes mock and restores `fetchDashboard()`; KPI verified against live API.
- [Risk] `memberNames` array ordering/duplicates → Mitigation: trim, drop empties, dedupe case-insensitively, keep input order.
- [Risk] Drafts card removal surprises glanceable-draft users → Mitigation: identical numbers remain in the per-card Published/Draft breakdowns; no information is lost.

## Migration Plan

1. `prisma migrate dev --name add-achievement` + `prisma generate`; rollback via `prisma migrate resolve`/down-migration (drop table) — data loss accepted pre-launch (no prod rows yet).
2. Seed runs idempotently (`upsert` by competitionName+assistantCode or skip-if-exists) so re-seed is safe.
3. Deploy backend before frontend; old frontend ignores new stats fields; new frontend tolerates missing fields (`?? 0`).
4. Verify: `GET /api/achievements` 401 unauth, 403 as `user`, 200/201 as `admin`; year-month filter (`?yearMonth=2026-09`) narrows results; dashboard counts + `achievementsByYear` match DB; sidebar route renders for both roles with correct action visibility.
