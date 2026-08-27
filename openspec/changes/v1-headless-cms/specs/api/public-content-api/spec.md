## Purpose

Provides read-only API endpoints for the public website to consume published events and articles.

## ADDED Requirements

### Requirement: Public events endpoint
The system SHALL provide an API endpoint to retrieve published events.

#### Scenario: List published events
- **WHEN** public website requests GET /api/events
- **THEN** system returns only events with publishedAt timestamp set

#### Scenario: Get single event
- **WHEN** public website requests GET /api/events/:slug
- **THEN** system returns the published event matching the slug

#### Scenario: Event not found
- **WHEN** public website requests a non-existent or unpublished event
- **THEN** system returns 404 status

### Requirement: Public articles endpoint
The system SHALL provide an API endpoint to retrieve published Medium articles.

#### Scenario: List published articles
- **WHEN** public website requests GET /api/articles
- **THEN** system returns only articles with publishedAt timestamp set

#### Scenario: Get single article
- **WHEN** public website requests GET /api/articles/:id
- **THEN** system returns the published article matching the ID

#### Scenario: Article not found
- **WHEN** public website requests a non-existent or unpublished article
- **THEN** system returns 404 status

### Requirement: API response format
The system SHALL return JSON responses with consistent structure.

#### Scenario: Successful response
- **WHEN** API request is successful
- **THEN** system returns 200 status with JSON payload

#### Scenario: Error response
- **WHEN** API request fails
- **THEN** system returns appropriate error status with error message
