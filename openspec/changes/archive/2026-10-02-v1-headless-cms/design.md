## Context

This is a new Headless CMS project for managing Events and Medium Articles. The system needs an admin dashboard, content management APIs, and a public API for the organization's website. No existing codebase exists — this is a greenfield implementation.

## Goals / Non-Goals

**Goals:**
- Deliver a simple, reliable CMS for single-admin content management
- Use modern, well-supported technologies with strong TypeScript ecosystem
- Leverage serverless object storage for media (no local file storage)
- Keep architecture simple enough for V1 while allowing future expansion

**Non-Goals:**
- Multi-admin roles and permissions (V3)
- Audit logging and revision history (V3)
- AI-assisted content tools (V4)
- Complex CI/CD pipeline (can be added later)

## Decisions

### Frontend Framework: React with Vite

**Decision:** Use React with Vite for the admin dashboard.

**Rationale:**
- React has the largest ecosystem and community support
- Vite provides fast development experience and optimized builds
- Strong TypeScript support out of the box
- Component-based architecture suits dashboard UI patterns

**Alternatives considered:**
- Next.js: Overkill for admin dashboard (SSR not needed), adds complexity
- Vue.js: Smaller ecosystem, less TypeScript maturity

### Backend Framework: NestJS

**Decision:** Use NestJS for the API server.

**Rationale:**
- TypeScript-first with strong typing throughout
- Modular architecture aligns with capability-based spec structure
- Built-in support for authentication, validation, and error handling
- Excellent Prisma integration for database operations

**Alternatives considered:**
- Express: Too minimal, requires manual structure
- Fastify: Good performance but less mature ecosystem
- Hapi: Declining community, less TypeScript support

### Database: PostgreSQL with Prisma ORM

**Decision:** Use PostgreSQL with Prisma as the ORM.

**Rationale:**
- PostgreSQL is battle-tested, reliable, and feature-rich
- Prisma provides type-safe database access and auto-generated client
- Excellent migration support for schema evolution
- Strong JSON support for future extensibility

**Alternatives considered:**
- MySQL: Less feature-rich, weaker JSON support
- MongoDB: Schema flexibility not needed for structured content
- TypeORM: Less type safety, more verbose than Prisma

### Object Storage: Cloudflare R2

**Decision:** Use Cloudflare R2 for image storage.

**Rationale:**
- S3-compatible API (easy integration with existing libraries)
- No egress fees (significant cost savings for public website)
- Global CDN distribution for fast image delivery
- Free tier sufficient for V1 usage levels

**Alternatives considered:**
- AWS S3: Egress fees add up, more complex pricing
- Google Cloud Storage: Similar to S3 but less mature ecosystem
- Local storage: Violates architectural requirement, doesn't scale

### Image Processing: Sharp

**Decision:** Use Sharp for image compression and validation.

**Rationale:**
- Fast, efficient image processing in Node.js
- Supports format conversion, resizing, and compression
- Well-maintained with strong community support
- Works well with stream processing for memory efficiency

**Alternatives considered:**
- Jimp: Slower, less feature-rich
- GraphicsMagick: Requires external binary, more complex deployment

### Authentication: Session-based with bcrypt

**Decision:** Use session-based authentication with bcrypt password hashing.

**Rationale:**
- Simple to implement and understand
- No JWT complexity for single-admin system
- Secure with proper session management
- Easy to invalidate sessions on logout

**Alternatives considered:**
- JWT: Overkill for single-admin, adds token refresh complexity
- OAuth: Not needed for internal admin system

### API Design: RESTful with OpenAPI

**Decision:** Use RESTful API design with OpenAPI (Swagger) documentation.

**Rationale:**
- REST is widely understood and well-supported
- OpenAPI provides auto-generated documentation
- Easy to integrate with frontend and future consumers
- Standard HTTP methods and status codes

**Alternatives considered:**
- GraphQL: Overkill for simple content management
- gRPC: Not suitable for public API consumption

## Risks / Trade-offs

### Risk: R2 S3 Compatibility Edge Cases
**Risk:** Cloudflare R2 may have minor S3 API differences that cause issues.
**Mitigation:** Test thoroughly with S3 SDK, use official Cloudflare SDK if issues arise.

### Risk: Single Point of Failure
**Risk:** Single admin account means no backup access method.
**Mitigation:** Document password recovery process, consider adding recovery email in V2.

### Risk: Image Processing Performance
**Risk:** Large image uploads may timeout or consume excessive memory.
**Mitigation:** Implement chunked uploads, set reasonable file size limits, use streaming processing.

### Risk: Medium OG Metadata Changes
**Risk:** Medium may change their OG tags, breaking metadata fetching.
**Mitigation:** Store fetched metadata permanently, don't re-fetch automatically, provide manual refresh option.

### Trade-off: Simplicity vs. Features
**Trade-off:** V1 deliberately omits many features (roles, audit, scheduling) for faster delivery.
**Mitigation:** Design data structures to accommodate future features without major migrations.

### Trade-off: Single Admin vs. Security
**Trade-off:** Single admin simplifies implementation but reduces security controls.
**Mitigation:** Use strong password requirements, implement rate limiting, add proper logging.

## Migration Plan

1. **Development Setup:**
   - Clone repository
   - Set up local PostgreSQL database
   - Configure R2 credentials in environment
   - Run Prisma migrations
   - Seed admin account

2. **Deployment:**
   - Build frontend and backend
   - Deploy to hosting platform (e.g., Railway, Render, or VPS)
   - Configure R2 bucket and credentials
   - Set up database connection
   - Configure domain and SSL

3. **Rollback Strategy:**
   - Database migrations are reversible
   - R2 images are independent of application
   - Keep previous deployment artifact for quick rollback
   - Document rollback procedures

## Open Questions

(none — all technical decisions are resolved for V1)
