# Design

## Context

See `proposal.md` for motivation. The current state shaping this design:

- `apps/backend/` is a working NestJS service: `src/` with six modules (auth, events, articles, storage, dashboard, prisma), plus `package.json`, `nest-cli.json`, `tsconfig.json`, `dist/`, `node_modules/`, and `prisma/` (`schema.prisma`, `migrations/`, `seed.ts`). The schema file lives *inside* the tree slated for deletion — relocation is mandatory, not optional.
- `apps/frontend/src/` already runs without any server: `lib/events.ts` defaults to `VITE_USE_MOCKS` fixtures with backend fallback, and `src/mocks/` covers events, articles, and achievements. The frontend is the assignment's test harness, not a migration subject.
- The monorepo has `packages/shared/` (currently empty) and `pnpm-workspace.yaml`; root scripts may reference the backend and will rot after deletion if not cleaned.
- `docker-compose.yml` provides Postgres; its exact services are verified during implementation, not assumed here.
- The V1 change `v1-headless-cms` (59/70 tasks) plus `openspec/specs/` (auth, dashboard, achievements) and `PLAN_V1.md` are the rebuild target and stay untouched.

## Goals / Non-Goals

**Goals:**

- Leave a starter that boots (frontend on fixtures, database via compose) with zero backend residue in the working tree.
- Preserve the exact data model and the exact product requirements as learner input.
- Keep the reference implementation recoverable by the owner with a single git operation.
- Document the rebuild contract once, derived from the frontend's actual integration points, so learners never guess endpoint shapes.

**Non-Goals:**

- No hollow starter with TODO scaffolding or failing tests — the user explicitly chose nuclear over guided (see Decisions).
- No framework prescription for the rebuild — the starter does not contain a new backend skeleton in any stack.
- No changes to frontend behavior, styling, or fixtures to accommodate the reset.
- No production migration — nothing is deployed; rollback is purely git-local.

## Decisions

### 1. Schema relocates to `packages/db/prisma/schema.prisma`

**Why:** `packages/` is the monorepo's existing home for shared, app-independent code (`packages/shared/` already exists), while `apps/` holds runnable processes. A database schema is shared input to any future backend, so it belongs under `packages/`, not stranded at repo root or inside a deleted app. The `db` package name leaves room for future shared Prisma client wiring without committing to it now.

**Alternatives considered:**
- Repo-root `prisma/schema.prisma` — flatter, but root accumulates config; rejected to keep root for docs/compose only.
- Leaving a slim `apps/backend/prisma/` behind — rejected; a surviving `apps/backend/` directory suggests a backend still lives there and invites confusion.

### 2. Starter keeps `schema.prisma` only; migrations and seed stay in the tagged reference

**Why:** Learners studying Prisma benefit most from running their first `prisma migrate dev` against the schema themselves — checked-in migration history from the reference implementation would pin them to someone else's timeline and could conflict with whatever stack they choose. `seed.ts` is genuinely useful demo data, but it imports the old server's assumptions; `CHALLENGE.md` points learners at the tag for reference instead of shipping a possibly-bitrotting script.

**Alternatives considered:**
- Moving `migrations/` + `seed.ts` alongside the schema — kept the starter closer to runnable, but couples learners to reference history; rejected.
- Deleting migrations with no pointer — loses the reference value; rejected in favor of tag + docs pointer.

### 3. Delete `apps/backend/` entirely, no placeholder

**Why:** An empty directory with a README ("rebuild me here") reads as a framework-shaped hole and subtly prescribes where the new backend lives. Nuclear means nuclear: learners choose location, stack, and structure. (Git does not track empty dirs anyway, so a placeholder would need a junk file to survive.)

**Alternatives considered:**
- Hollow NestJS module shells with TODOs — the guided-classroom option from exploration; explicitly rejected per the user's "let them figure it out."
- Keeping `apps/backend/README.md` as a tombstone — marginal value once `CHALLENGE.md` exists at root; rejected to avoid two sources of truth.

### 4. Reference preservation: annotated tag first, clean-tree handoff recommended

