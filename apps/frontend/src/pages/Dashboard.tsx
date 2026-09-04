// Latest updates as a column table with zebra striping in the wrapper tint.
import { useEffect, useMemo, useState } from 'react'
import {
  Calendar,
  ChevronRight,
  FileText,
  FlaskConical,
  LayoutDashboard,
  LogOut,
  Newspaper,
  Plus,
} from 'lucide-react'
import { Badge } from '@/components/reui/badge'
import { IconTile } from '@/components/reui/icon-tile'
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
  fetchDashboard,
  type DashboardArticle,
  type DashboardEvent,
  type DashboardResponse,
} from '@/lib/dashboard'

const NAV = [
  { label: 'Dashboard', icon: LayoutDashboard, active: true },
  { label: 'Events', icon: Calendar, active: false },
  { label: 'Articles', icon: Newspaper, active: false },
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
            <span
              key={item.label}
              className={`relative flex h-8 items-center gap-2 rounded-md px-2 pl-3 text-[13px] font-medium ${
                item.active ? 'bg-secondary/10 font-semibold text-foreground' : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              {item.active && (
                <span className="absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 rounded-full bg-secondary" />
              )}
              <item.icon className={`size-3.5 ${item.active ? 'text-secondary' : ''}`} />
              {item.label}
            </span>
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
    <div className={`flex flex-col overflow-hidden rounded-lg border border-[#EBEBEB] bg-white ${className}`}>
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
            {upcoming.map((e) => (
              <li key={e.id} className="flex items-center gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
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
function LatestTable({ items }: { items: FeedItem[] }) {
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
      <tbody>
        {items.map((f) => (
          <tr key={`${f.kind}-${f.id}`} className="border-t border-border even:bg-[#F7F9FF]">
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
      setDashboard(await fetchDashboard())
      setPage(0)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let live = true
    ;(async () => {
      try {
        const data = await fetchDashboard()
        if (live) {
          setDashboard(data)
          setLoading(false)
        }
      } catch {
        if (live) {
          setError(true)
          setLoading(false)
        }
      }
    })()
    return () => {
      live = false
    }
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
        {/* Stat cards in #F7F9FF wrapper — 12px radius / 4px padding+gap */}
        <section className="rounded-xl border border-[#E6EAF2] bg-[#F7F9FF] p-1">
          <div className="grid grid-cols-3 gap-1">
            {stats.map((s) => (
              <div key={s.label} className="flex items-stretch justify-between gap-4 rounded-lg border border-[#EBEBEB] bg-white p-5">
                <div className="flex min-w-0 flex-col gap-1">
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-semibold tabular-nums">{s.value}</p>
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

        {/* Widgets in #F7F9FF wrapper — Latest updates 60% left, Upcoming events 40% right */}
        <section className="rounded-xl border border-[#E6EAF2] bg-[#F7F9FF] p-1">
          <div className="grid grid-cols-5 gap-1">
            <div className="col-span-3 flex flex-col overflow-hidden rounded-lg border border-[#EBEBEB] bg-white">
              <div className="flex flex-col gap-0.5 px-5 pt-5">
                <h2 className="text-base font-medium">Latest updates</h2>
                <p className="text-xs text-muted-foreground">Recent edits across events and articles</p>
              </div>
              <div className="flex flex-col gap-4 p-5">
                <LatestTable items={items} />
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
            <UpcomingCard upcoming={upcoming} className="col-span-2" />
          </div>
        </section>
          </>
        )}
      </main>
    </div>
  )
}
