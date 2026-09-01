## Why

The current authentication system is a hand-rolled stack using `express-session` + `csurf` (cookie-based session + X-CSRF-Token header). This creates several problems:

1. **Swagger UI testing is clunky**: The cookie is `httpOnly` so Swagger UI's lock icon can't read it; a dev-only `swagger-login` / `swagger-logout` panel was added as a workaround, adding attack surface.
2. **No bearer token support**: External API clients (Swagger, mobile, third-party) have no clean way to authenticate — they must replicate the cookie+CSRF dance.
3. **Custom CSRF is fragile**: The hand-rolled CSRF middleware and skip logic is hard to reason about and must be maintained independently.
4. **Manual session management**: Setting `session.userId`, `session.username`, `session.role` on every login, and checking `session.userId` in every guard, is error-prone.

Better Auth replaces all of this with a battle-tested library that provides session cookies (SameSite=Lax, httpOnly, origin validation, Fetch Metadata checks), bearer tokens (via plugin), and a clean session object — out of the box.

## What Changes

- **BREAKING**: Remove `express-session` and `csurf` middleware; replace with Better Auth's `toNodeHandler` mounted at `/api/auth/*`.
- **BREAKING**: Remove custom `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/csrf-token`, `GET /api/auth/profile`, `POST /api/auth/swagger-login`, `POST /api/auth/swagger-logout` endpoints. Replace with Better Auth's native `/api/auth/sign-in`, `/api/auth/sign-out`, `/api/auth/get-session`.
- **BREAKING**: Database schema changes — `User` model gains `email`, `emailVerified`, `name`, `image`, `username`, `displayUsername`; `Session`, `Account`, `Verification` tables added; `passwordHash` column removed (password stored in `Account.password`).
- **BREAKING**: `bodyParser: false` in NestJS bootstrap (required by Better Auth), with selective re-enablement for non-auth routes.
- Add `@better-auth/bearer` plugin so Swagger UI authenticates via `Authorization: Bearer <token>` header, and `.addBearerAuth()` on the OpenAPI spec.
- Add `@better-auth/username` plugin so the admin logs in with `username` + `password` (preserving current UX).
- Rewrite `AuthenticatedGuard` and `RolesGuard` to call `auth.api.getSession({ headers })` (works for both cookie and bearer). `session.user.role` replaces `session.role`.
- Remove `@ApiCookieAuth()` from all protected routes; add `@ApiBearerAuth()`.
- Remove the Swagger login panel JS and dev-only endpoints.
- Re-seed admin with Better Auth's own password hashing.
- Configure `trustedOrigins`, `secret`, `useSecureCookies`, `disableCSRFCheck: false`, `disableOriginCheck: false` per environment.

## Capabilities

### No Spec Changes (skip_specs: true)

The behavioral requirements in the existing specs (`auth`, `auth/role-based-access`, `dashboard`) do not change:
- Login with username/password → session created → redirect to dashboard (same)
- Session persists across reloads (same)
- Route protection for non-login routes (same)
- Role assignment and write protection (same)
- Role-based dashboard actions (same)

What changes is the **implementation**: library (Better Auth replaces express-session + csurf), session format, endpoint paths, guard internals, and password hashing. These are all internal details that don't alter externally observable behavior.

### Implementation-Affected Code (not spec changes)

- `auth`: Login, logout, session persistence, and route protection mechanisms change from custom cookie+CSRF to Better Auth session cookie (native routes), with bearer token support added for API clients.
- `auth/role-based-access`: Session role now comes from Better Auth's `user.additionalFields.role` instead of a manually-set `session.role`. The guard implementation changes but the behavioral contract (admin=write, user=read-only) remains the same.
- `dashboard`: Role-based dashboard actions contract unchanged at the spec level; the implementation shifts from `session.role` to `session.user.role` via Better Auth, but the observable behavior is identical.

## Impact

- **Backend code**: `main.ts`, `auth/` module (controller, service, guards, decorator, seed), all controller `@ApiCookieAuth`/`@ApiBearerAuth` decorators, `prisma/schema.prisma`.
- **Dependencies**: Add `better-auth`, `@better-auth/prisma`. Remove `express-session`, `csurf`, `@types/express-session`, `@types/csurf`, `bcrypt` (bcrypt removed only if Better Auth's own hashing is used for new passwords; for this migration, bcrypt is kept for the custom hash/verify bridge or removed during re-seed).
- **Database**: Prisma migration required; existing `User` rows must be backfilled with `email`, `emailVerified`, `name`, and `passwordHash` removed.
- **Frontend**: Current frontend is a bare scaffold (Vite + React with only type fixtures, no auth flow). Must be built against Better Auth's native endpoints (`sign-in`, `sign-out`, `get-session`) with `credentials: 'include'`. Types `User`/`AuthState` remain but response shapes shift to `{ session, user }`.
- **API contract**: Swagger UI uses `bearerAuth` scheme; external clients authenticate via `Authorization: Bearer <token>`.
