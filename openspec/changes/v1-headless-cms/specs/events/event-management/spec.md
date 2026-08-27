## Purpose

Manages the full lifecycle of events including creation, editing, deletion, and Draft/Publish workflow with computed status.

## ADDED Requirements

### Requirement: Create event
The system SHALL allow an admin to create a new event with all required fields.

#### Scenario: Successful creation
- **WHEN** admin submits event with title, cover image, header image, preview description, full description, location, start date, and end date
- **THEN** system creates the event as a Draft and generates a unique slug from the title

#### Scenario: Missing required fields
- **WHEN** admin submits event with missing required fields
- **THEN** system displays validation errors for each missing field

#### Scenario: Invalid date range
- **WHEN** admin submits event with end date before start date
- **THEN** system displays validation error

### Requirement: Edit event
The system SHALL allow an admin to edit an existing event.

#### Scenario: Edit draft event
- **WHEN** admin edits a Draft event
- **THEN** system updates the event and preserves Draft status

#### Scenario: Edit published event
- **WHEN** admin edits a Published event
- **THEN** system updates the event and changes go live immediately

### Requirement: Delete event
The system SHALL allow an admin to delete an event with confirmation.

#### Scenario: Delete confirmation
- **WHEN** admin initiates event deletion
- **THEN** system displays confirmation prompt

#### Scenario: Confirm deletion
- **WHEN** admin confirms deletion
- **THEN** system removes the event permanently

### Requirement: Publish event
The system SHALL allow an admin to publish a Draft event.

#### Scenario: Publish draft
- **WHEN** admin publishes a Draft event
- **THEN** system sets publishedAt timestamp and makes event publicly visible

#### Scenario: Unpublish event
- **WHEN** admin unpublishes a Published event
- **THEN** system returns event to Draft status

### Requirement: Event status computation
The system SHALL compute event status from start and end dates on every read.

#### Scenario: Incoming status
- **WHEN** current date is before event start date
- **THEN** status is "Incoming"

#### Scenario: On Going status
- **WHEN** current date is between start and end dates (inclusive)
- **THEN** status is "On Going"

#### Scenario: Finished status
- **WHEN** current date is after event end date
- **THEN** status is "Finished"

### Requirement: Slug generation
The system SHALL automatically generate a unique slug from the event title.

#### Scenario: Generate slug
- **WHEN** admin creates an event with title "Annual Meeting 2026"
- **THEN** system generates slug "annual-meeting-2026"

#### Scenario: Slug collision
- **WHEN** generated slug already exists
- **THEN** system appends a suffix to ensure uniqueness

### Requirement: Image upload
The system SHALL support uploading cover, header, and gallery images for events.

#### Scenario: Upload cover image
- **WHEN** admin uploads a cover image
- **THEN** system validates 16:9 aspect ratio and stores in object storage

#### Scenario: Upload gallery images
- **WHEN** admin uploads gallery images
- **THEN** system stores up to 4 images in object storage

#### Scenario: File size validation
- **WHEN** admin uploads an image exceeding size limit
- **THEN** system rejects upload with clear error message

### Requirement: Event listing
The system SHALL display a list of all events with status indicators.

#### Scenario: List events
- **WHEN** admin views event list
- **THEN** system shows all events with title, status, and dates

#### Scenario: Filter by status
- **WHEN** admin filters events by status
- **THEN** system shows only events matching the selected status