**Why:** The deletion must be reversible for the owner but not trivially reversible for learners. Sequence: commit a clean pre-delete state, create annotated tag `v1-backend-reference`, then delete. For handoff, the recommendation is exporting a history-squashed tree (fresh repo or orphan branch) so the tag — and the full answer key in history — is not sitting in the repo friends clone. If the owner prefers open-book learning, pushing the tag alongside is a one-flag choice, not a redesign.

**Alternatives considered:**
- Archive branch instead of tag — equivalent recoverability, heavier to reason about; tag is lighter and conventional for this.
- No preservation (true nuclear) — rejected; the reference represents 59/70 tasks of V1 work and costs one command to keep.

### 5. `CHALLENGE.md` is generated from the frontend's real integration points

**Why:** Documentation drift is the top failure mode of this change: if the contract doc disagrees with what `lib/api.ts`, `lib/auth-client.ts`, `lib/events.ts`, `lib/articles.ts`, `lib/dashboard.ts`, `lib/achievements.ts`, and the upload components actually call, learners debug the doc instead of learning backends. The implementation therefore derives each documented endpoint, payload, and auth rule from those files plus the `v1-headless-cms` specs, and the verification step boots the frontend against the doc as a checklist.

**Alternatives considered:**
- Hand-writing the contract from memory of the NestJS controllers — faster, guaranteed stale; rejected.
- Auto-generating an OpenAPI file from the deleted code before deletion — nice artifact but prescribes REST-shape fidelity over behavior; the doc references it as optional, not required.

### 6. Clean workspace references in the same change

**Why:** `pnpm-workspace.yaml` globs and any root `package.json` scripts referencing `apps/backend` become landmines (install errors, dead `dev` scripts) the moment the directory vanishes. Removing them is part of "starter boots clean," not a separate chore.

## Risks / Trade-offs

- [Risk] Answer-key leak through git history → Mitigation: handoff is a squashed export; the tag lives in the owner's private clone unless open-book is chosen deliberately.
- [Risk] Contract doc drifts from frontend reality → Mitigation: doc is derived file-by-file from `lib/*` during implementation and verified by a mock-mode frontend boot walkthrough.
- [Risk] better-auth table shape (`User`/`Session`/`Account`/`Verification`) intimidates beginners → Mitigation: accepted as desirable difficulty; `CHALLENGE.md` explains these tables exist to serve the session contract, and the tag holds a working example. Trade-off owned, not engineered away.
- [Risk] Achievement scope confusion (schema has it, V1 plan does not) → Mitigation: spec requires it marked as stretch in `CHALLENGE.md`; no silent dropping, no forced scope.
- [Risk] `docker-compose.yml` contains a backend service definition, not just Postgres → Mitigation: implementation inspects and prunes compose to database-only; frontend + compose boot verification catches leftovers.
- [Risk] Root tooling (lint/typecheck/test scripts) assumes backend presence → Mitigation: workspace cleanup task plus a final from-clean install and boot check.

## Migration Plan

1. Commit any outstanding work; create annotated tag `v1-backend-reference` on the pre-delete state.
2. Relocate `schema.prisma` to `packages/db/prisma/schema.prisma` (content-untouched; verified by diff).
3. Delete `apps/backend/`; prune backend references from `pnpm-workspace.yaml`, root `package.json` scripts, and compose (if it defines app services).
4. Verify: clean install, frontend boots backend-free, Postgres comes up via compose, `openspec validate` passes for this change.
5. Write `CHALLENGE.md` from frontend sources; final review pass over the starter as a learner would see it.
6. Commit the reset as one atomic commit; handoff export (squash) happens outside this change at the owner's discretion.

Rollback: `git checkout v1-backend-reference -- apps/backend` (or full tag checkout) restores the reference; the reset commit is a single revertable unit.

## Open Questions

None that change the specs, approach, or task breakdown. Two confirmations are deferred to apply time without affecting the plan: whether the handoff export is squashed-private or open-book with the tag pushed (Decision 4 recommends squashed, one flag to flip), and whether `docker-compose.yml` needs pruning beyond Postgres (implementation inspects and handles either case within the existing verification task).
