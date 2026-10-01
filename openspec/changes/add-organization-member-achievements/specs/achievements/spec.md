# Spec Delta

## Purpose

Tracks organization member competition achievements (hackathons, UI/UX, essay, software engineering) so wins are easy to record and easy to summarize by count, category, and level.

## ADDED Requirements

### Requirement: Create member achievement
The system SHALL allow an admin to create a member achievement record with member names, assistant code, competition category, competition level, achievement result, and competition name.

#### Scenario: Admin creates achievement with preset category
- **WHEN** admin submits one or more member names, a 4-letter assistant code, category `Hackathon`, level `National`, result `Champion`, and competition name
- **THEN** system creates the record and returns it with generated id and timestamps

#### Scenario: Admin creates achievement with Other category
- **WHEN** admin submits category `Other` with custom category text (e.g. `Game Jam`)
- **THEN** system stores the custom text as the effective category and returns the created record

#### Scenario: Validation rejects bad input
- **WHEN** admin submits empty member names, assistant code not exactly 4 letters, `Other` without custom text, or empty competition name
- **THEN** system returns 400 with field-level errors and creates nothing

#### Scenario: Non-admin cannot create
- **WHEN** user with `user` role calls the create endpoint
- **THEN** system returns 403 Forbidden

#### Scenario: Unauthenticated cannot create
- **WHEN** unauthenticated caller calls the create endpoint
- **THEN** system returns 401 Unauthorized

### Requirement: List and filter achievements
The system SHALL allow authenticated users to list achievements ordered by most recently updated first, with search and filters.

#### Scenario: List ordered by recency
- **WHEN** authenticated user lists achievements
- **THEN** system returns records ordered by `updatedAt` descending

#### Scenario: Search and filter
- **WHEN** authenticated user filters by category, level, or result, or searches competition name / member name
- **THEN** system returns only matching records

#### Scenario: Unauthenticated cannot list
- **WHEN** unauthenticated caller lists achievements
- **THEN** system returns 401 Unauthorized

### Requirement: Update member achievement
The system SHALL allow an admin to update any field of an achievement record with the same validation as creation.

#### Scenario: Admin updates result and names
- **WHEN** admin updates result from `Finalist` to `2nd Place` and edits the member-name list
- **THEN** system persists the changes, updates `updatedAt`, and returns the updated record

#### Scenario: Update validates Other category
- **WHEN** admin changes category to `Other` without custom category text
- **THEN** system returns 400 and persists nothing

#### Scenario: Update missing record
- **WHEN** admin updates a non-existent id
- **THEN** system returns 404

#### Scenario: Non-admin cannot update
- **WHEN** user with `user` role calls the update endpoint
- **THEN** system returns 403 Forbidden

### Requirement: Delete member achievement
The system SHALL allow an admin to permanently delete an achievement record.

#### Scenario: Admin deletes record
- **WHEN** admin deletes an existing achievement id
- **THEN** system removes the record and subsequent reads return 404 for that id

#### Scenario: Delete missing record
- **WHEN** admin deletes a non-existent id
- **THEN** system returns 404

#### Scenario: Non-admin cannot delete
- **WHEN** user with `user` role calls the delete endpoint
- **THEN** system returns 403 Forbidden

### Requirement: Achievement field rules
The system SHALL enforce field rules: member names is 1+ non-empty names; assistant code is exactly 4 A-Z letters (case-insensitive input, stored uppercase); category is one of `Essay`, `UI/UX Competition`, `Software Engineering`, `Hackathon`, `Other` (custom text required 1-100 chars when `Other`); level is `International` or `National`; result is one of `Champion`, `1st Place`, `2nd Place`, `3rd Place`, `Finalist`; competition name is 1-200 chars.

#### Scenario: Assistant code normalization
- **WHEN** admin submits assistant code `abcd`
- **THEN** system stores `ABCD`

#### Scenario: Champion bucket definition
- **WHEN** dashboard counts champions
- **THEN** records with result `Champion` or `1st Place` count as champions, records with result `Finalist` count as finalists

### Requirement: Achievements page and navigation
The system SHALL provide an authenticated Achievements list page at `/achievements` linked from the sidebar, plus create/edit forms and delete confirmation; write controls are visible only to `admin` role.

#### Scenario: Sidebar navigation
- **WHEN** authenticated user views Dashboard, Events, Articles, or Achievements pages
- **THEN** sidebar shows an Achievements entry linking to `/achievements`

#### Scenario: Admin manages from UI
- **WHEN** admin opens the Achievements page
- **THEN** system shows list with search/filter, New-achievement action, per-row edit and delete actions with a confirmation step before delete

#### Scenario: Member role is read-only in UI
- **WHEN** user with `user` role opens the Achievements page
- **THEN** system shows the list but hides create, edit, and delete actions
