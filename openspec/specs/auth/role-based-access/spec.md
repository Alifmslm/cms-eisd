## Purpose

Controls access based on user roles, allowing admin full CRUD access and user read-only access to the dashboard.

## Requirements

### Requirement: Role assignment
The system SHALL support assigning `admin` or `user` roles to users.

#### Scenario: Admin creates user with role
- **WHEN** admin creates a new user with role `user`
- **THEN** system assigns the specified role to the new user

#### Scenario: Default role
- **WHEN** admin creates a user without specifying a role
- **THEN** system assigns `user` role as default

### Requirement: Role-based write protection
The system SHALL prevent users with `user` role from accessing create, update, and delete endpoints.

#### Scenario: User attempts write operation
- **WHEN** user with `user` role attempts to access a write endpoint (POST, PUT, DELETE)
- **THEN** system returns 403 Forbidden response

#### Scenario: Admin performs write operation
- **WHEN** user with `admin` role accesses a write endpoint
- **THEN** system allows the operation to proceed

### Requirement: Role-based UI restrictions
The system SHALL hide edit and delete actions from users with `user` role in the dashboard.

#### Scenario: User views dashboard
- **WHEN** user with `user` role views the dashboard
- **THEN** system hides edit/delete buttons and only shows view actions

#### Scenario: Admin views dashboard
- **WHEN** user with `admin` role views the dashboard
- **THEN** system shows all actions including edit/delete

### Requirement: Role persists in session
The system SHALL include the user's role in the session after login.

#### Scenario: Session includes role
- **WHEN** user logs in successfully
- **THEN** session contains the user's role for subsequent request authorization
