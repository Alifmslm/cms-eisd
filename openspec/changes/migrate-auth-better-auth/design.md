## Context

Current stack: NestJS 10 + Express 4.22.1 + Prisma 5 + PostgreSQL. Authentication is hand-rolled: `express-session` for cookie sessions, `csurf` for CSRF tokens, a custom `AuthenticatedGuard`/`RolesGuard` pair, and a `POST /api/auth/login` endpoint that manually sets `session.userId`/`session.username`/`session.role`. Swagger UI required a dev-only `swagger-login` panel because httpOnly cookies can't be read by JavaScript.

Goal: replace all of this with Better Auth, which provides managed session cookies (SameSite=Lax, origin validation, Fetch Metadata checks), bearer tokens via plugin, and a clean session object — while preserving the admin dashboard's cookie-based login flow and role-based access control.

## Goals / Non-Goals

**Goals:**
- Replace `express-session` + `csurf` with Better Auth session management
- Enable Bearer token auth for Swagger UI and external API clients
- Mount Better Auth's native routes at `/api/auth/*` (sign-in, sign-out, get-session)
- Rewrite guards to use `auth.api.getSession({ headers })` (works for both cookie and bearer)
- Preserve `role` in the session via Better Auth's `additionalFields`
- Remove all custom auth workarounds (swagger-login, CSRF skip logic, custom CSRF token endpoint)
- Support username-based login (Better Auth `username` plugin)
- Configure `useSecureCookies`, `trustedOrigins`, `secret` per environment

**Non-Goals:**
- Frontend rewrite (frontend is a bare scaffold; auth flow will be built later)
- OAuth/social login (not needed for single-admin CMS)
- Email verification (not needed for single-admin CMS)
- Multi-tenancy or organization features
- Password reset flow (admin can re-seed if needed)

## Decisions

### D1: Better Auth with native route mounting (not custom wrappers)

**Decision**: Mount `toNodeHandler(auth)` at `/api/auth/*` and use Better Auth's native `/api/auth/sign-in/username`, `/api/auth/sign-out`, `/api/auth/get-session` endpoints. No NestJS controller wrappers.

**Rationale**: 
- Wrappers would conflict with Better Auth's route handling
- Native routes are well-documented and tested by the community
- Frontend builds against standard Better Auth endpoints (easier to integrate)
- Response shapes change (`{ session, user }` from `getSession`) but this is acceptable since the frontend is a scaffold

**Alternatives considered**:
- Custom NestJS controller wrappers at `/api/auth/login`, `/api/auth/logout`, `/api/auth/profile` calling `auth.api.signInUsername/signOut/getSession` — rejected because it duplicates routing logic and creates conflicts with Better Auth's own route handlers

### D2: NestJS `bodyParser: false` + selective re-enablement

**Decision**: Set `bodyParser: false` in `NestFactory.create()`, then:
1. Mount Better Auth handler FIRST: `app.use('/api/auth', toNodeHandler(auth))`
2. Re-enable JSON parsing: `app.use(express.json())`
3. Multer (storage upload) is unaffected (multipart handled separately)

**Rationale**: Better Auth's NestJS integration requires `bodyParser: false` to handle its own body parsing. Mounting the handler before re-enabling `express.json()` ensures auth routes get parsed by Better Auth while all other routes get parsed by Nest's pipe system.

**Alternatives considered**:
- Using `@thallesp/nestjs-better-auth` community package — rejected because it adds an external dependency with its own maintenance burden; the underlying `toNodeHandler` is simple enough to mount directly
- Selective `express.json()` only on auth routes — rejected because it would break all non-auth routes that parse JSON bodies (events, articles controllers)

### D3: Merge Better Auth into existing User model

**Decision**: Extend the existing `User` table with Better Auth columns (`email`, `emailVerified`, `name`, `image`, `username`, `displayUsername`), add `Session`, `Account`, `Verification` tables, keep `role` as `additionalFields`. Remove `passwordHash` from `User` (password moves to `Account.password` for credential accounts).

