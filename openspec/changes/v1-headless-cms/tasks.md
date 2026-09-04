## 1. Project Setup

- [x] 1.1 Initialize monorepo structure with frontend (React) and backend (NestJS) packages and verify both projects build successfully
- [x] 1.2 Set up PostgreSQL database with Prisma ORM and verify database connection works
- [x] 1.3 Configure Cloudflare R2 bucket and credentials and verify upload functionality
- [x] 1.4 Create comprehensive .gitignore file and verify no sensitive files are tracked

## 2. Database Schema

- [x] 2.1 Design and implement User schema with id, username, passwordHash, createdAt fields and verify migration runs
- [x] 2.2 Design and implement Event schema with all required fields (title, slug, content, images, dates, etc.) and verify migration runs
- [x] 2.3 Design and implement MediumArticle schema with all required fields (url, title, description, etc.) and verify migration runs
- [x] 2.4 Create seed script for default admin account and verify admin can be created

## 3. Backend - Authentication

- [x] 3.1 Implement login endpoint with username/password validation and bcrypt comparison and verify login works
- [x] 3.2 Implement session management with express-session and verify session persistence across requests
- [x] 3.3 Implement logout endpoint that invalidates session and verify session is destroyed
- [x] 3.4 Implement auth guard for protected routes and verify unauthenticated access is blocked

## 4. Backend - Event Management

- [x] 4.1 Implement event CRUD endpoints (create, read, update, delete) and verify each operation works
- [x] 4.2 Implement automatic slug generation from title with uniqueness check and verify slug is created correctly
- [x] 4.3 Implement event status computation from start/end dates and verify Incoming/On Going/Finished status
- [x] 4.4 Implement Draft/Publish workflow with publishedAt timestamp and verify status transitions

## 5. Backend - Medium Article Management

- [x] 5.1 Implement URL validation and Open Graph metadata fetching and verify metadata is extracted correctly
- [x] 5.2 Implement article CRUD endpoints and verify each operation works
- [x] 5.3 Implement Draft/Publish workflow for articles and verify status transitions

## 6. Backend - Image Storage

- [x] 6.1 Implement R2 upload service with multipart handling and verify images are stored in R2
- [x] 6.2 Implement image validation (aspect ratio, file size) and verify invalid images are rejected
- [x] 6.3 Implement image deletion from R2 when content is deleted and verify orphaned images are removed

## 7. Backend - Public API

- [x] 7.1 Implement GET /api/events endpoint returning only published events and verify response format
- [x] 7.2 Implement GET /api/events/:slug endpoint and verify single event retrieval
- [x] 7.3 Implement GET /api/articles endpoint returning only published articles and verify response format
- [x] 7.4 Implement GET /api/articles/:id endpoint and verify single article retrieval
- [x] 7.5 Implement proper error handling with 404 responses for not found items

## 8. Frontend - Setup

- [x] 8.1 Set up React project with Vite, React Router, and necessary dependencies and verify dev server starts
- [x] 8.2 Set up API client with axios/fetch and verify backend communication works

## 9. Frontend - Authentication

- [x] 9.1 Create login page with username/password form and verify form submission works
- [x] 9.2 Implement authentication context/state management and verify login state persists
- [x] 9.3 Create protected route wrapper and verify unauthenticated users are redirected to login

## 10. Frontend - Dashboard

- [X] 10.1 Create dashboard layout with navigation sidebar and verify layout renders correctly
- [X] 10.2 Implement statistics cards (total events, total articles) and verify data displays
- [X] 10.3 Implement upcoming events list widget and verify events are sorted by start date
- [X] 10.4 Implement latest events list widget and verify events are sorted by update date
- [X] 10.5 Implement empty state messages for no content scenarios

## 11. Frontend - Event Management

- [ ] 11.1 Create event list page with status indicators and verify events display correctly
- [ ] 11.2 Create event create/edit form with all required fields and verify form validation works
- [ ] 11.3 Implement image upload component with preview and progress indicator and verify upload works
- [ ] 11.4 Implement cover image aspect ratio validation (16:9) and verify invalid ratios are rejected
- [ ] 11.5 Implement gallery image upload (max 4) and verify limit is enforced
- [ ] 11.6 Implement publish/unpublish toggle and verify status changes
- [ ] 11.7 Implement delete confirmation dialog and verify deletion works

## 12. Frontend - Medium Article Management

- [ ] 12.1 Create article list page and verify articles display correctly
- [ ] 12.2 Create add article form with URL input only and verify form works
- [ ] 12.3 Implement URL validation and error handling for invalid/unreachable URLs
- [ ] 12.4 Implement publish/unpublish toggle for articles and verify status changes
- [ ] 12.5 Implement delete confirmation dialog for articles

## 13. Integration & Testing

- [ ] 13.1 Test complete authentication flow (login → access → logout) and verify session management
- [ ] 13.2 Test event lifecycle (create → edit → publish → unpublish → delete) and verify all operations
- [ ] 13.3 Test article lifecycle (add URL → publish → unpublish → delete) and verify metadata fetching
- [ ] 13.4 Test image upload flow (upload → display → delete) and verify R2 storage
- [ ] 13.5 Test public API endpoints and verify published content is accessible

## 14. Documentation

- [ ] 14.1 Create README with setup instructions and verify developer can follow steps
- [x] 14.2 Document API endpoints with request/response examples
- [ ] 14.3 Document deployment process and environment variables
- [ ] 14.4 Harden API docs for production: disable Swagger UI in production, remove dev-only swagger-login/swagger-logout endpoints, restore CSRF enforcement on all POST routes
