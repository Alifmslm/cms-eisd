## Context

See proposal.md (Why) for motivation. Current state: `apps/frontend/src/App.tsx` wraps `/dashboard`, `/events`, and `/articles` in `ProtectedRoute` (`apps/frontend/src/components/ProtectedRoute.tsx`), which redirects unauthenticated users to `/login`. All UI pages need to open without a session for visual review. Backend guards are untouched by this change.

## Goals / Non-Goals

**Goals:**
- Unauthenticated browser access to every UI route (`/`, `/dashboard?variant=a|b|c`, `/events`, `/articles`) for UI testing.
- Bypass is a single, obvious, revertible edit — re-enabling auth is one step.
- Login page and all other protected routes keep working unchanged.

**Non-Goals:**
- Any backend, session, or API-permission change.
- A permanent "public dashboard" mode or environment-flag infrastructure.
- Fixing the underlying reason a session is unavailable (out of scope).

## Decisions

- **Bypass inside `ProtectedRoute` (single early-return), not route-by-route unwrapping in `App.tsx`.**
  Rationale: every UI route must open, so guarding the single choke point is one marked block instead of touching every route — smallest diff and cleanest revert. Alternative considered (unwrapping each route in `App.tsx`): rejected as noisy, one edit per route with more chances to miss one on revert.
- **Plainly-marked temporary code over an env flag.**
  Rationale: an env var (`VITE_DISABLE_AUTH`) is easy to forget and can leak into shared `.env` files; a loud `TEMP — REVERT ME` block in `App.tsx` is visible in every diff and review. Alternative considered (dev-only gating via `import.meta.env.DEV`): accepted as a complement — render the bypass only outside production builds if trivial, as defence in depth.
- **No revert automation.**
  Rationale: the revert is deleting the marked block; a task item plus code comment is sufficient tracking for a one-line change.

## Risks / Trade-offs

- [Bypass merged to main and forgotten] → Every bypass line carries a `TEMP` comment naming this change; tasks.md ends with an explicit revert task; the prototype switcher is already prod-gated.
- [Reviewer mistakes prototype for real dashboard] → The prototype folder and route element are already marked `PROTOTYPE — THROWAWAY`; the bypass comment points at this change name.
- [Axios 401 interceptor redirects to `/login`] → Harmless here: the prototype makes no API calls. If real data widgets are added later while the bypass is active, failed calls redirect to login — acceptable and self-revealing during testing.

## Migration Plan

- Deploy: frontend-only change; no migration, no backend coordination.
- Rollback / re-enable: delete the marked early-return in `ProtectedRoute.tsx` (tracked as the final task), verify unauthenticated access to every formerly-guarded route redirects to `/login`.

## Open Questions

None — scope (frontend route only) and revert path are settled; backend behavior is explicitly untouched.
