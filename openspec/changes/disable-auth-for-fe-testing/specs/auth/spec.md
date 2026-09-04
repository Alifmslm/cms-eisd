## MODIFIED Requirements

### Requirement: Route protection
The system SHALL protect all dashboard and API routes except login from unauthorized access. During frontend UI testing, all frontend routes MAY render without an authenticated session behind an explicitly-marked temporary bypass; backend API protection SHALL remain fully enforced at all times.

#### Scenario: Unauthenticated access attempt
- **WHEN** unauthenticated user attempts to access a protected route
- **THEN** system redirects to login page

#### Scenario: Authenticated access
- **WHEN** authenticated user accesses a protected route
- **THEN** system allows access to the requested resource based on role permissions

#### Scenario: Temporary frontend testing bypass
- **WHEN** the temporary UI-testing bypass is active and an unauthenticated user opens any frontend route
- **THEN** the route renders without redirecting to login, and the bypass is visibly marked as temporary in code and UI

#### Scenario: Backend protection unaffected by bypass
- **WHEN** the temporary frontend bypass is active and any request reaches a protected backend endpoint without a valid session
- **THEN** the backend rejects it exactly as before (redirect/401/403 semantics unchanged)
