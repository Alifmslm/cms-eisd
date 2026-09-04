import { useMemo } from 'react'
import {
  Calendar,
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
import { useAuth } from '@/context/useAuth'
import { eventStatus, getDashboardData } from './dashboard.mock'

const NAV = [
  { label: 'Dashboard', icon: LayoutDashboard, active: true },
  { label: 'Events', icon: Calendar, active: false },
  { label: 'Articles', icon: Newspaper, active: false },
]

function Sidebar() {
  const { signOut } = useAuth()

  return (
    <aside className="flex w-52 shrink-0 flex-col border-r border-border bg-[#FAFAFA] p-3">
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

export function Dashboard() {
  const data = useMemo(() => getDashboardData(), [])

  const stats = [
    {
      label: 'Total events',
      value: data.totalEvents,
      icon: Calendar,
      tileClassName: 'bg-amber-500 text-white',
      breakdown: [
        { dot: 'bg-[#00D97A]', label: 'Published', value: data.publishedEvents },
        { dot: 'bg-[#F59E0B]', label: 'Draft', value: data.draftEvents },
      ],
    },
    {
      label: 'Total articles',
      value: data.totalArticles,
      icon: Newspaper,
      tileClassName: 'bg-rose-500 text-white',
      breakdown: [
        { dot: 'bg-[#494CA0]', label: 'Live', value: 1 },
        { dot: 'bg-[#F59E0B]', label: 'Draft', value: 1 },
      ],
    },
    {
      label: 'Drafts',
      value: data.draftEvents,
      icon: FileText,
      tileClassName: 'bg-cyan-600 text-white',
      breakdown: [
        { dot: 'bg-[#F59E0B]', label: 'Events', value: data.draftEvents },
        { dot: 'bg-[#494CA0]', label: 'Articles', value: 1 },
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
