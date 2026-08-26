# Headless CMS — V1 Plan
### Product Requirements & Information Architecture (Elaborated)

## 1. Overview

V1 delivers a minimal, stable Headless CMS for a single organization's website. Its sole job is to let an admin manage two content types — **Event** and **Medium Article** — through a dashboard, without ever touching the public website's codebase. The public website consumes this content through an API; it never scrapes external sources and never stores media itself.

## 2. Goals

- Give the admin a single place to create, edit, and publish Events and Medium Article references.
- Keep the data model simple now, but shaped so V2–V4 features (Gallery, Pengurus, Divisi, Program Kerja, Roles, Audit Log, AI tooling) can be added without breaking changes or large migrations.
- Decouple the public website from any scraping or file-storage responsibility.
- Ship something small enough to finish quickly and boring enough to be reliable.

## 3. Non-Goals (explicitly deferred)

- Multiple admin roles / permissions — V1 assumes a single admin role.
- Audit trail or revision history of edits.
- Scheduled/future-dated publishing (publish is a manual, immediate action).
- SEO tooling, auto-summary, auto-tagging, or any AI-assisted content generation.
- Managing organizational structure content (Pengurus, Divisi, Program Kerja) — that's V2.
- Homepage carousel management — V2.

## 4. Success Criteria for V1

V1 is "done" when an admin can, unassisted:
1. Log in and see a dashboard summarizing current content.
2. Create an Event from scratch, including images and rich content, save it as Draft, and later Publish it.
3. Edit or delete an existing Event.
4. Add a Medium article by pasting only its URL and have title/cover/description/date populate automatically.
5. Publish, edit, or delete that Medium article entry.
6. Trust that Event status (Incoming / On Going / Finished) is always correct without manual updates.

## 5. High-Level Architecture (conceptual, stack-agnostic)

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

Key architectural decisions carried over from the draft:
- The public website **never scrapes Medium** — metadata is fetched once, at save time, by the CMS backend, and cached in the database.
- Images are **never stored on the application server** — they go to object storage, and the database stores only references (URLs/IDs).
- Event status is **computed, not stored as an editable field** — it's derived from `startDate`/`endDate` against the current date.
- The public website only ever reads **published** content.

## 6. Core Features

### 6.1 Authentication

| Capability | Notes |
|---|---|
| Login | Single admin account (or small fixed set) for V1. No self-registration. |
| Logout | Invalidates the current session. |
| Session persistence | Admin stays logged in across page reloads within a reasonable session lifetime. |
| Route protection | Every dashboard/API route except login is inaccessible without a valid session. |

Edge cases to handle: expired session redirects to login with the intended destination preserved; failed login shows a generic error (no hinting at whether the username exists).

### 6.2 Dashboard

A single landing screen summarizing CMS state at a glance:

- **Total Events** — count of all events regardless of status.
- **Total Articles** — count of all Medium article entries.
- **Upcoming Events** — events whose computed status is "Incoming," short list, soonest first.
- **Latest Events** — most recently created/updated events, regardless of status.

Empty states matter here: if there are zero events or articles, the dashboard should say so plainly rather than show a blank widget.

### 6.3 Event Management

**Fields**

| Field | Type | Required | Notes |
|---|---|---|---|
| Title | text | yes | |
| Slug | text | auto-generated | Derived from title; must be unique; regenerated only if the admin hasn't manually overridden it, or if editable, checked for collisions. |
| Cover Image | image | yes | 16:9 ratio enforced. Used in listings/cards. |
| Header Image | image | yes | Used on the event detail page (banner). |
| Gallery Images | image array | no | Max 4 images in V1; stored as an array so V2 can raise the limit without a schema change. |
| Preview Description | text | yes | Short text for listing/cards. |
| Full Description | rich text / markdown | yes | Detail page body. |
| Location | text | yes | Free text, not geocoded in V1. |
| Start Date | date/time | yes | |
| End Date | date/time | yes | Must be ≥ Start Date; validate on save. |
| Status | computed | — | See business rules below; not directly editable. |

**Workflow**

- Every new Event starts as **Draft**. Drafts are visible only in the CMS, never on the public site.
- **Publish** is an explicit admin action that sets a `publishedAt` timestamp and makes the event publicly visible.
- An admin can edit a Published event; edits go live immediately (no separate "unpublish and re-approve" step in V1).
- **Unpublish** (returning a Published event to Draft) should be supported even if not explicitly listed — otherwise a mistakenly-published event can't be pulled back without deleting it. Worth confirming as an implicit requirement.
- **Delete** removes the event entirely. Consider a confirmation step given there's no revision history in V1 to recover from a mistake.

