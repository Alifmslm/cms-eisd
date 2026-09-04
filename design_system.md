# EISD Laboratory CMS — Design System

## 1. Overview
- **Product:** Admin dashboard / CMS for EISD Laboratory ([eisd.site](https://www.eisd.site/))
- **Direction:** Simple, minimalist, data-first UI
- **Component foundation:** [ReUI](https://reui.io) (shadcn/ui + Tailwind CSS + Radix UI). Anything not explicitly defined in this document should follow ReUI's default components, states, and interaction patterns.

## 2. Color System

### Brand
| Token | Hex | Usage |
|---|---|---|
| `--color-primary` | `#00D97A` | Primary actions, active/selected states, success & positive indicators |
| `--color-secondary` | `#494CA0` | Secondary actions, links, active nav item, chart accents |

### Surfaces & Neutrals
| Token | Hex | Usage |
|---|---|---|
| `--color-sidebar` | `#FFFFFF` | Sidebar background |
| `--color-background` | `#F0F0F0` | Main dashboard/content background |
| `--color-card` | `#FFFFFF` | Card / panel surface |
| `--color-border` | `#E5E5E5` | Card border, dividers, input border *(you wrote `#e5e5e` — assumed a typo for `#E5E5E5`; flag if a different shade was meant)* |
| `--color-text-primary` | `#1A1A1A` | Primary text *(not specified — proposed for AA contrast; confirm)* |
| `--color-text-secondary` | `#6B7280` | Muted/secondary text *(not specified — proposed for AA contrast (~4.8:1 on white); confirm)* |

### Suggested proportion (70 / 20 / 10)
- **70% neutral** — background, cards, sidebar, borders, body text. Keeps the dashboard calm and readable.
- **20% secondary** `#494CA0` — structural elements: active nav item, section headers, selected states, secondary buttons.
- **10% primary** `#00D97A` — primary CTAs, success states, key metrics, focus highlights.

This keeps both brand colors visible without either competing for attention against the minimalist neutral base.

### Status colors *(not specified — proposed)*
| State | Hex |
|---|---|
| Success | `#00D97A` (reuse primary) |
| Warning | `#F59E0B` |
| Error | `#EF4444` |
| Info | `#494CA0` (reuse secondary) |

## 3. Typography
- **Primary:** Stack Sans Text — Google Fonts, variable weight 200–700
- **Fallback:** Inter, sans-serif
- **Weights in use:** Regular 400 (body), Medium 500 (labels/emphasis), Semibold 600 (headings)

| Style | Size | Line-height | Weight |
|---|---|---|---|
| H1 | 32px | 40px | 600 |
| H2 | 24px | 32px | 600 |
| H3 | 20px | 28px | 600 |
| H4 | 16px | 24px | 500 |
| Body | 14px | 20px | 400 |
| Small / Caption | 12px | 16px | 400 |

## 4. Spacing
- **Base unit:** 4px — every gap, padding, and margin is a multiple of 4.
- **Scale:** 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 96
- **Tailwind mapping:** `gap-1` (4px) · `gap-2` (8px) · `gap-3` (12px) · `gap-4` (16px) · `gap-5` (20px) · `gap-6` (24px) · `gap-8` (32px) · `gap-10` (40px) · `gap-12` (48px) · `gap-16` (64px) · `gap-24` (96px). Same steps for `p-*` / `m-*` / `space-*`.
- **Rule:** never use odd / non-4px values (e.g. no 6px, 10px, 14px gaps). Round to the nearest 4px step. All prototype and production UI follows this.

## 5. Radius & Elevation
*Not specified — following ReUI/shadcn defaults:*
- **Radius:** `sm` 4px (badges, chips) · `md` 6px (buttons, inputs) · `lg` 8px (cards, modals)
- **Elevation:** stay flat by default. Reserve shadow for floating elements only (dropdowns, modals, popovers/toasts) — no decorative shadow on static cards; layering comes from the card-white-on-`#F0F0F0` contrast instead.

## 6. Iconography
- No emoji anywhere in the UI.
- Icon set: **Lucide** (ReUI/shadcn's default, already installed with the component library) — no external/emoji icons.
- Standard sizes: 16px inline/labels, 20px buttons/nav.

## 7. Layout
- **Sidebar:** fixed, white (`--color-sidebar`), navigation + branding.
- **Main content:** `--color-background` (`#F0F0F0`), scrolls independently.
- **Cards:** white (`--color-card`), `--color-border` outline, `radius-lg`, sit on top of the main background — the neutral tone shift plus border does the layering job instead of shadow.

## 8. Accessibility
- Minimum contrast: **WCAG 2.1 AA** (4.5:1 body text, 3:1 large text/UI components).
- Visible keyboard focus ring on every interactive element (suggest `--color-secondary` at sufficient contrast).
- Respect `prefers-reduced-motion`.

## 9. Motion
*Not specified — recommended, in line with "simple and minimalist":*
- Short transitions only: 150–200ms, ease-out, on hover/focus/state changes.
- No page-load choreography or scroll-triggered reveals — the dashboard is a tool, not a landing page.

## 10. Components
Core dashboard components — ReUI defaults apply unless noted:
- **Buttons:** primary / secondary / ghost / destructive — primary variant uses `--color-primary`
- **Inputs / Select / Textarea:** ReUI form primitives
- **Data Grid / Table:** ReUI Data Grid
- **Cards, Badges, Tabs, Dialog/Modal, Toast:** ReUI defaults
- **Sidebar Nav:** ReUI sidebar pattern; active item styled with `--color-secondary`

For any component, state, or pattern not covered above, default to ReUI's (shadcn/ui) standard implementation.