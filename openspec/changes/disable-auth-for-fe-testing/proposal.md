## Why

The dashboard prototype (`/dashboard?variant=a|b|c`) sits behind `ProtectedRoute`, so it cannot be opened for UI review without a live backend session. In fact every UI page (`/`, `/dashboard`, `/events`, `/articles`) is route-guarded. To unblock visual testing of the UI now, frontend route protection needs a temporary, easily reversible bypass that will be turned back on afterwards.

## What Changes

- Add a temporary, clearly-marked bypass of the frontend `ProtectedRoute` guard so all UI routes render without an authenticated session.
- Backend authentication, session management, role checks, and API 403s remain fully enforced — no backend change.
- Login, logout, and session behavior remain unchanged and continue to work.
- Document the exact revert step that re-enables route protection after UI testing.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `auth`: the "Route protection" requirement gains a temporary, explicitly-marked testing exception covering all frontend routes. Backend route/API protection is unaffected.

## Impact

- Affected code: `apps/frontend/src/components/ProtectedRoute.tsx` (single temporary early-return bypass opening all guarded routes).
- No backend, database, API, or dependency changes.
- Risk: if the bypass leaks into a shared/production build, protected UI would render without login. Mitigated by prominent `TEMP` marking, dev-only gating where feasible, and a tracked revert task.
