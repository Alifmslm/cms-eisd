## Purpose

Provides an overview dashboard showing CMS content statistics and recent items at a glance.

## Requirements

### Requirement: Dashboard statistics
The system SHALL display total counts of events and articles on the dashboard.

#### Scenario: Statistics display
- **WHEN** user views the dashboard
- **THEN** system shows total events count and total articles count

#### Scenario: Empty state
- **WHEN** user views the dashboard with no content
- **THEN** system displays appropriate empty state messages

### Requirement: Achievements KPI on dashboard
The system SHALL display a Total achievements KPI on the dashboard with Champions and Finalist breakdown details, backed by extended `GET /api/dashboard` stats, showing exactly three KPI cards (Total events, Total articles, Total achievements) and no Drafts card.

#### Scenario: KPI display with data
- **WHEN** user views the dashboard and achievements exist
- **THEN** system shows total achievements count plus Champions count (results `1st Place`, `2nd Place`, `3rd Place`) and Finalist count (result `Finalist`)

#### Scenario: KPI row shows only totals
- **WHEN** user views the dashboard
- **THEN** system shows exactly three KPI cards (Total events, Total articles, Total achievements) and no Drafts card; draft counts remain visible in the per-card breakdowns

#### Scenario: KPI empty state
- **WHEN** user views the dashboard with zero achievements
- **THEN** system shows total 0 with Finalist 0 and Champion 0 rather than an error

#### Scenario: Stats API includes achievements
- **WHEN** authenticated user calls `GET /api/dashboard`
- **THEN** response includes `totalAchievements`, `finalistAchievements`, `championAchievements`, and `achievementsByYear` (counts keyed by `YYYY-MM`) alongside existing event/article counts without changing existing fields

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
