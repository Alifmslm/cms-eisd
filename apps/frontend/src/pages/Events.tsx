import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  FlaskConical,
  LayoutDashboard,
  LogOut,
  MapPin,
  Newspaper,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import { Badge } from '@/components/reui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/reui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FilterDropdown } from '@/components/FilterDropdown'
import { useAuth } from '@/context/useAuth'
import {
  fetchAdminEvents,
  formatShort,
  getEventStatus,
  togglePublishState,
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
  if (status === 'On Going') return <Badge variant="warning-light">On Going</Badge>
  return <Badge variant="success-light">Finished</Badge>
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
  // 11.7 prototype: deletion is confirmed then applied in memory only.
  const [pendingDelete, setPendingDelete] = useState<AdminEvent | null>(null)
  const [deletedNotice, setDeletedNotice] = useState<string | null>(null)

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

  // 11.6 prototype: optimistic in-memory flip. No backend call yet —
  // POST `:id/publish` / `:id/unpublish` lands with the real API.
  const togglePublish = (id: string) =>
    setEvents((prev) => prev.map((e) => (e.id === id ? togglePublishState(e) : e)))

  // 11.7 prototype: confirmed deletion, in memory only (DELETE /api/events/:id
  // lands with the real API, including R2 image cleanup per task 6.3).
  const confirmDelete = () => {
    if (!pendingDelete) return
    const title = pendingDelete.title
    setEvents((prev) => prev.filter((e) => e.id !== pendingDelete.id))
    setPendingDelete(null)
    setDeletedNotice(`“${title}” was deleted (mock — resets on reload).`)
  }

  useEffect(() => {
    if (!pendingDelete) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPendingDelete(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pendingDelete])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return events
      .filter((e) => (statusFilter === 'All' ? true : getEventStatus(e) === statusFilter))
      .filter((e) => {
        if (publishFilter === 'Published') return e.publishedAt !== null
        if (publishFilter === 'Draft') return e.publishedAt === null
        return true
      })
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
          <Link to="/events/new">
            <Button className="text-white">
              <Plus className="size-4" /> New event
            </Button>
          </Link>
        </div>

        {deletedNotice && (
          <Alert>
            <AlertTitle>Deleted</AlertTitle>
            <AlertDescription>
              <span className="mb-3 block">{deletedNotice}</span>
              <Button variant="outline" size="sm" onClick={() => setDeletedNotice(null)}>
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <section className="rounded-xl border border-[#E6EAF2] bg-[#F7F9FF] p-1">
          <div className="flex flex-col gap-4 rounded-lg border border-[#EBEBEB] bg-white p-5">
            <div className="flex flex-wrap items-center gap-x-1 gap-y-2 rounded-lg bg-white py-2">
              <div className="relative mr-auto w-full max-w-64">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search title, slug, location…"
                  aria-label="Search events"
                  className="pl-8"
                />
              </div>
              <span className="hidden h-5 w-px bg-border sm:block" />
              <FilterDropdown
                label="Status"
                value={statusFilter}
                options={STATUS_FILTERS}
                onPick={setStatusFilter}
              />
              <span className="hidden h-5 w-px bg-border sm:block" />
              <FilterDropdown
                label="Publish"
                value={publishFilter}
                options={PUBLISH_FILTERS}
                onPick={setPublishFilter}
              />
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
                      <th className="w-44 pb-2" />
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
                            <div className="flex min-w-0 flex-col">
                              <span className="block truncate font-medium">{e.title}</span>
                              <span className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                                <MapPin className="size-3 shrink-0" />
                                {e.location}
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
                          <td className="py-3 pr-2 text-right">
                            <span className="inline-flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => togglePublish(e.id)}
                                title={
                                  e.publishedAt !== null
                                    ? `Unpublish “${e.title}” (back to Draft)`
                                    : `Publish “${e.title}” (goes live)`
                                }
                                aria-label={
                                  e.publishedAt !== null
                                    ? `Unpublish ${e.title}`
                                    : `Publish ${e.title}`
                                }
                                className={
                                  e.publishedAt !== null
                                    ? 'text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline'
                                    : 'text-xs font-medium text-success-foreground underline-offset-4 hover:underline'
                                }
                              >
                                {e.publishedAt !== null ? 'Unpublish' : 'Publish'}
                              </button>
                              <Link
                                to={`/events/${e.id}/edit`}
                                title={`Edit “${e.title}”`}
                                aria-label={`Edit ${e.title}`}
                                className="grid size-7 place-items-center rounded-md border border-border text-muted-foreground hover:bg-secondary/10 hover:text-secondary"
                              >
                                <Pencil className="size-3.5" />
                              </Link>
                              <button
                                type="button"
                                onClick={() => {
                                  setDeletedNotice(null)
                                  setPendingDelete(e)
                                }}
                                title={`Delete “${e.title}” permanently`}
                                aria-label={`Delete ${e.title}`}
                                className="grid size-7 place-items-center rounded-md border border-border text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </span>
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

      {pendingDelete && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4"
          onClick={() => setPendingDelete(null)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-event-title"
            aria-describedby="delete-event-desc"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-xl border border-border bg-background p-5 shadow-lg"
          >
            <h2 id="delete-event-title" className="text-base font-semibold">
              Delete “{pendingDelete.title}”?
            </h2>
            <p id="delete-event-desc" className="mt-1.5 text-sm text-muted-foreground">
              This permanently removes the event{pendingDelete.publishedAt !== null ? ', including its public page,' : ''} and
              its images. There is no revision history in V1, so this can’t be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" autoFocus onClick={() => setPendingDelete(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete event
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
