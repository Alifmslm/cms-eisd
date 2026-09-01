## 1. Dependencies

- [x] 1.1 Install `better-auth` and `@better-auth/prisma-adapter` packages and verify `pnpm install` succeeds
- [x] 1.2 Remove `express-session`, `csurf`, `@types/express-session`, `@types/csurf` packages and verify removal

## 2. Database Schema & Migration

- [x] 2.1 Extend `User` model in `prisma/schema.prisma` with Better Auth columns (`email`, `emailVerified`, `name`, `image`, `username`, `displayUsername`) and remove `passwordHash` and `UserRole` enum, then verify schema validates with `prisma validate`
- [x] 2.2 Add `Session` model (id, expiresAt, token, createdAt, updatedAt, ipAddress, userAgent, userId → User, with unique token and cascade delete) to `prisma/schema.prisma` and verify schema validates
- [x] 2.3 Add `Account` model (id, issuer, accountId, providerId, userId → User, password, accessToken, refreshToken, idToken, accessTokenExpiresAt, refreshTokenExpiresAt, scope, createdAt, updatedAt, unique issuer+accountId, cascade delete) to `prisma/schema.prisma` and verify schema validates
- [x] 2.4 Add `Verification` model (id, identifier, value, expiresAt, createdAt, updatedAt) to `prisma/schema.prisma` and verify schema validates
- [x] 2.5 Run `prisma migrate dev --name migrate-to-better-auth` and verify migration applies cleanly against PostgreSQL

## 3. Better Auth Configuration

- [x] 3.1 Create `src/auth/better-auth.ts` with `betterAuth()` config: `secret` from env, `emailAndPassword.enabled: true`, `emailAndPassword.disableSignUp: true`, `username()` plugin, `bearer()` plugin, `user.additionalFields.role` (type `["admin","user"]`, `input:false`, `defaultValue:"user"`), Prisma adapter with `provider:"postgresql"`, and verify file compiles
- [x] 3.2 Configure `advanced.useSecureCookies` to `NODE_ENV === 'production'`, `trustedOrigins` to `[process.env.FRONTEND_URL || 'http://localhost:5173']`, and `disableCSRFCheck: false`, `disableOriginCheck: false` in the auth config, then verify config compiles
- [x] 3.3 Verify `src/auth/better-auth.ts` exports `auth` and can be imported without errors

## 4. NestJS Bootstrap & Mounting

- [x] 4.1 Update `src/main.ts`: set `bodyParser: false` in `NestFactory.create(AppModule, { bodyParser: false })`, mount `app.use('/api/auth', toNodeHandler(auth))` BEFORE any other middleware, then `app.use(express.json())` and `app.use(express.urlencoded({ extended: true }))` for non-auth routes, and verify the server starts and `/api/auth/get-session` responds
- [x] 4.2 Remove `express-session` and `csurf` middleware from `main.ts`, remove the custom CSRF skip wrapper, and verify the server starts without errors
- [x] 4.3 Keep `app.enableCors(...)` with `credentials: true` and `origin: process.env.FRONTEND_URL`, and verify CORS still works with `curl -H "Origin: http://localhost:5173" -v http://localhost:3000/api/events` returns `Access-Control-Allow-Origin`

## 5. Guards

- [x] 5.1 Rewrite `AuthenticatedGuard` to call `auth.api.getSession({ headers: request.headers })` and throw `UnauthorizedException` if session is null, then verify guard compiles and returns 401 for unauthenticated requests
- [x] 5.2 Rewrite `RolesGuard` to read `session.user.role` from the Better Auth session (instead of `session.role`) and throw `ForbiddenException` if role doesn't match, then verify guard compiles and returns 403 for non-admin users
- [x] 5.3 Verify `AuthenticatedGuard` + `RolesGuard` work together: `GET /api/dashboard` returns 201/200 with valid session cookie, returns 401 without session

## 6. Controllers & OpenAPI

- [x] 6.1 Remove `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/csrf-token`, `GET /api/auth/profile`, `POST /api/auth/swagger-login`, `POST /api/auth/swagger-logout` from `auth.controller.ts`, and verify the file compiles
- [x] 6.2 Remove `@ApiCookieAuth()` from all protected controller methods (events, articles, storage, dashboard) and add `@ApiBearerAuth()` instead, then verify Swagger JSON shows `security: [{ bearerAuth: [] }]` on protected endpoints
- [x] 6.3 Add `.addBearerAuth()` to `DocumentBuilder` in `main.ts` and remove the Swagger login panel HTML/JS, then verify `/api/docs` loads and the Authorize button accepts Bearer token input
- [x] 6.4 Verify public endpoints (`GET /api/events`, `GET /api/events/:slug`, `GET /api/articles`, `GET /api/articles/:id`) still work without authentication

## 7. Seed

- [x] 7.1 Rewrite `prisma/seed.ts` to create admin user via Better Auth's `auth.api.signUpEmail({ email, password, name })` which handles password hashing internally, and verify seed runs and admin can sign in via `POST /api/auth/sign-in/username`
- [x] 7.2 Verify `GET /api/auth/get-session` with valid session cookie returns `{ session: {...}, user: { id, username, role: "admin", ... } }`
- [x] 7.3 Verify role-based access: admin can POST/PUT/DELETE events and articles, and unauthenticated requests return 401

## 8. Production Hardening

- [x] 8.1 Verify `NODE_ENV=production` causes `useSecureCookies: true` in auth config, and that `POST /api/auth/sign-in/username` over HTTP (non-HTTPS) fails with cookie not set
- [x] 8.2 Verify no dev-only auth endpoints exist in production (swagger-login, swagger-logout should 404)
- [x] 8.3 Verify `trustedOrigins` blocks requests from untrusted origins in CORS

## 9. Cleanup

- [ ] 9.1 Remove old auth files that are no longer needed: verify `src/auth/auth.service.ts` is removed or repurposed, `src/auth/auth.controller.ts` is minimal or removed
- [ ] 9.2 Remove `bcrypt` dependency from `package.json` if no longer used elsewhere (Better Auth uses its own hashing)
- [ ] 9.3 Verify `pnpm build` succeeds with zero errors
