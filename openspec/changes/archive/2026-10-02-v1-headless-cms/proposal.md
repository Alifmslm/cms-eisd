## Why

The organization needs a dedicated Headless CMS to manage dynamic content (Events and Medium Articles) for its public website. Currently, any content update requires code changes and redeployment. This CMS decouples content from code, allowing an admin to manage content through a dashboard while the public website reads published content via API.

## What Changes

- **Authentication**: Single admin login/logout with session management and route protection
- **Dashboard**: Overview screen showing content statistics (total events, articles, upcoming events, latest events)
- **Event Management**: Full CRUD for events with Draft/Publish workflow, computed status (Incoming/On Going/Finished), image uploads (cover, header, gallery), rich text descriptions, and automatic slug generation
- **Medium Article Management**: Add articles by URL only — backend auto-fetches Open Graph metadata (title, description, cover image, published date), with Draft/Publish workflow
- **Image Storage**: Integration with Cloudflare R2 object storage for all media files (no local server storage)
- **Public API**: Read-only endpoints for the public website to consume published content

## Capabilities

### New Capabilities

- `auth`: Authentication system — login, logout, session management, route protection
- `dashboard`: Admin dashboard with content statistics and overview widgets
- `events/event-management`: Full event lifecycle — create, edit, delete, Draft/Publish workflow, computed status, image management
- `articles/medium-article-management`: Medium article management — URL-based entry, auto-fetched metadata, Draft/Publish workflow
- `storage/cloudflare-r2-integration`: Cloudflare R2 object storage integration for image uploads and management
- `api/public-content-api`: Read-only API endpoints for the public website to consume published events and articles

### Modified Capabilities

(none — this is the initial V1 implementation)

## Impact

- **Frontend**: React application with admin dashboard, event/article management screens, image upload components
- **Backend**: NestJS API server with authentication, content management, image upload handling, and public API endpoints
- **Database**: PostgreSQL schema for events, articles, users, and media references
- **Object Storage**: Cloudflare R2 bucket for image storage (cover images, header images, gallery images)
- **External Services**: Open Graph metadata fetching for Medium articles
- **Dependencies**: React, NestJS, Prisma ORM, Cloudflare R2 SDK, image processing libraries