**Rationale**:
- Single user source of truth
- Role guarding stays simple (`session.user.role`)
- Existing `User` rows get backfilled during migration

**Alternatives considered**:
- Separate Better Auth tables — rejected because it creates two user records and complex coupling

### D4: Bearer plugin for Swagger / external clients

**Decision**: Add `bearer()` plugin to Better Auth config. Add `.addBearerAuth()` to DocumentBuilder and `@ApiBearerAuth()` to all protected controller methods.

**Rationale**:
- Swagger UI's native "Authorize" button works with Bearer tokens
- External API clients can authenticate via `Authorization: Bearer <token>`
- Session cookie remains the primary auth mechanism for the browser-based dashboard

**Alternatives considered**:
- Keep cookie-only auth with custom Swagger panel — rejected (this is what we're migrating away from)
- OAuth2 flow for Swagger — overkill for a single-admin CMS

### D5: Username plugin for existing login UX

**Decision**: Use Better Auth's `username()` plugin with `emailAndPassword.enabled: true` and `disableSignUp: true`. Admin logs in with username+password via `POST /api/auth/sign-in/username`.

**Rationale**:
- Preserves the existing admin login UX (username, not email)
- The `username` plugin adds `username` and `displayUsername` fields to the User model
- `disableSignUp: true` since only the seeded admin should exist

### D6: Re-seed with Better Auth hashing

**Decision**: Delete the existing admin user and re-seed via Better Auth's own hashing (scrypt). The seed script calls `auth.api.signUpEmail()` which handles password hashing internally.

**Rationale**:
- Cleanest approach — no need to wire custom bcrypt hash/verify bridge
- Only one admin account exists (dev seed), so re-seeding is trivial
- Avoids maintaining compatibility with old bcrypt hashes

**Alternatives considered**:
- Wire bcrypt into `emailAndPassword.password.{hash,verify}` — rejected because it adds complexity and the existing bcrypt hashes are only from the dev seed

### D7: Session format change is acceptable

**Decision**: Accept that `getSession` returns `{ session: { id, userId, expiresAt, ... }, user: { id, username, role, ... } }` instead of the current flat `{ user: { id, username, role } }`.

**Rationale**:
- Frontend is a scaffold — no existing code to break
- Backend guards will be rewritten to use the new session format
- Response shape is standard Better Auth format

## Risks / Trade-offs

**[bodyParser:false breaks existing pipes]** → Mitigated by re-enabling `express.json()` globally after mounting Better Auth handler. The `ValidationPipe` on DTOs (events, articles) will continue to work since they depend on `express.json()` parsing, which we re-enable.

**[Existing User rows lack email]** → Mitigated by backfilling a placeholder email during migration. Since only one admin user exists (seed), this is a one-time manual step. Could use `<username>@cms.local` as placeholder.

**[Better Auth stores password in Account, not User]** → This is by design. The `Account` table holds `password` for credential-type logins. The seed script must create both User and Account records, or use `auth.api.signUpEmail()` which handles both.

**[Session format change breaks existing guard logic]** → Mitigated by rewriting `AuthenticatedGuard` and `RolesGuard` in the same change. All guard usage is in the same codebase (no external consumers).

**[No email verification]** → Intentionally skipped (non-goal). `emailAndPassword.disableSignUp` prevents new signups. The admin account is seeded directly.

## Open Questions

1. **Placeholder email strategy**: Should the backfilled email be `<username>@cms.local`, or should we add a real email field to the User model and require it during seed? The latter is cleaner but changes the seed flow.

2. **Token storage for bearer auth**: When the admin uses Swagger UI, how do they obtain a bearer token? Options: (a) call `getSession` to get the session token, (b) Better Auth exposes tokens via `set-auth-token` response header (from bearer plugin's after-hook), (c) manual token generation. This affects Swagger UX but not the core auth flow.
