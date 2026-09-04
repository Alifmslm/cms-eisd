import { useMemo } from 'react'
import { Calendar, FileText, LayoutDashboard, Newspaper, Plus } from 'lucide-react'
import { Badge } from '@/components/reui/badge'
import { IconTile } from '@/components/reui/icon-tile'
import { Alert, AlertDescription, AlertTitle } from '@/components/reui/alert'
import { Button } from '@/components/ui/button'
import { eventStatus, getDashboardData } from './dashboard.mock'

const NAV = [
  { label: 'Dashboard', icon: LayoutDashboard, active: true },
  { label: 'Events', icon: Calendar, active: false },
  { label: 'Articles', icon: Newspaper, active: false },
]

export function Dashboard() {
  const data = useMemo(() => getDashboardData(), [])

  const stats = [
    { label: 'Total events', value: data.totalEvents, hint: `${data.publishedEvents} published`, icon: Calendar, tileClassName: 'bg-amber-500 text-white' },
    { label: 'Total articles', value: data.totalArticles, hint: 'Medium cross-posts', icon: Newspaper, tileClassName: 'bg-rose-500 text-white' },
    { label: 'Drafts', value: data.draftEvents, hint: 'Awaiting publish', icon: FileText, tileClassName: 'bg-cyan-600 text-white' },
  ]

  return (
    <div className="flex min-h-screen bg-white text-foreground">
      {/* Sidebar — white shade */}
      <aside className="flex w-60 shrink-0 flex-col gap-6 border-r border-border bg-[#FAFAFA] p-6">
        <p className="text-base font-semibold">EISD CMS</p>
        <nav className="flex flex-col gap-1">
          {NAV.map((item) => (
            <span
              key={item.label}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                item.active ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground'
              }`}
            >
              <item.icon className="size-4" />
              {item.label}
            </span>
          ))}
        </nav>
      </aside>

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
            <Button>
              <Plus className="size-4" /> New event
            </Button>
          </div>
        </div>

        {/* Stat cards in #F7F9FF wrapper — 12px radius / 4px padding+gap */}
        <section className="rounded-xl border border-[#E6EAF2] bg-[#F7F9FF] p-1">
          <div className="grid grid-cols-3 gap-1">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col gap-2 rounded-lg border border-[#EBEBEB] bg-white p-5">
                <div className="flex items-center gap-2">
                  <IconTile size="sm" variant="solid" className={s.tileClassName}>
                    <s.icon className="size-4" />
                  </IconTile>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
                <p className="text-3xl font-semibold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.hint}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Widgets in #F7F9FF wrapper — 12px wrapper / 8px cards */}
        <section className="rounded-xl border border-[#E6EAF2] bg-[#F7F9FF] p-1">
          <div className="grid grid-cols-2 gap-1">
            <div className="flex flex-col overflow-hidden rounded-lg border border-[#EBEBEB] bg-white">
              <div className="px-5 pt-5">
                <h2 className="text-base font-medium">Upcoming events</h2>
              </div>
              <div className="flex flex-col gap-4 p-5">
            {data.upcoming.length === 0 ? (
              <Alert>
                <AlertTitle>No upcoming events</AlertTitle>
                <AlertDescription>Create your first event to see it here.</AlertDescription>
              </Alert>
            ) : (
              <ul className="flex flex-col gap-3">
                {data.upcoming.map((e) => (
                  <li key={e.id} className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
                    <div className="flex min-w-0 flex-col gap-1">
                      <p className="truncate text-sm font-medium">{e.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(e.startDate).toLocaleDateString()} · {e.location}
                      </p>
                    </div>
                    <Badge variant="info-light">{eventStatus(e)}</Badge>
                  </li>
                ))}
              </ul>
            )}
              </div>
          </div>

          <div className="flex flex-col overflow-hidden rounded-lg border border-[#EBEBEB] bg-white">
            <div className="px-5 pt-5">
              <h2 className="text-base font-medium">Latest updates</h2>
            </div>
            <div className="flex flex-col gap-4 p-5">
            {data.latest.length === 0 ? (
              <Alert>
                <AlertTitle>Nothing yet</AlertTitle>
                <AlertDescription>Edits will appear here sorted by update date.</AlertDescription>
              </Alert>
            ) : (
              <ul className="flex flex-col gap-3">
                {data.latest.map((e) => (
                  <li key={e.id} className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
                    <div className="flex min-w-0 flex-col gap-1">
                      <p className="truncate text-sm font-medium">{e.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Updated {new Date(e.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    {e.publishedAt ? (
                      <Badge variant="success-light">Published</Badge>
                    ) : (
                      <Badge variant="warning-light">Draft</Badge>
                    )}
                  </li>
                ))}
              </ul>
            )}
            </div>
          </div>
          </div>
        </section>
      </main>
    </div>
  )
}
