# Headless CMS — Roadmap (V1 → V4)

This is a rough, directional plan. Scope and order may shift as V1 ships and real usage surfaces new priorities. The guiding principle across every version: **data structures made in earlier versions should absorb later versions without large migrations.**

---

## V1 — Foundation
*Goal: a simple, stable base the org can actually run on.*

- Authentication (login, logout, session)
- Dashboard (totals, upcoming events, latest events)
- Event management (create/edit/delete, Draft → Publish, computed status)
- Medium Article management (URL-only input, auto-fetched Open Graph metadata, Draft → Publish)

V1 intentionally excludes anything that isn't needed to get real Event and Article content onto the public site.

---

## V2 — Organizational Content Expansion
*Goal: extend the CMS to cover the rest of the organization's static content, and enrich Events.*

- **Gallery** — expand beyond the V1 cap (currently 4 images per event); gallery is already array-based in V1 specifically so this doesn't require a schema change.
- **Pengurus** (organization members/board) — new content type, likely name, role, photo, term.
- **Divisi** (divisions/departments) — new content type, likely name, description, possibly linked members.
- **Program Kerja** (work programs/initiatives) — new content type, likely tied to a Divisi and/or a time period.
- **Carousel Homepage** — admin-managed rotating banner for the public site's homepage, likely referencing existing Events/Articles/custom slides.

---

## V3 — Governance & Content Operations
*Goal: move from "one admin, no history" to something safer for a growing team.*

- **Role Management** — multiple admin roles with different permissions (e.g., editor vs. publisher).
- **Audit Log** — who changed what, and when, across content types.
- **Revision History** — ability to view/revert previous versions of an Event or other content.
- **Scheduled Publish** — set a future `publishedAt` instead of publishing immediately (V1's entity design already anticipates this).
- **SEO** — per-page metadata (title tags, descriptions, social previews) editable by the admin.

---

## V4 — AI-Assisted Content Tools
*Goal: reduce manual admin effort on repetitive content tasks.*

- **AI Assistant** — general-purpose assistance inside the CMS for drafting/editing content.
- **Auto Summary** — generate a Preview Description from a Full Description automatically.
- **SEO Generator** — auto-suggest the metadata introduced in V3.
- **Alt Text Generator** — auto-generate accessibility text for uploaded images.
- **Auto Tagging** — automatically categorize/tag Events or Articles for discovery/filtering.

---

## Cross-Version Design Notes

- Every content type introduced from V1 onward should carry `createdAt`/`updatedAt` (and ideally `publishedAt`) from day one, even before Draft/Publish or scheduling logic needs them — cheaper to add the column early than to backfill it later.
- Object storage (not the app server) stays the single home for all media across every version — Gallery expansion, Carousel, and Alt Text generation in later versions all build on this V1 decision rather than changing it.
- Role Management (V3) will likely need to reach back and retrofit "created by" / "last edited by" onto V1 and V2 entities — worth keeping in mind even though it's out of scope now.