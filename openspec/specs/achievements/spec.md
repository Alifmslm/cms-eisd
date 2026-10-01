## Purpose

Tracks organization member competition achievements (hackathons, UI/UX, essay, software engineering) so wins are easy to record and easy to summarize by count, category, and level.

## Requirements

### Requirement: Create member achievement
The system SHALL allow an admin to create a member achievement record with one or more members (each member has a name and their own 4-letter assistant code), competition category, competition level, achievement result, competition name, and required competition year-month (`YYYY-MM`).

#### Scenario: Admin creates team achievement
- **WHEN** admin submits two members (each with name and unique 4-letter code), category `Hackathon`, level `National`, result `1st Place`, competition name, and year-month `2026-09`
- **THEN** system creates the record with both member-code pairs and returns it with generated id and timestamps

#### Scenario: Admin creates achievement with Other category
- **WHEN** admin submits category `Other` with custom category text (e.g. `Game Jam`)
- **THEN** system stores the custom text as the effective category and returns the created record

#### Scenario: Validation rejects bad input
- **WHEN** admin submits empty member names, an assistant code not exactly 4 letters, `Other` without custom text, empty competition name, or missing/malformed year-month (not `YYYY-MM` or month outside `01-12`)
- **THEN** system returns 400 with field-level errors and creates nothing

#### Scenario: Duplicate assistant code rejected
- **WHEN** admin submits a member whose assistant code is already used by another record
- **THEN** system returns 409 with a field-level error naming the code and creates nothing

#### Scenario: Non-admin cannot create
- **WHEN** user with `user` role calls the create endpoint
- **THEN** system returns 403 Forbidden

#### Scenario: Unauthenticated cannot create
- **WHEN** unauthenticated caller calls the create endpoint
- **THEN** system returns 401 Unauthorized

### Requirement: List and filter achievements
The system SHALL allow authenticated users to list achievements ordered by competition year-month descending (then most recently updated), with search and filters including year/year-month.

#### Scenario: List ordered by year-month
- **WHEN** authenticated user lists achievements
- **THEN** system returns records ordered by `competitionYearMonth` descending, then `updatedAt` descending

#### Scenario: Search and filter
- **WHEN** authenticated user filters by category, level, result, or year/year-month, or searches competition name / member name
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
The system SHALL enforce field rules: members is 1+ entries, each with a non-empty name and their own assistant code of exactly 4 A-Z letters (case-insensitive input, stored uppercase); codes are unique within the record and across all records (duplicate returns 409); category is one of `Essay`, `UI/UX Competition`, `Software Engineering`, `Hackathon`, `Other` (custom text required 1-100 chars when `Other`); level is `International` or `National`; result is one of `1st Place`, `2nd Place`, `3rd Place`, `Finalist`; competition name is 1-200 chars; competition year-month is required `YYYY-MM` with month `01-12`.

#### Scenario: Assistant code normalization
- **WHEN** admin submits a member with assistant code `abcd`
- **THEN** system stores `ABCD`

#### Scenario: Member count matches code count
- **WHEN** admin submits two members with two codes
- **THEN** system stores both pairs; a submission with mismatched counts returns 400

#### Scenario: Year-month validation
- **WHEN** admin submits year-month `2026-13` or `Sept 2026`
- **THEN** system returns 400 and creates nothing

#### Scenario: Champion bucket definition
- **WHEN** dashboard counts champions
- **THEN** records with result `1st Place`, `2nd Place`, or `3rd Place` count as champions (competitions won), records with result `Finalist` count as finalists

### Requirement: Achievements page and navigation
The system SHALL provide an authenticated Achievements list page at `/achievements` linked from the sidebar, plus create/edit forms and delete confirmation; write controls are visible only to `admin` role.

#### Scenario: Sidebar navigation
- **WHEN** authenticated user views Dashboard, Events, Articles, or Achievements pages
- **THEN** sidebar shows an Achievements entry linking to `/achievements`

#### Scenario: Admin manages from UI
- **WHEN** admin opens the Achievements page
- **THEN** system shows list with search/filter (including year filter + year-month sort), month input on the form, New-achievement action, per-row edit and delete actions with a confirmation step before delete

#### Scenario: Member role is read-only in UI
- **WHEN** user with `user` role opens the Achievements page
- **THEN** system shows the list but hides create, edit, and delete actions
