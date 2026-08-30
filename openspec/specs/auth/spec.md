## Purpose

Provides authentication for the CMS, ensuring only authorized users can access the dashboard and manage content.

## Requirements

### Requirement: User login
The system SHALL allow a user to log in with username and password credentials.

#### Scenario: Successful login
- **WHEN** user submits valid username and password
- **THEN** system creates a session with user role and redirects to the dashboard

#### Scenario: Failed login
- **WHEN** user submits invalid credentials
- **THEN** system displays a generic error message without revealing whether the username exists

#### Scenario: Role-based redirect
- **WHEN** user with `user` role logs in
- **THEN** system redirects to dashboard in read-only mode

### Requirement: User logout
The system SHALL allow a user to log out, invalidating the current session.

#### Scenario: Successful logout
- **WHEN** user clicks logout
- **THEN** session is invalidated and user is redirected to login page

### Requirement: Session persistence
The system SHALL maintain user session across page reloads within a reasonable session lifetime.

#### Scenario: Session persists across reloads
- **WHEN** user reloads the page within session lifetime
- **THEN** user remains logged in and sees the current page

#### Scenario: Expired session
- **WHEN** user attempts to access a protected route with an expired session
- **THEN** system redirects to login page preserving the intended destination

### Requirement: Route protection
The system SHALL protect all dashboard and API routes except login from unauthorized access.

#### Scenario: Unauthenticated access attempt
- **WHEN** unauthenticated user attempts to access a protected route
- **THEN** system redirects to login page

#### Scenario: Authenticated access
- **WHEN** authenticated user accesses a protected route
- **THEN** system allows access to the requested resource based on role permissions
