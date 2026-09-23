## 1. Temporary Bypass

- [x] 1.1 Add a clearly-marked `TEMP (disable-auth-for-fe-testing) — REVERT ME` early-return bypass in `apps/frontend/src/components/ProtectedRoute.tsx` so all guarded routes render without a session, and verify the file still compiles with `pnpm --filter frontend build`
- [x] 1.2 Add a visible "auth disabled for UI testing" marker on the UI shell and verify it renders on every formerly-guarded page
- [x] 1.3 Verify unauthenticated access: open `/`, `/dashboard?variant=a|b|c`, `/events`, and `/articles` with no session and confirm each renders without redirecting to `/login`
- [x] 1.4 Verify no collateral: confirm `/login` behavior is unchanged and backend endpoints still reject unauthenticated requests
- [x] 1.5 Temporarily unwire dashboard BE for UI testing: in `apps/frontend/src/pages/Dashboard.tsx` replace the `fetchDashboard()` (`GET /api/dashboard`) call with a clearly-marked `TEMP (disable-auth-for-fe-testing) — REVERT ME` static mock `DashboardResponse` so `/dashboard` renders the full UI (stat cards, latest updates, upcoming events) with no session/backend, and verify it renders without the "Could not load dashboard data" error state

## 2. Re-enable Auth (after UI testing)

- [ ] 2.1 Delete the temporary early-return in `ProtectedRoute.tsx` and verify unauthenticated access to every guarded route redirects to `/login` again
- [ ] 2.2 Rewire dashboard BE: delete the temporary mock in `Dashboard.tsx` and restore the `fetchDashboard()` call, then verify `/dashboard` loads live data with an authenticated session and shows the error state (not mock data) when the API fails
