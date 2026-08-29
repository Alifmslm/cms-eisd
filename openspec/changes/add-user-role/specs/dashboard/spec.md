## Purpose

Provides an overview dashboard showing CMS content statistics and recent items at a glance.

## MODIFIED Requirements

### Requirement: Dashboard statistics
The system SHALL display total counts of events and articles on the dashboard.

#### Scenario: Statistics display
- **WHEN** user views the dashboard
- **THEN** system shows total events count and total articles count

#### Scenario: Empty state
- **WHEN** user views the dashboard with no content
- **THEN** system displays appropriate empty state messages

### Requirement: Upcoming events list
The system SHALL display a list of upcoming events on the dashboard.

#### Scenario: Upcoming events exist
- **WHEN** user views the dashboard
- **THEN** system shows upcoming events (status "Incoming") sorted by start date soonest first

#### Scenario: No upcoming events
- **WHEN** user views the dashboard with no upcoming events
- **THEN** system displays an empty state message

### Requirement: Latest events list
The system SHALL display a list of most recently created/updated events on the dashboard.

#### Scenario: Latest events exist
- **WHEN** user views the dashboard
- **THEN** system shows most recently created or updated events regardless of status

#### Scenario: No events
- **WHEN** user views the dashboard with no events
- **THEN** system displays an empty state message

### Requirement: Role-based dashboard actions
The system SHALL show edit and delete actions only to users with `admin` role.

#### Scenario: Admin views dashboard
- **WHEN** user with `admin` role views the dashboard
- **THEN** system shows edit/delete buttons for events and articles

#### Scenario: User views dashboard
- **WHEN** user with `user` role views the dashboard
- **THEN** system hides edit/delete buttons and only shows view actions
