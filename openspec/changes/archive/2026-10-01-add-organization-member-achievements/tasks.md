# Tasks

## 1. Schema, Migration & Seeds

- [x] 1.1 Add `Achievement` Prisma model (memberNames String[], assistantCode, category, customCategory?, level, result, competitionName, competitionYearMonth `YYYY-MM`, timestamps + indexes including competitionYearMonth) and create migration via `prisma migrate dev --name add-achievement`; verify with `prisma validate` and `prisma generate` succeeding.
- [x] 1.2 Add idempotent seed rows (5 samples with distinct year-months covering Hackathon/Champion/International, UI-UX/Finalist/National, Essay/2nd Place, SE/1st Place, Other+custom text) and verify with seed script run showing rows in DB (`prisma studio` or `SELECT count(*) FROM "Achievement"` returns 5).

## 2. Frontend (Pages, Sidebar, Dashboard KPI)

- [x] 2.1 Create `lib/achievements.ts` (types, fetchers for list/get/create/update/delete, filter params) matching the spec DTO contract and verify with `tsc --noEmit` / frontend typecheck passing.
- [x] 2.2 Build `Achievements` list page (search + category/level/result/year filters, year-month sort, pagination, delete-confirm dialog) with `admin`-only create/edit/delete controls and verify by rendering list with mock data showing filters narrow results and `user` role hides write actions.
- [x] 2.3 Build `AchievementForm` page (multi-name input, 4-letter code with uppercase transform, category dropdown + conditional Other text field, level/result dropdowns, competition name, required `type=month` year-month input, inline validation) and verify by submitting valid + invalid inputs showing field errors for empty names, bad code, Other-without-text, and bad month.
- [x] 2.4 Add routes `/achievements`, `/achievements/new`, `/achievements/:id/edit` behind `ProtectedRoute` and sidebar Achievements entry (Trophy icon) on all pages; verify by navigating to each route as authenticated user and sidebar link lands on `/achievements`.
- [x] 2.5 Add dashboard Total-achievements KPI card (total + Finalist + Champion breakdown), delete the Drafts card so the KPI row is exactly 3 cards (grid back to `grid-cols-3`), and extend `DashboardResponse` type; verify against mock stats showing correct totals and `?? 0` empty state.

## 3. Backend Wiring

- [ ] 3.1 Implement `achievements` NestJS module (DTOs with class-validator rules per spec: member pairs with own codes, year-month `@Matches`, service with normalization + effective-category logic + 409 on duplicate code + 404/400 handling, controller with `GET` list/detail including members + `POST/PUT/DELETE` + year/year-month query filters) and register in `AppModule`; verify with `nest build` succeeding and Swagger showing the four endpoints.
- [ ] 3.2 Extend `DashboardService.getStats` with `totalAchievements`, `finalistAchievements` (Finalist), `championAchievements` (1st + 2nd + 3rd Place), and `achievementsByYear` group-by in the same query batch; verify with service test or manual `GET /api/dashboard` returning new fields alongside unchanged event/article counts.
- [ ] 3.3 Wire frontend to live API (replace `MOCK_DASHBOARD` with `fetchDashboard()`, connect achievements pages to real endpoints, handle loading/error/empty states) and verify with backend running showing real seeded rows in list and KPI.

## 4. Security & Integration Checks

- [ ] 4.1 Verify role matrix via HTTP: unauthenticated `GET/POST/PUT/DELETE /api/achievements` → 401; `user` role reads → 200 but writes → 403; `admin` full CRUD → 2xx; verify by running the request matrix against a live backend and recording results.
- [ ] 4.2 Verify validation + dashboard accuracy end-to-end: create Other-without-text → 400, bad year-month → 400, duplicate code → 409, lowercase code stored uppercase, year filter narrows list, update/delete round-trip, dashboard champions (1st–3rd) + finalist counts + `achievementsByYear` match DB queries; verify with scripted API calls plus dashboard screenshot showing matching KPI.

## 5. Member-Code + Result Rework (Champion removed, per-member unique codes)

- [x] 5.1 Migrate schema to `AchievementMember` table (`assistantCode @unique`, cascade delete), reseed with per-member codes and `1st Place` replacing `Champion`, and verify with `prisma validate`, seed run twice (second run 0 created), and member count query.
- [x] 5.2 Rework frontend types, fixtures, list page (podium champion math), form (per-member name+code rows, no Champion option), and dashboard mock (champions 4, finalists 1); verify with `tsc --noEmit` and frontend build passing.
