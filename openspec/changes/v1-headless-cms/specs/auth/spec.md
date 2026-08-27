## Purpose

Provides authentication for the CMS admin, ensuring only authorized users can access the dashboard and manage content.

## ADDED Requirements

### Requirement: Admin login
The system SHALL allow an admin to log in with username and password credentials.

#### Scenario: Successful login
- **WHEN** admin submits valid username and password
- **THEN** system creates a session and redirects to the dashboard

#### Scenario: Failed login
- **WHEN** admin submits invalid credentials
- **THEN** system displays a generic error message without revealing whether the username exists

### Requirement: Admin logout
The system SHALL allow an admin to log out, invalidating the current session.

#### Scenario: Successful logout
- **WHEN** admin clicks logout
- **THEN** session is invalidated and admin is redirected to login page

### Requirement: Session persistence
The system SHALL maintain admin session across page reloads within a reasonable session lifetime.

#### Scenario: Session persists across reloads
- **WHEN** admin reloads the page within session lifetime
- **THEN** admin remains logged in and sees the current page

#### Scenario: Expired session
- **WHEN** admin attempts to access a protected route with an expired session
- **THEN** system redirects to login page preserving the intended destination

### Requirement: Route protection
The system SHALL protect all dashboard and API routes except login from unauthorized access.

#### Scenario: Unauthenticated access attempt
- **WHEN** unauthenticated user attempts to access a protected route
- **THEN** system redirects to login page

#### Scenario: Authenticated access
- **WHEN** authenticated admin accesses a protected route
- **THEN** system allows access to the requested resource
