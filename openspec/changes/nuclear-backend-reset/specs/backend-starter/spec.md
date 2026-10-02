# Spec Delta

## Purpose

Defines the starter-repo state after the backend is removed, so friends receive a runnable frontend, a preserved database schema, and a documented rebuild contract instead of a broken checkout.

## ADDED Requirements

### Requirement: Backend implementation is removed from the working tree

The starter SHALL contain no backend server source, server configuration, or installed server dependencies under `apps/backend/`, so a learner cannot run, copy, or accidentally depend on the reference implementation.

#### Scenario: Backend source is gone

- **WHEN** a learner lists the contents of `apps/backend/`
- **THEN** no server source directory, server package manifest, or server build output is present (only explicitly preserved items such as relocated schema reference material, if any, remain)

#### Scenario: No backend process can start from the starter

- **WHEN** a learner attempts the documented backend start procedure from the previous revision
- **THEN** it fails fast with the backend absent rather than starting a stale reference server

### Requirement: Prisma schema is preserved at a backend-independent location

The starter SHALL keep the full Prisma schema — `User`, `Session`, `Account`, `Verification`, `Event`, `MediumArticle`, `Achievement`, `AchievementMember` — at a location outside the deleted backend tree, so learners rebuild against the exact data model the frontend and specs assume.

#### Scenario: All models present at the new home

- **WHEN** a learner opens the relocated `schema.prisma`
- **THEN** all eight models listed above are defined with their fields, uniques, and indexes intact

#### Scenario: Schema location is documented

- **WHEN** a learner reads `CHALLENGE.md`
- **THEN** it states the exact path of `schema.prisma` and that the data model is fixed input, not something to redesign

### Requirement: Frontend runs backend-free on fixtures

The starter SHALL boot the CMS dashboard from `apps/frontend/` with no backend process running, rendering Events, Articles, Achievements, and Dashboard content from the checked-in fixtures, so learners have a visible target before writing any server code.

#### Scenario: Full dashboard tour with backend stopped

- **WHEN** a learner starts only the frontend with no server listening on the API URL
- **THEN** the dashboard, event list, article list, and achievement list all render fixture content with no fatal errors

#### Scenario: Mock mode is the documented default

- **WHEN** a learner reads the starter docs
- **THEN** they find that fixture mode is the default and which single setting flips the frontend to the real API once their backend exists

### Requirement: Database is available with one command

The starter SHALL provide PostgreSQL via the kept `docker-compose.yml`, so a learner gets a real database matching the Prisma schema without provisioning anything.

#### Scenario: One-command database

- **WHEN** a learner runs the documented compose command from a clean machine with only Docker available
- **THEN** PostgreSQL becomes reachable with the credentials the starter docs specify

### Requirement: Rebuild contract is documented in CHALLENGE.md

The starter SHALL include a `CHALLENGE.md` at the repo root that states the API surface to rebuild (content endpoints, auth mount point, role rules for reads vs. writes, publish/unpublish transitions, image-handling expectations, and the computed event-status rule) and points at `PLAN_V1.md` plus `openspec/specs/` as the source of truth, so learners never have to guess the target.

#### Scenario: Contract covers every frontend integration

- **WHEN** a learner compares `CHALLENGE.md` against the frontend integration points (`/api/events`, `/api/articles`, `/api/auth`, dashboard aggregation, storage upload)
- **THEN** each integration has a documented expected behavior and the V1 success criteria are restated as the definition of done

#### Scenario: Stretch scope is marked

- **WHEN** a learner reads the scope section of `CHALLENGE.md`
- **THEN** achievements are explicitly marked as stretch scope (present in the schema, beyond the V1 plan) rather than left ambiguous

### Requirement: Reference implementation is preserved outside the working tree

The starter SHALL keep the removed backend recoverable by the owner via a git tag created before deletion, with the working tree itself containing no reference source, so the answer key exists without being reachable by accident.

#### Scenario: Tag exists, tree is clean

- **WHEN** the owner lists git tags after the reset
- **THEN** the reference tag is present, and checking out the starter revision shows no backend implementation

### Requirement: Existing product specs are untouched

The reset SHALL NOT modify any existing product specification under `openspec/specs/` nor `PLAN_V1.md`, so the requirements learners build toward are byte-identical to the ones the reference backend satisfied.

#### Scenario: Specs show no diff

- **WHEN** the owner diffs the reset revision against its parent for `openspec/specs/` and `PLAN_V1.md`
- **THEN** there are zero changes
