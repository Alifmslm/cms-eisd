import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  FlaskConical,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  Newspaper,
  Plus,
  Search,
} from 'lucide-react'
import { Badge } from '@/components/reui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/reui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/context/useAuth'
import {
  fetchAdminEvents,
  formatShort,
  getEventStatus,
  USE_MOCKS,
  type AdminEvent,
  type EventStatus,
} from '@/lib/events'

type StatusFilter = 'All' | EventStatus
type PublishFilter = 'All' | 'Published' | 'Draft'

const STATUS_FILTERS: StatusFilter[] = ['All', 'Incoming', 'On Going', 'Finished']
const PUBLISH_FILTERS: PublishFilter[] = ['All', 'Published', 'Draft']

function Sidebar() {
  const { signOut } = useAuth()
  const item = (label: string, to: string, Icon: typeof Calendar, active = false) => (
    <Link
      key={label}
      to={to}
      className={`relative flex h-8 items-center gap-2 rounded-md px-2 pl-3 text-[13px] font-medium ${
        active ? 'bg-secondary/10 font-semibold text-foreground' : 'text-muted-foreground hover:bg-muted'
      }`}
    >
      {active && (
        <span className="absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 rounded-full bg-secondary" />
      )}
      <Icon className={`size-3.5 ${active ? 'text-secondary' : ''}`} />
      {label}
    </Link>
  )

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
          {item('Dashboard', '/dashboard', LayoutDashboard)}
          {item('Events', '/events', Calendar, true)}
          {item('Articles', '/articles', Newspaper)}
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

function ComputedBadge({ status }: { status: EventStatus }) {
  if (status === 'Incoming') return <Badge variant="info-light">Incoming</Badge>
  if (status === 'On Going') return <Badge variant="success-light">On Going</Badge>
  return <Badge variant="invert-light">Finished</Badge>
}

function PublishBadge({ published }: { published: boolean }) {
  return published ? (
    <Badge variant="success-light">Published</Badge>
  ) : (
    <Badge variant="warning-light">Draft</Badge>
  )
}

export function Events() {
  const [events, setEvents] = useState<AdminEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All')
  const [publishFilter, setPublishFilter] = useState<PublishFilter>('All')
  const [query, setQuery] = useState('')

  useEffect(() => {
    let live = true
    ;(async () => {
      const data = await fetchAdminEvents()
      if (live) {
        setEvents(data)
        setLoading(false)
      }
    })()
    return () => {
      live = false
    }
  }, [])

  const counts = useMemo(() => {
    const c: Record<EventStatus, number> = { Incoming: 0, 'On Going': 0, Finished: 0 }
    for (const e of events) c[getEventStatus(e)] += 1
    return c
  }, [events])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return events
      .filter((e) => (statusFilter === 'All' ? true : getEventStatus(e) === statusFilter))
      .filter((e) =>
        publishFilter === 'All' ? true : e.publishedAt !== null === (publishFilter === 'Published'),
      )
      .filter((e) =>
        q ? `${e.title} ${e.slug} ${e.location}`.toLowerCase().includes(q) : true,
      )
      .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
  }, [events, statusFilter, publishFilter, query])

  return (
    <div className="flex min-h-screen bg-white text-foreground">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col gap-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold">Events</h1>
            <p className="text-sm text-muted-foreground">
              {events.length} total · {counts['Incoming']} incoming · {counts['On Going']} on going ·{' '}
              {counts['Finished']} finished
            </p>
          </div>
          {/* TODO(11.2): wire to the create form when it exists. */}
          <Button className="text-white" title="Create form lands in task 11.2">
            <Plus className="size-4" /> New event
          </Button>
        </div>

        {USE_MOCKS && (
          <Alert>
            <AlertTitle>Prototype data — no backend needed</AlertTitle>
            <AlertDescription>
              Showing 6 fixtures covering Incoming / On Going / Finished + Draft / Published. Set
              VITE_USE_MOCKS=false to hit the real API.
            </AlertDescription>
          </Alert>
        )}

        <section className="rounded-xl border border-[#E6EAF2] bg-[#F7F9FF] p-1">
          <div className="flex flex-col gap-1 rounded-lg border border-[#EBEBEB] bg-white p-5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative mr-auto w-full max-w-64">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search title, slug, location…"
                  className="pl-8"
                />
              </div>
              <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filter by computed status">
                {STATUS_FILTERS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    role="tab"
                    aria-selected={statusFilter === s}
                    onClick={() => setStatusFilter(s)}
                    className={`h-7 rounded-full border px-3 text-xs font-medium transition-colors ${
                      statusFilter === s
                        ? 'border-secondary bg-secondary text-secondary-foreground'
                        : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="flex gap-1.5" role="tablist" aria-label="Filter by publish state">
                {PUBLISH_FILTERS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    role="tab"
                    aria-selected={publishFilter === p}
                    onClick={() => setPublishFilter(p)}
                    className={`h-7 rounded-full border px-3 text-xs font-medium transition-colors ${
                      publishFilter === p
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Loading events…</p>
            ) : filtered.length === 0 ? (
              <div className="py-4">
                <Alert>
                  <AlertTitle>No events match</AlertTitle>
                  <AlertDescription>
                    {events.length === 0
                      ? 'Create your first event to see it here.'
                      : 'Try clearing the search or choosing a different filter.'}
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="text-left text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                      <th className="pb-2 font-medium">Event</th>
                      <th className="pb-2 font-medium">Schedule</th>
                      <th className="pb-2 font-medium">Status</th>
                      <th className="pb-2 text-right font-medium">Publish</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((e) => {
                      const status = getEventStatus(e)
                      return (
                        <tr
                          key={e.id}
                          className="border-t border-border align-middle even:bg-[#F7F9FF]"
                        >
                          <td className="max-w-72 py-3 pr-3 pl-2">
                            <div className="flex items-center gap-3">
                              <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-md border border-border bg-muted text-muted-foreground">
                                {e.coverImage ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={e.coverImage} alt="" className="size-full object-cover" />
                                ) : (
                                  <ImageIcon className="size-4" />
                                )}
                              </span>
                              <span className="min-w-0">
                                <span className="block truncate font-medium">{e.title}</span>
                                <span className="block truncate text-xs text-muted-foreground">
                                  /{e.slug} · {e.location}
                                </span>
                              </span>
                            </div>
                          </td>
                          <td className="py-3 pr-3 text-xs whitespace-nowrap text-muted-foreground tabular-nums">
                            {formatShort(e.startDate)} → {formatShort(e.endDate)}
                          </td>
                          <td className="py-3 pr-3">
                            <ComputedBadge status={status} />
                          </td>
                          <td className="py-3 pr-2 text-right">
                            <PublishBadge published={e.publishedAt !== null} />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
