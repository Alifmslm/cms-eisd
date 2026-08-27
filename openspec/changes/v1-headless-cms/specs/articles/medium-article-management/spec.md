## Purpose

Manages Medium articles by URL input only, with automatic metadata fetching and Draft/Publish workflow.

## ADDED Requirements

### Requirement: Add Medium article by URL
The system SHALL allow an admin to add a Medium article by pasting its URL.

#### Scenario: Successful addition
- **WHEN** admin submits a valid Medium URL
- **THEN** system fetches Open Graph metadata (title, description, cover image, published date) and creates article entry

#### Scenario: Invalid URL
- **WHEN** admin submits an invalid URL
- **THEN** system displays validation error

#### Scenario: Unreachable URL
- **WHEN** admin submits a URL that cannot be reached
- **THEN** system displays error message indicating the URL is unreachable

#### Scenario: Missing OG tags
- **WHEN** admin submits a URL without Open Graph metadata
- **THEN** system displays error message indicating metadata could not be fetched

### Requirement: Edit Medium article
The system SHALL allow an admin to edit an existing Medium article.

#### Scenario: Edit article
- **WHEN** admin edits article fields
- **THEN** system updates the article entry

#### Scenario: Change URL and re-fetch
- **WHEN** admin changes the article URL
- **THEN** system re-fetches metadata from the new URL and updates the entry

### Requirement: Delete Medium article
The system SHALL allow an admin to delete a Medium article with confirmation.

#### Scenario: Delete confirmation
- **WHEN** admin initiates article deletion
- **THEN** system displays confirmation prompt

#### Scenario: Confirm deletion
- **WHEN** admin confirms deletion
- **THEN** system removes the article permanently

### Requirement: Publish Medium article
The system SHALL allow an admin to publish a Draft article.

#### Scenario: Publish draft
- **WHEN** admin publishes a Draft article
- **THEN** system sets publishedAt timestamp and makes article publicly visible

#### Scenario: Unpublish article
- **WHEN** admin unpublishes a Published article
- **THEN** system returns article to Draft status

### Requirement: Medium article listing
The system SHALL display a list of all Medium articles.

#### Scenario: List articles
- **WHEN** admin views article list
- **THEN** system shows all articles with title, description, and publish status
