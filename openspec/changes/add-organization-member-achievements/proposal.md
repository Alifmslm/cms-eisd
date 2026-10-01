# Proposal

## Why

Organization member competition wins (hackathons, UI/UX, essay, software engineering, etc.) are currently untracked, so the org cannot answer how many competitions were won, at what level, or in which category. A dedicated Achievements capability makes recording wins easy and surfaces totals on the dashboard.

## What Changes

- Add `Achievement` Prisma model + migration + seed examples covering all fields below.
- Add admin-only CRUD API `GET /api/achievements`, `POST /api/achievements`, `PUT /api/achievements/:id`, `DELETE /api/achievements/:id` behind existing `AuthenticatedGuard` + `RolesGuard('admin')` (read allowed for authenticated `user` role; writes return 403 for `user`).
- Add Achievements list page with search/filter, create/edit form, delete confirmation; multi-name input, 4-letter assistant-code input, category dropdown (Essay, UI/UX Competition, Software Engineering, Hackathon, Other + free-text when Other), level dropdown (International, National), achievement-result dropdown (Champion, 1st/2nd/3rd Place, Finalist, etc.), competition-name text field.
- Add sidebar navigation entry "Achievements" on Dashboard/Events/Articles/Achievements pages linking to `/achievements`.
- Extend `GET /api/dashboard` stats and Dashboard UI with a "Total achievements" KPI card showing breakdown: Finalist count and Champion count.
- Frontend API client `lib/achievements.ts`, routes `/achievements`, `/achievements/new`, `/achievements/:id/edit` behind `ProtectedRoute`.

## Capabilities

### New Capabilities

- `achievements`: member achievement records lifecycle — create, list/search/filter, update, delete, field validation (names, 4-letter assistant code, category + other-text, level, result, competition name), role-gated writes, seed data.

### Modified Capabilities

- `dashboard`: add total-achievements KPI (total + finalist detail + champion detail) to stats requirement and dashboard display; extend `GET /api/dashboard` response without changing existing event/article counts.

## Impact

- Backend: new `achievements` NestJS module (controller/service/DTOs), `Achievement` model migration, `DashboardService.getStats` extension, Swagger docs, seed update.
- Frontend: new pages (`Achievements`, `AchievementForm`), shared sidebar update, dashboard KPI card + types, API client, form validation for Other-category and assistant code.
- Security: reuses Better-Auth session + `AuthenticatedGuard`/`RolesGuard`; no new auth mechanism. Public (unauthenticated) event endpoints untouched.
