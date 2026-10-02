## Purpose

Provides an overview dashboard showing CMS content statistics and recent items at a glance.

## ADDED Requirements

### Requirement: Dashboard statistics
The system SHALL display total counts of events and articles on the dashboard.

#### Scenario: Statistics display
- **WHEN** admin views the dashboard
- **THEN** system shows total events count and total articles count

#### Scenario: Empty state
- **WHEN** admin views the dashboard with no content
- **THEN** system displays appropriate empty state messages

### Requirement: Upcoming events list
The system SHALL display a list of upcoming events on the dashboard.

#### Scenario: Upcoming events exist
- **WHEN** admin views the dashboard
- **THEN** system shows upcoming events (status "Incoming") sorted by start date soonest first

#### Scenario: No upcoming events
- **WHEN** admin views the dashboard with no upcoming events
- **THEN** system displays an empty state message

### Requirement: Latest events list
The system SHALL display a list of most recently created/updated events on the dashboard.

#### Scenario: Latest events exist
- **WHEN** admin views the dashboard
- **THEN** system shows most recently created or updated events regardless of status

#### Scenario: No events
- **WHEN** admin views the dashboard with no events
- **THEN** system displays an empty state message
