# Proposal

## Why

The backend is finished enough to be the answer key, and that is exactly why it has to go. The owner wants to hand friends a greenfield backend project to learn on — not for technical reasons, but as a teaching gift. The current NestJS backend (V1 change `v1-headless-cms`, 59/70 tasks done, working) plus the mock-capable frontend and the Prisma schema already contain everything a learner needs except the backend itself. Why now: the reference implementation exists to be tagged and shelved, and the frontend already runs backend-free (`VITE_USE_MOCKS` defaults to mocks), so the starter is viable today.

## What Changes

- **BREAKING**: Delete the entire NestJS backend implementation under `apps/backend/` — `src/` (auth, events, articles, storage, dashboard, prisma service), `package.json`, `nest-cli.json`, `tsconfig.json`, build output `dist/`, and installed `node_modules/`.
- **BREAKING**: No API will exist after this change. Every frontend call under `VITE_API_URL` (`/api/events`, `/api/articles`, `/api/auth`, dashboard, storage upload) will have no server until a learner rebuilds it. The frontend stays usable because it already falls back to `src/mocks/*.fixtures.ts`.
- Preserve the database schema: `apps/backend/prisma/schema.prisma` currently lives *inside* the deleted tree, so relocate it (proposed: `packages/db/prisma/schema.prisma`) including the `User`/`Session`/`Account`/`Verification` (better-auth), `Event`, `MediumArticle`, and `Achievement`/`AchievementMember` models. Decide migration-file fate in design (keep as reference vs. regenerate).
- Keep `apps/frontend/` untouched — it is the assignment's test harness.
- Keep `docker-compose.yml` (Postgres) verified working so learners get a database with one command.
- Tag the current working backend in git (e.g., `v1-backend-reference`) *before* deletion so the answer key is recoverable by the owner but not sitting in the working tree.
- Add a `CHALLENGE.md` starter brief at repo root: how to run the frontend on mocks, the API contract to satisfy, and the V1 success criteria (from `PLAN_V1.md`) as the definition of done.
- Keep `openspec/specs/` (auth, dashboard, achievements), `PLAN_V1.md`, and `README.md` as assignment reading — product requirements do not change; learners rebuild *toward* them.
- Known scope wrinkle (assumption, recorded): `schema.prisma` contains `Achievement` models that were never in the V1 plan. The starter keeps them and marks achievements as stretch scope rather than silently dropping tables.

## Capabilities

### New Capabilities

- `backend-starter`: the starter-repo state after the nuclear reset — what is removed, what is preserved (frontend, relocated schema, Postgres via compose, contract docs), and the conditions under which the starter is accepted as ready for learners.

### Modified Capabilities

- None. Product requirements are unchanged — the whole point is that existing specs (`auth`, `dashboard`, `achievements`, plus the `v1-headless-cms` change specs) become the rebuild target rather than living documentation of a shipped backend.

## Impact

- Affected code: `apps/backend/` (deleted, except schema relocated to `packages/db/`); `apps/frontend/` (no changes, verified mock-only boot); `docker-compose.yml` (kept, verified); new `CHALLENGE.md`; new spec `backend-starter` on archive/sync.
- Affected workflow: local dev loses the API (`VITE_USE_MOCKS=false` will fail until a new backend exists); seed scripts and backend deploy steps are dead until rebuilt.
- Dependencies removed from the working tree: NestJS, Prisma client wiring, better-auth server, S3/R2 SDK, sharp, OG-scraper — all remain documented as the *expected* rebuild surface via the contract docs, not as installed code.
- No production impact: the project is pre-release (V1 planning/implementation stage) with no deployed consumers beyond local development.
