## Why

The CMS currently has a single admin role with full CRUD access. The organization needs a secondary role for team members who should be able to view the dashboard and content (events, articles) but not create, edit, or delete anything. This allows read-only access for stakeholders without risking accidental content changes.

## What Changes

- Add a `role` field to the User model (enum: `admin` | `user`)
- Implement role-based route protection in the backend API
- Implement role-based UI restrictions in the frontend dashboard
- Users with the `user` role can log in and view all content but cannot modify anything
- Admin retains full CRUD access and can assign roles when creating users

## Capabilities

### New Capabilities

- `auth/role-based-access`: Role-based access control distinguishing admin (full CRUD) and user (read-only) roles

### Modified Capabilities

- `auth/spec.md`: Login now returns user role; session includes role information
- `dashboard/spec.md`: Dashboard widgets are view-only for user role (no edit/delete actions)

## Impact

- **Database**: User model gains a `role` field with default value `user`
- **Backend**: Auth guard checks role before allowing write operations; session includes role
- **Frontend**: Dashboard hides edit/delete buttons for user role; navigation adapts
- **Seed script**: Default admin account retains `admin` role
- **API**: No public API changes (public API is already read-only)
