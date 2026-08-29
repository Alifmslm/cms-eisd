# Organization Website — Headless CMS

## Purpose

This project is a **Headless CMS built specifically for a single organization's website**. It exists so an admin can manage dynamic content — starting with Events and Medium Articles — without ever needing to touch or redeploy the public website's own codebase.

Before this CMS, any content update would mean a code change on the public site. This project separates "content" from "code": the admin manages content through a dedicated dashboard, and the public website simply reads whatever has been published, through an API.

## Overview

- **What it manages (V1):** Events (with images, dates, location, rich description) and references to Medium articles (auto-populated from a pasted URL, no manual data entry).
- **Who uses it:** a single admin (V1), managing content that then appears on the public-facing organization website.
- **What it deliberately avoids:**
  - The public website never scrapes Medium directly — the CMS fetches and caches article metadata once, at save time.
  - Images are never stored on the application server — they live in dedicated object storage, and the database only holds references to them.
  - Event status (Incoming / On Going / Finished) is never manually set — it's always computed from the event's start and end dates.

## High-Level Architecture (conceptual)

```
Admin
  │
  ▼
CMS Dashboard  ──▶  API layer  ──▶  Database
                        │
                        ▼
                 Object Storage (images)
                        │
                        ▼
              Public Website (read-only consumer)
```

The public website is a read-only consumer of published content — it has no write access and no scraping responsibility of its own.

## Project Status

Currently in the **V1 planning stage**. V1 scope covers Authentication, Dashboard, Event Management, and Medium Article Management. See:

- [`PLAN_V1.md`](./PLAN_V1.md) — the detailed V1 product requirements and information architecture.
- [`ROADMAP.md`](./ROADMAP.md) — the rough plan from V1 through V4.

## Design Philosophy

The core principle across every version of this project: **keep V1 simple and fast to finish, but shape all data structures so future versions (Gallery expansion, organizational content, governance features, AI tooling) can be added without major migrations.**

Technology stack decisions are intentionally excluded from this documentation for now and will be addressed separately.

## User Roles

The CMS supports two user roles:

### Admin Role
- Full CRUD access to all content (events, articles)
- Can create, edit, and delete content
- Can publish and unpublish content
- Can manage user roles

### User Role
- Read-only access to the dashboard
- Can view all content but cannot modify it
- Edit/delete buttons are hidden in the UI
- Write API endpoints return 403 Forbidden

### Default Credentials
The seed script creates a default admin account:
```
username: admin
password: admin123
```

### Role-Based API Access
- **Read endpoints** (GET): Accessible by all authenticated users
- **Write endpoints** (POST, PUT, DELETE): Restricted to admin role only

### Session Management
After login, the user's role is stored in the session and checked on every request. The frontend uses the role to conditionally render UI elements.