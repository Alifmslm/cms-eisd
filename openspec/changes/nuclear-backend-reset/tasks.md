# Tasks

## 1. Preserve the Reference

- [x] 1.1 Commit any outstanding work so the pre-delete tree is clean, verified by `git status --porcelain` showing no modifications to tracked files outside this change's own artifacts.
- [x] 1.2 Create the annotated tag `v1-backend-reference` on the pre-delete commit, verified by `git show v1-backend-reference --stat` listing `apps/backend/src` and `apps/backend/prisma/schema.prisma`.

## 2. Relocate the Schema

- [x] 2.1 Move `apps/backend/prisma/schema.prisma` to `packages/db/prisma/schema.prisma` with byte-identical content, verified by diffing the moved file against `git show v1-backend-reference:apps/backend/prisma/schema.prisma` with no differences.
- [x] 2.2 Confirm all eight models (`User`, `Session`, `Account`, `Verification`, `Event`, `MediumArticle`, `Achievement`, `AchievementMember`) are present in the relocated file, verified by grepping each `model <Name>` declaration.

## 3. Delete the Backend and Clean Workspace References

- [x] 3.1 Delete `apps/backend/` entirely (source, configs, `dist/`, `node_modules/`, `prisma/migrations/`, `seed.ts`), verified by the path no longer existing and `git status` showing the deletion.
- [ ] 3.2 Prune backend references from `pnpm-workspace.yaml`, root `package.json` scripts, and `docker-compose.yml` (only if it defines app services beyond Postgres; Postgres stays), verified by grepping the repo for `apps/backend` with zero hits outside this change's planning docs and `CHALLENGE.md` narrative.
- [ ] 3.3 Run a clean install from repo root, verified by the package manager completing with no errors about the missing workspace member.

## 4. Verify the Starter Boots

- [ ] 4.1 Boot only the frontend with no API listening and walk dashboard, events, articles, and achievements pages, verified by all four rendering fixture content with no fatal errors in the console.
- [ ] 4.2 Bring up Postgres via the documented compose command from a clean state, verified by a successful connection using the credentials the starter docs will specify.

## 5. Write the Rebuild Contract

- [ ] 5.1 Derive the endpoint inventory from frontend sources (`lib/api.ts`, `lib/auth-client.ts`, `lib/events.ts`, `lib/articles.ts`, `lib/dashboard.ts`, `lib/achievements.ts`, upload components) plus the `v1-headless-cms` specs, verified by every `/api/*` call found in `apps/frontend/src` appearing in the inventory.
- [ ] 5.2 Write `CHALLENGE.md` at repo root covering: how to run FE on mocks, the schema path and fixed-model note, the full API/auth/role/publish/upload/status contract, stretch marking for achievements, and V1 success criteria as definition of done — verified by checking each item off against the spec scenarios in `specs/backend-starter/spec.md`.
- [ ] 5.3 Confirm `openspec/specs/` and `PLAN_V1.md` are untouched, verified by `git diff v1-backend-reference -- openspec/specs PLAN_V1.md` showing no changes.

## 6. Final Validation and Commit

- [ ] 6.1 Run `openspec validate --change nuclear-backend-reset` (strict if available), verified by a passing result with no errors.
- [ ] 6.2 Review the full diff as a learner would see it (`git status`, `git diff --stat`), verified by backend source absent, schema present at its new home, frontend untouched, and `CHALLENGE.md` present.
- [ ] 6.3 Commit the reset as one atomic commit, verified by `git log --oneline -1` and `git show --stat HEAD` showing the complete reset scope.
