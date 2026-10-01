// Latest updates as a column table with zebra striping in the wrapper tint.
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  ChevronRight,
  FileText,
  FlaskConical,
  LayoutDashboard,
  LogOut,
  Newspaper,
  Plus,
  Trophy,
} from 'lucide-react'
import { Badge } from '@/components/reui/badge'
import { IconTile } from '@/components/reui/icon-tile'
import { StatNumber } from '@/components/StatNumber'
import { Alert, AlertDescription, AlertTitle } from '@/components/reui/alert'
import { Button } from '@/components/ui/button'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { useAuth } from '@/context/useAuth'
import {
  eventStatus,
  type DashboardArticle,
  type DashboardEvent,
  type DashboardResponse,
} from '@/lib/dashboard'

// TEMP (disable-auth-for-fe-testing) — REVERT ME: dashboard BE unwired for
// UI testing. Static mock replaces fetchDashboard() (GET /api/dashboard,
// auth-guarded → 401 with no session → "Could not load dashboard data").
// Task 2.2 rewire: delete MOCK_DASHBOARD below and restore the
// fetchDashboard() calls in `load` + `useEffect`.
const MOCK_DASHBOARD: DashboardResponse = {
  totalEvents: 3,
  totalArticles: 3,
  publishedEvents: 2,
  draftEvents: 1,
  publishedArticles: 2,
  draftArticles: 1,
  upcomingEvents: 2,
  upcomingEventsList: [
    {
      id: 'evt-mock-1',
      slug: 'mock-open-day',
      title: 'Mock Open Day',
      location: 'Main Hall',
      startDate: new Date(Date.now() + 86400000 * 2).toISOString(),
      endDate: new Date(Date.now() + 86400000 * 3).toISOString(),
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'evt-mock-2',
      slug: 'mock-workshop',
      title: 'Mock Workshop (Draft)',
      location: 'Lab 2',
      startDate: new Date(Date.now() + 86400000 * 5).toISOString(),
      endDate: new Date(Date.now() + 86400000 * 6).toISOString(),
      publishedAt: null,
      updatedAt: new Date().toISOString(),
    },
  ],
  latestEvents: [
    {
      id: 'evt-mock-1',
      slug: 'mock-open-day',
      title: 'Mock Open Day',
      location: 'Main Hall',
      startDate: new Date(Date.now() + 86400000 * 2).toISOString(),
      endDate: new Date(Date.now() + 86400000 * 3).toISOString(),
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'evt-mock-3',
      slug: 'mock-past-seminar',
      title: 'Mock Past Seminar',
      location: 'Room 101',
      startDate: new Date(Date.now() - 86400000 * 10).toISOString(),
      endDate: new Date(Date.now() - 86400000 * 9).toISOString(),
      publishedAt: new Date().toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  latestArticles: [
    {
      id: 'art-mock-1',
      title: 'Mock Published Article',
      url: 'https://example.com/mock-article',
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'art-mock-2',
      title: 'Mock Draft Article',
      url: 'https://example.com/mock-draft',
      publishedAt: null,
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ],
}

const NAV = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, active: true },
  { label: 'Events', to: '/events', icon: Calendar, active: false },
  { label: 'Articles', to: '/articles', icon: Newspaper, active: false },
  { label: 'Achievements', to: '/achievements', icon: Trophy, active: false },
]

const PAGE_SIZE = 5

type Kind = 'event' | 'article'

type FeedItem = {
  id: string
  title: string
  updatedAt: string
  kind: Kind
  published: boolean
}

function formatLong(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

// TODO: wire to the detail route when it exists.
function handleSeeDetail() {}

function Sidebar() {
  const { signOut } = useAuth()

  return (
    <aside className="sticky top-0 flex h-screen w-52 shrink-0 flex-col overflow-y-auto border-r border-border bg-[#FAFAFA] p-3">
      <div className="flex items-center gap-2 px-1">
        <span className="grid size-7 place-items-center rounded-md bg-secondary text-secondary-foreground">
          <FlaskConical className="size-3.5" />
        </span>
        <p className="text-sm font-semibold">EISD CMS</p>
      </div>
      <div className="mt-6">
        <p className="px-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">Menu</p>
        <nav className="mt-1 flex flex-col gap-0.5">
          {NAV.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`relative flex h-8 items-center gap-2 rounded-md px-2 pl-3 text-[13px] font-medium ${
                item.active ? 'bg-secondary/10 font-semibold text-foreground' : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              {item.active && (
                <span className="absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 rounded-full bg-secondary" />
              )}
              <item.icon className={`size-3.5 ${item.active ? 'text-secondary' : ''}`} />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <button
        type="button"
        onClick={() => void signOut()}
        className="mt-auto flex h-8 items-center gap-2 rounded-md border-t border-border px-2 pt-2 text-[13px] font-medium text-muted-foreground hover:text-foreground"
      >
        <LogOut className="size-3.5" />
        Log out
      </button>
    </aside>
  )
}

function StatusBadge({ published }: { published: boolean }) {
  return published ? (
    <Badge variant="success-light">Published</Badge>
  ) : (
    <Badge variant="warning-light">Draft</Badge>
  )
}

function KindChip({ kind }: { kind: Kind }) {
  return (
    <span
      className={`w-fit rounded-full border px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap ${
        kind === 'event'
          ? 'border-[#BAE6FD] bg-[#E0F2FE] text-[#0369A1]'
          : 'border-[#E2E8F0] bg-[#F1F5F9] text-[#475569]'
      }`}
    >
      {kind === 'event' ? 'Event' : 'Article'}
    </span>
  )
}

function DetailChevron({ title }: { title: string }) {
  return (
    <button
      type="button"
      title="See detail"
      aria-label={`See detail of ${title}`}
      onClick={handleSeeDetail}
      className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      <ChevronRight className="size-4" />
    </button>
  )
}

function EmptyLatest() {
  return (
    <Alert>
      <AlertTitle>Nothing yet</AlertTitle>
      <AlertDescription>Edits will appear here sorted by update date.</AlertDescription>
    </Alert>
  )
}

function UpcomingCard({ upcoming, className = '' }: { upcoming: DashboardEvent[]; className?: string }) {
  return (
    <div
      style={{ animationDelay: '250ms' }}
      className={`flex flex-col overflow-hidden rounded-lg border border-[#EBEBEB] bg-white ${className}`}
    >
      <div className="flex flex-col gap-0.5 px-5 pt-5">
        <h2 className="text-base font-medium">Upcoming events</h2>
        <p className="text-xs text-muted-foreground">Scheduled ahead, sorted by start date</p>
      </div>
      <div className="flex flex-col gap-4 p-5">
        {upcoming.length === 0 ? (
          <Alert>
            <AlertTitle>No upcoming events</AlertTitle>
            <AlertDescription>Create your first event to see it here.</AlertDescription>
          </Alert>
        ) : (
          <ul className="flex flex-col gap-3">
            {upcoming.map((e, i) => (
              <li
                key={e.id}
                style={{ animationDelay: `${Math.min(i, 9) * 40}ms` }}
                className="page-row-enter flex items-center gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p className="truncate text-sm font-medium">{e.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatLong(e.startDate)} · {e.location}
                  </p>
                </div>
                <Badge variant="info-light">{eventStatus(e)}</Badge>
                <DetailChevron title={e.title} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

// Classic column table with a header row — Type | Title | Updated | Status | action —
// zebra-striped with the wrapper tint (#F7F9FF).
// Entrance + pagination cascade matches Articles/Events: remounted rows stagger
// in via CSS, surviving rows glide via WAAPI FLIP in the parent effect.
function LatestTable({
  items,
  page,
  registerRow,
}: {
  items: FeedItem[]
  page: number
  registerRow: (id: string, el: HTMLTableRowElement | null) => void
}) {
  if (items.length === 0) return <EmptyLatest />
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          <th className="pb-2 font-medium">Type</th>
          <th className="pb-2 font-medium">Title</th>
          <th className="pb-2 font-medium whitespace-nowrap">Updated</th>
          <th className="pb-2 text-right font-medium">Status</th>
          <th className="w-9 pb-2" />
        </tr>
      </thead>
      <tbody key={page}>
        {items.map((f, i) => (
          <tr
            key={`${f.kind}-${f.id}`}
            ref={(el) => registerRow(`${f.kind}-${f.id}`, el)}
            style={{ animationDelay: `${i * 40}ms` }}
            className="page-row-enter border-t border-border even:bg-[#F7F9FF]"
          >
            <td className="py-2.5 pr-3 pl-2 rounded-l-md">
              <KindChip kind={f.kind} />
            </td>
            <td className="max-w-44 py-2.5 pr-3">
              <p className="truncate font-medium">{f.title}</p>
            </td>
            <td className="py-2.5 pr-3 text-xs whitespace-nowrap text-muted-foreground tabular-nums">
              {formatLong(f.updatedAt)}
            </td>
            <td className="py-2.5 text-right">
              <StatusBadge published={f.published} />
            </td>
            <td className="py-2.5 pr-1 pl-1 text-right rounded-r-md">
              <DetailChevron title={f.title} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function Dashboard() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [page, setPage] = useState(0)

  const load = async () => {
    setLoading(true)
    setError(false)
    try {
      // TEMP (disable-auth-for-fe-testing) — REVERT ME: use MOCK_DASHBOARD,
      // restore `await fetchDashboard()` in task 2.2.
      setDashboard(MOCK_DASHBOARD)
      setPage(0)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // TEMP (disable-auth-for-fe-testing) — REVERT ME: mock instead of
    // fetchDashboard() so /dashboard renders with no session/backend.
    // Task 2.2 rewire restores the live fetch.
    setDashboard(MOCK_DASHBOARD)
    setLoading(false)
  }, [])

  // Defensive client-side ordering: soonest start first, most recently updated first.
  const upcoming = useMemo(
    () =>
      [...(dashboard?.upcomingEventsList ?? [])].sort(
        (a, b) => +new Date(a.startDate) - +new Date(b.startDate),
      ),
    [dashboard],
  )

  const feed: FeedItem[] = useMemo(
    () =>
      [
        ...(dashboard?.latestEvents ?? []).map((e) => ({
          id: e.id,
          title: e.title,
          updatedAt: e.updatedAt,
          kind: 'event' as const,
          published: e.publishedAt !== null,
        })),
        ...(dashboard?.latestArticles ?? []).map((a: DashboardArticle) => ({
          id: a.id,
          title: a.title,
          updatedAt: a.updatedAt,
          kind: 'article' as const,
          published: a.publishedAt !== null,
        })),
      ].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)),
    [dashboard],
  )

  const pages = Math.max(1, Math.ceil(feed.length / PAGE_SIZE))
  const safePage = Math.min(page, pages - 1)
  const items = feed.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE)
  const onPage = (p: number) => setPage(Math.min(Math.max(0, p), pages - 1))
  const stopNav = (e: React.MouseEvent, p: number) => {
    e.preventDefault()
    onPage(p)
  }

  // FLIP reorder glide, same as Articles/Events: row elements keyed by id.
  // Page changes are excluded — remounted rows already cascade in via CSS,
  // so animating them again would double up. Transform-only (GPU), WAAPI so
  // a second change mid-flight retargets instead of restarting.
  const rowRefs = useRef(new Map<string, HTMLTableRowElement>())
  const prevRects = useRef(new Map<string, DOMRect>())
  const prevPage = useRef(safePage)
  const registerRow = (id: string, el: HTMLTableRowElement | null) => {
    if (el) rowRefs.current.set(id, el)
    else rowRefs.current.delete(id)
  }
  useLayoutEffect(() => {
    const next = new Map<string, DOMRect>()
    rowRefs.current.forEach((el, id) => next.set(id, el.getBoundingClientRect()))
    const prev = prevRects.current
    prevRects.current = next
    if (prevPage.current !== safePage) {
      prevPage.current = safePage
      return
    }
    if (prev.size === 0) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    rowRefs.current.forEach((el, id) => {
      const f = prev.get(id)
      if (!f) return
      const dy = f.top - el.getBoundingClientRect().top
      if (dy === 0) return
      el.animate([{ transform: `translateY(${dy}px)` }, { transform: 'translateY(0)' }], {
        duration: 260,
        easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
      })
    })
  }, [items, safePage])

  // Numbered links: all pages when few, windowed with ellipsis when many.
  const pageSlots: (number | 'gap')[] =
    pages <= 5
      ? Array.from({ length: pages }, (_, i) => i)
      : [0, safePage - 1, safePage, safePage + 1, pages - 1]
          .filter((n, i, a) => n >= 0 && n < pages && a.indexOf(n) === i)
          .sort((a, b) => (a as number) - (b as number))
          .flatMap((n, i, a) => (i > 0 && (n as number) - (a[i - 1] as number) > 1 ? (['gap', n] as (number | 'gap')[]) : [n]))

  const stats = [
    {
      label: 'Total events',
      value: dashboard?.totalEvents ?? 0,
      icon: Calendar,
      tileClassName: 'bg-amber-500 text-white',
      breakdown: [
        { dot: 'bg-[#00D97A]', label: 'Published', value: dashboard?.publishedEvents ?? 0 },
        { dot: 'bg-[#F59E0B]', label: 'Draft', value: dashboard?.draftEvents ?? 0 },
      ],
    },
    {
      label: 'Total articles',
      value: dashboard?.totalArticles ?? 0,
      icon: Newspaper,
      tileClassName: 'bg-rose-500 text-white',
      breakdown: [
        { dot: 'bg-[#494CA0]', label: 'Live', value: dashboard?.publishedArticles ?? 0 },
        { dot: 'bg-[#F59E0B]', label: 'Draft', value: dashboard?.draftArticles ?? 0 },
      ],
    },
    {
      label: 'Drafts',
      value: (dashboard?.draftEvents ?? 0) + (dashboard?.draftArticles ?? 0),
      icon: FileText,
      tileClassName: 'bg-cyan-600 text-white',
      breakdown: [
        { dot: 'bg-[#F59E0B]', label: 'Events', value: dashboard?.draftEvents ?? 0 },
        { dot: 'bg-[#494CA0]', label: 'Articles', value: dashboard?.draftArticles ?? 0 },
      ],
    },
  ]

  return (
    <div className="flex min-h-screen bg-white text-foreground">
      <Sidebar />

      {/* Main column — p-6 = 24px */}
      <main className="flex min-w-0 flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Content overview for EISD Laboratory</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Plus className="size-4" /> New article
            </Button>
            <Button className="text-white">
              <Plus className="size-4" /> New event
            </Button>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading dashboard…</p>
        ) : error || !dashboard ? (
          <Alert>
            <AlertTitle>Could not load dashboard data</AlertTitle>
            <AlertDescription>
              <span className="mb-3 block">Check your connection and try again.</span>
              <Button variant="outline" size="sm" onClick={load}>
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <>
        {/* Stat cards in #F7F9FF wrapper — 12px radius / 4px padding+gap.
            Wrapper lands first, cards cascade after with a 50ms stagger. */}
        <section className="section-enter rounded-xl border border-[#E6EAF2] bg-[#F7F9FF] p-1">
          <div className="grid grid-cols-3 gap-1">
            {stats.map((s, i) => (
              <div
                key={s.label}
                style={{ animationDelay: `${(i + 1) * 50}ms` }}
                className="section-enter flex items-stretch justify-between gap-4 rounded-lg border border-[#EBEBEB] bg-white p-5"
              >
                <div className="flex min-w-0 flex-col gap-1">
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <StatNumber value={s.value} />
                  <div className="mt-1 flex flex-col items-start gap-1">
                    {s.breakdown.map((b) => (
                      <span key={b.label} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className={`size-1.5 rounded-full ${b.dot}`} />
                        {b.label} · <span className="font-medium text-foreground tabular-nums">{b.value}</span>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end justify-start">
                  <IconTile size="sm" variant="solid" className={s.tileClassName}>
                    <s.icon className="size-4" />
                  </IconTile>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Widgets in #F7F9FF wrapper — Latest updates 60% left, Upcoming events 40% right.
            Wrapper lands at 100ms, both panels rise in after it (200/250ms). */}
        <section
          style={{ animationDelay: '100ms' }}
          className="section-enter rounded-xl border border-[#E6EAF2] bg-[#F7F9FF] p-1"
        >
          <div className="grid grid-cols-5 gap-1">
            <div
              style={{ animationDelay: '200ms' }}
              className="section-enter col-span-3 flex flex-col overflow-hidden rounded-lg border border-[#EBEBEB] bg-white"
            >
              <div className="flex flex-col gap-0.5 px-5 pt-5">
                <h2 className="text-base font-medium">Latest updates</h2>
                <p className="text-xs text-muted-foreground">Recent edits across events and articles</p>
              </div>
              <div className="flex flex-col gap-4 p-5">
                <LatestTable items={items} page={safePage} registerRow={registerRow} />
                {/* c-pagination-3 composition: Previous | numbers | Next, space-between, purple active */}
                <div className="border-t border-border pt-3">
                  <Pagination className="w-full justify-end">
                    <PaginationContent className="justify-end gap-2">
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => stopNav(e, safePage - 1)}
                          aria-disabled={safePage === 0}
                          className={safePage === 0 ? 'pointer-events-none opacity-40' : ''}
                        />
                      </PaginationItem>
                      <PaginationItem className="flex items-center gap-1">
                        {pageSlots.map((slot, i) =>
                          slot === 'gap' ? (
                            <PaginationEllipsis key={`gap-${i}`} />
                          ) : (
                            <PaginationLink
                              key={slot}
                              href="#"
                              isActive={slot === safePage}
                              onClick={(e) => stopNav(e, slot)}
                              className={
                                slot === safePage
                                  ? 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary hover:text-secondary-foreground'
                                  : 'hover:border-border hover:border!'
                              }
                            >
                              {slot + 1}
                            </PaginationLink>
                          ),
                        )}
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => stopNav(e, safePage + 1)}
                          aria-disabled={safePage === pages - 1}
                          className={safePage === pages - 1 ? 'pointer-events-none opacity-40' : ''}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            </div>
            <UpcomingCard upcoming={upcoming} className="section-enter col-span-2" />
          </div>
        </section>
          </>
        )}
      </main>
    </div>
  )
}
