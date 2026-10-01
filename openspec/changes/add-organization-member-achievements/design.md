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
- Competition date/year field, per-member user linkage, export/analytics beyond total/finalist/champion.
- Sidebar refactor into a shared component unless duplication blocks review (accepted duplication: update each page's `NAV`).

## Decisions

1. **Prisma model with plain strings, array names** — `memberNames String[]`, `assistantCode String`, `category String`, `customCategory String?`, `level String`, `result String`, `competitionName String`, timestamps; `@@index([category])`, `@@index([level])`, `@@index([result])`. Rationale: matches `Event.galleryImages String[]` precedent; strings keep `Other` free-text and future category additions migration-free. Alternative (Prisma enums + separate table): rejected — enum migration on every new category, overkill for 5 fixed values + free text.
2. **Effective-category rule in service, not DB constraint** — if `category == 'Other'` require `customCategory` (1–100 chars, trimmed) and expose `effectiveCategory = customCategory`; else ignore/`null` `customCategory`. Assistant code normalized `trim().toUpperCase()`, validated `/^[A-Z]{4}$/`. Rationale: single validation site (DTO + service) mirrors `EventsService` date checks; keeps DB simple.
3. **Champion bucket = `Champion` OR `1st Place`; Finalist bucket = `Finalist`** — counted in `DashboardService` via `count({ where: { result: { in: [...] } } })`. Rationale: requester's "2 detail total: finalist and champ" with result examples (`finalist, 2nd Place etc.`); 1st Place is semantically champion. Documented in spec so UI and API agree.
4. **Backend mirrors `events` module** — `achievements/` module with `achievements.controller.ts` (`GET /api/achievements` + `GET /api/achievements/:id` with `AuthenticatedGuard`; `POST/PUT/DELETE` with `AuthenticatedGuard, RolesGuard` + `@Roles('admin')`), `achievements.service.ts`, `dto.ts` (class-validator: `IsArray/ArrayMinSize`, `Matches`, `IsIn`, `ValidateIf`). Dashboard stats extended in the existing `Promise.all`. Rationale: least surprise, Swagger + guard behavior identical to events; no new auth primitive.
5. **Frontend after schema, before backend wiring (requester order)** — build `lib/achievements.ts` types + fetchers, `pages/Achievements.tsx` (table + search + category/level/result filters + pagination, Events-page styling), `pages/AchievementForm.tsx` (multi-name tag input, code input with uppercase transform, category dropdown + conditional Other text field, level/result dropdowns), routes `/achievements`, `/achievements/new`, `/achievements/:id/edit`, sidebar `NAV` + Trophy icon entries, dashboard KPI card (4th card or replace Drafts — default: add 4th card, grid `grid-cols-4` on xl / wrap). Rationale: honors requested build order; frontend types are written against the agreed DTO contract so wiring is mechanical. Develop against MSW/mocks until backend lands.
6. **Seeds: 5 sample rows** covering Hackathon/Champion/International, UI-UX/Finalist/National, Essay/2nd Place/National, SE/1st Place/International, Other (`Game Jam`)/3rd Place/National. Rationale: exercises every filter bucket and both KPI details on first run.

## Risks / Trade-offs

- [Risk] Frontend built before backend drifts from DTO contract → Mitigation: freeze field names/enums in spec; `lib/achievements.ts` imports the same literal unions; wiring task runs contract check first.
- [Risk] `Other` free-text sprawl (typos, duplicates) pollutes category analytics → Mitigation: trim + 100-char cap, display `customCategory` with `(Other)` suffix, search covers both fields; no dedup in v1 (noted non-goal).
- [Risk] `MOCK_DASHBOARD` in `Dashboard.tsx` hides KPI until rewire → Mitigation: wiring task deletes mock and restores `fetchDashboard()`; KPI verified against live API.
- [Risk] `memberNames` array ordering/duplicates → Mitigation: trim, drop empties, dedupe case-insensitively, keep input order.
- [Risk] Dashboard card grid overflow (3 → 4 cards) → Mitigation: responsive grid (`md:grid-cols-2 xl:grid-cols-4`); fallback to replacing Drafts card if design review prefers 3.

## Migration Plan

1. `prisma migrate dev --name add-achievement` + `prisma generate`; rollback via `prisma migrate resolve`/down-migration (drop table) — data loss accepted pre-launch (no prod rows yet).
2. Seed runs idempotently (`upsert` by competitionName+assistantCode or skip-if-exists) so re-seed is safe.
3. Deploy backend before frontend; old frontend ignores new stats fields; new frontend tolerates missing fields (`?? 0`).
4. Verify: `GET /api/achievements` 401 unauth, 403 as `user`, 200/201 as `admin`; dashboard counts match DB; sidebar route renders for both roles with correct action visibility.

## Open Questions

- None blocking. Future consideration (out of scope): competition year/date field for time-series analytics — would need spec amendment if requested.
