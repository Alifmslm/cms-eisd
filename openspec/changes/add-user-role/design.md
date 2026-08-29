## Context

The CMS currently has a single admin role with full CRUD access. The system uses session-based authentication with NestJS guards for route protection. The frontend is a React dashboard with edit/delete actions throughout.

## Goals / Non-Goals

**Goals:**
- Add `admin` and `user` roles to the User model
- Backend enforces role-based access on write endpoints
- Frontend hides edit/delete actions for `user` role
- Maintain backward compatibility with existing admin accounts

**Non-Goals:**
- Multi-admin roles or granular permissions (future enhancement)
- User management UI for creating/editing users (admin uses seed script or direct DB)
- Role-based access for public API (already read-only)

## Decisions

### Role Storage

**Decision:** Add `role` field directly to User model as an enum.

**Rationale:**
- Simple for 2 roles; no need for separate roles/permissions tables
- Easy to query and enforce in guards
- Prisma supports PostgreSQL enums natively

**Alternatives considered:**
- Separate Role table: Overkill for 2 roles; adds JOIN complexity
- String field: No type safety; prone to typos

### Backend Enforcement

**Decision:** Create a `@Roles()` decorator and `RolesGuard` using NestJS's existing guard pattern.

**Rationale:**
- Consistent with existing auth guard architecture
- Decorator-based approach is declarative and easy to apply
- Guard checks session role before allowing write operations

**Alternatives considered:**
- Middleware: Less granular; applies to all routes
- Custom decorator with metadata: Similar but less conventional in NestJS

### Frontend Enforcement

**Decision:** Read role from session and conditionally render UI elements.

**Rationale:**
- Backend is the source of truth; frontend is UX enhancement
- Hiding buttons prevents accidental clicks; backend still validates
- Simple conditional rendering with existing React patterns

**Alternatives considered:**
- Route-based hiding: Less granular; user could still see list pages
- Separate dashboard for each role: More complex; unnecessary for V1

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Frontend-only enforcement could be bypassed | Backend guard validates on every write request |
| Existing admin accounts need role assignment | Seed script sets admin role; migration adds default `user` role |
| Session role could become stale | Role is read from DB on login; session stores current role |

## Migration Plan

1. Add `role` enum and field to Prisma schema with default `user`
2. Run Prisma migration to apply schema change
3. Update seed script to assign `admin` role to default account
4. Deploy backend with new guard logic
5. Deploy frontend with role-based UI

**Rollback:** Remove role field from schema; revert to single-role system.

## Open Questions

None — all technical decisions are resolved.