**List / Create / Edit / Delete** screens correspond directly to the Information Architecture below.

### 6.4 Medium Article

**Admin input:** a single Medium URL. Nothing else is typed by hand.

**On save, the backend:**
1. Fetches the URL's Open Graph metadata (Title, Cover Image, Description, Published Date, URL).
2. Persists that snapshot into the database.
3. Never re-fetches automatically afterward — the stored snapshot is the source of truth the public site reads from.

**Fields (from the entity list)**

| Field | Source |
|---|---|
| id | generated |
| url | admin input |
| title | fetched (OG) |
| description | fetched (OG) |
| coverImage | fetched (OG) |
| publishedDate | fetched (OG) |
| createdAt / updatedAt | system |

**Open questions worth resolving before build:**
- What happens if the URL is invalid, unreachable, or missing OG tags? The admin needs a clear error rather than a silently empty entry.
- Is there a manual "re-fetch metadata" action for when Medium's OG data changes after the fact, or is the snapshot permanently frozen once saved? (Not specified in the draft — recommend adding a manual refresh action, since Medium articles occasionally get edited.)
- Does an admin need to edit the fetched fields manually (e.g., a bad auto-fetched description), or is edit limited to swapping the URL and re-fetching?

**Workflow:** Draft → Publish, same pattern as Events (the draft doc doesn't list Draft explicitly for articles, but the IA section includes "Publish" as an action, implying a draft state exists here too — recommend keeping the same two-state model as Events for consistency).

## 7. Business Rules

**Event status (computed on every read, not stored):**

| Condition | Status |
|---|---|
| today < Start Date | Incoming |
| Start Date ≤ today ≤ End Date | On Going |
| today > End Date | Finished |

This means status can never drift out of sync with the dates — there's no background job required to "update" it, which keeps V1 simple.

**Slug generation:** derived from title, lowercase, hyphenated, uniqueness enforced (append a suffix on collision). Should be generated once on creation; whether it updates automatically when the title changes later is a decision to make explicitly (auto-regenerating slugs after publish can break already-shared links, so likely: freeze slug after first publish).

## 8. Information Architecture

```
Dashboard
├── Dashboard (overview)
├── Event
│   ├── List
│   ├── Create
│   ├── Edit
│   ├── Delete
│   ├── Draft
│   └── Publish
├── Artikel Medium (Medium Article)
│   ├── List
│   ├── Add Medium URL
│   ├── Edit
│   ├── Delete
│   └── Publish
└── Profile
```

"Draft" and "Publish" under Event are states/actions surfaced from the List/Edit views (e.g., a status toggle or button), not separate screens — worth confirming this interpretation during UI design.

## 9. Mandatory Cross-Cutting Features

- **Automatic slug generation** — see business rules above.
- **Draft & Publish workflow** — applies to both Event and Medium Article.
- **Upload progress** — any image upload shows progress feedback; large galleries (up to 4 images) shouldn't feel like a frozen screen.
- **File size validation** — reject oversized images before upload starts, with a clear limit shown to the admin.
- **Image ratio validation** — Cover Image must be validated as 16:9 before it's accepted; Header/Gallery images need their own defined constraints (not specified in the draft — recommend defining explicit target ratios for each before build).
- **Image compression before upload** — where feasible, to control storage cost and load time on the public site.

## 10. Entities (Conceptual)

**Event**
```
id, slug, title, previewDescription, content,
coverImage, headerImage, galleryImages[],
location, startDate, endDate,
createdAt, updatedAt, publishedAt
```

**MediumArticle**
```
id, url, title, description, coverImage, publishedDate,
createdAt, updatedAt
```

Both entities carry `createdAt`/`updatedAt` for basic traceability even without full audit logging, and both are structured to accept a `publishedAt`-style field so V3's "Scheduled Publish" can slot in later without restructuring.

## 11. Assumptions & Items to Confirm

These aren't blockers, but should be settled before or during build:

1. Single admin vs. multiple admin accounts in V1 (roles arrive in V3, but even without roles, is there more than one login?).
2. Whether unpublishing an Event/Article is in scope for V1 (recommended: yes, low cost, avoids "delete as the only undo").
3. Behavior when Medium OG fetch fails or the article is later deleted from Medium.
4. Exact aspect-ratio/size rules for Header and Gallery images (only Cover Image's 16:9 is specified).
5. Whether the Medium Article workflow truly needs a Draft state, or "Publish" is the only state transition it has.