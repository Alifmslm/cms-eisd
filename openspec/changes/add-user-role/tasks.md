## 1. Database Schema

- [x] 1.1 Add `role` enum (`admin`, `user`) to Prisma schema and verify migration runs successfully
- [x] 1.2 Add `role` field to User model with default value `user` and verify schema is valid

## 2. Backend - Role Guard

- [x] 2.1 Create `@Roles()` decorator in `src/auth/roles.decorator.ts` and verify it compiles
- [x] 2.2 Create `RolesGuard` in `src/auth/roles.guard.ts` that checks session role and verify guard blocks unauthorized access
- [x] 2.3 Apply `@Roles('admin')` decorator to events controller write endpoints (POST, PUT, DELETE) and verify user role gets 403
- [x] 2.4 Apply `@Roles('admin')` decorator to articles controller write endpoints (POST, PUT, DELETE) and verify user role gets 403

## 3. Backend - Auth Updates

- [x] 3.1 Update auth service to include user role in session after login and verify session contains role
- [x] 3.2 Update auth controller to return user role in login response and verify response includes role field

## 4. Seed Script

- [x] 4.1 Update seed script to assign `admin` role to default admin account and verify seed creates admin with correct role

## 5. Frontend - Role Awareness

- [x] 5.1 Update login response handling to store user role in frontend state and verify role is accessible
- [x] 5.2 Add role check utility to determine if current user is admin and verify utility returns correct boolean
- [x] 5.3 Conditionally hide edit/delete buttons on dashboard for user role and verify buttons are hidden for non-admin users

## 6. Documentation

- [x] 6.1 Update README with role-based access documentation and verify docs are accurate
