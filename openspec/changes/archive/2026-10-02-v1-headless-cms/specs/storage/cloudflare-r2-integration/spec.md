## Purpose

Provides object storage integration with Cloudflare R2 for storing all image files uploaded to the CMS.

## ADDED Requirements

### Requirement: Upload image to R2
The system SHALL upload all images to Cloudflare R2 object storage.

#### Scenario: Successful upload
- **WHEN** admin uploads an image
- **THEN** system stores the image in R2 and returns a public URL reference

#### Scenario: Upload failure
- **WHEN** R2 upload fails
- **THEN** system displays error message and does not save the reference to database

### Requirement: Delete image from R2
The system SHALL delete images from R2 when they are no longer referenced.

#### Scenario: Delete orphaned image
- **WHEN** an image is no longer referenced by any content
- **THEN** system removes the image from R2 storage

### Requirement: Image URL generation
The system SHALL generate public URLs for images stored in R2.

#### Scenario: Generate URL
- **WHEN** an image is stored in R2
- **THEN** system returns a publicly accessible URL for the image

#### Scenario: URL accessibility
- **WHEN** a public URL is accessed
- **THEN** the image is served directly from R2 CDN
