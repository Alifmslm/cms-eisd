// PROTOTYPE — throwaway. Answers: "what bg color should the sidebar be?"
// Route: /prototype/sidebar-bg?v=<key> (dev server only, do not ship).
// Switch variants via ?v= or the floating bottom bar. Nothing persists.
import { Link, useSearchParams } from 'react-router-dom'
import {
  Calendar,
  FlaskConical,
  LayoutDashboard,
  LogOut,
  Newspaper,
  Trophy,
} from 'lucide-react'

interface Variant {
  key: string
  label: string
  hex: string
  aside: string
  title: string
  section: string
  item: string
  itemActive: string
  iconActive: string
  logout: string
  divider: string
}

const BASE_ITEM =
  'relative flex h-8 items-center gap-2 rounded-md px-2 pl-3 text-[13px] font-medium'

const VARIANTS: Variant[] = [
  {
    key: 'tint',
    label: 'Current tint',
    hex: '#F7F9FF',
    aside:
      'sticky top-0 flex h-screen w-52 shrink-0 flex-col overflow-y-auto border-r border-border bg-[#F7F9FF] p-3',
    title: 'text-sm font-semibold',
    section: 'px-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase',
    item: 'text-muted-foreground hover:bg-muted',
    itemActive: 'bg-secondary/10 font-semibold text-foreground',
    iconActive: 'text-secondary',
    logout:
      'mt-auto flex h-8 items-center gap-2 rounded-md border-t border-border px-2 pt-2 text-[13px] font-medium text-muted-foreground hover:text-foreground',
    divider: 'border-border',
  },
  {
    key: 'white',
    label: 'Pure white',
    hex: '#FFFFFF',
    aside:
      'sticky top-0 flex h-screen w-52 shrink-0 flex-col overflow-y-auto border-r border-border bg-white p-3',
    title: 'text-sm font-semibold',
    section: 'px-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase',
    item: 'text-muted-foreground hover:bg-muted',
    itemActive: 'bg-secondary/10 font-semibold text-foreground',
    iconActive: 'text-secondary',
    logout:
      'mt-auto flex h-8 items-center gap-2 rounded-md border-t border-border px-2 pt-2 text-[13px] font-medium text-muted-foreground hover:text-foreground',
    divider: 'border-border',
  },
  {
    key: 'ink',
    label: 'Dark ink',
    hex: '#171821',
    aside:
      'sticky top-0 flex h-screen w-52 shrink-0 flex-col overflow-y-auto bg-[#171821] p-3',
    title: 'text-sm font-semibold text-white',
    section: 'px-2 text-[11px] font-medium tracking-wide text-white/50 uppercase',
    item: 'text-white/60 hover:bg-white/10 hover:text-white',
    itemActive: 'bg-white/10 font-semibold text-white',
    iconActive: 'text-white',
    logout:
      'mt-auto flex h-8 items-center gap-2 rounded-md border-t border-white/10 px-2 pt-2 text-[13px] font-medium text-white/60 hover:text-white',
    divider: 'border-white/10',
  },
  {
    key: 'brand',
    label: 'Brand purple',
    hex: '#494CA0',
    aside:
      'sticky top-0 flex h-screen w-52 shrink-0 flex-col overflow-y-auto bg-[#494CA0] p-3',
    title: 'text-sm font-semibold text-white',
    section: 'px-2 text-[11px] font-medium tracking-wide text-white/60 uppercase',
    item: 'text-white/70 hover:bg-white/10 hover:text-white',
    itemActive: 'bg-white/15 font-semibold text-white',
    iconActive: 'text-white',
    logout:
      'mt-auto flex h-8 items-center gap-2 rounded-md border-t border-white/15 px-2 pt-2 text-[13px] font-medium text-white/70 hover:text-white',
    divider: 'border-white/15',
  },
  {
    key: 'paper',
    label: 'Warm paper',
    hex: '#FAF6EF',
    aside:
      'sticky top-0 flex h-screen w-52 shrink-0 flex-col overflow-y-auto border-r border-[#E8E0D2] bg-[#FAF6EF] p-3',
    title: 'text-sm font-semibold text-[#3F3A2E]',
    section: 'px-2 text-[11px] font-medium tracking-wide text-[#8A8171] uppercase',
    item: 'text-[#6B6455] hover:bg-[#EFE8D8]',
    itemActive: 'bg-[#E7DECB] font-semibold text-[#3F3A2E]',
    iconActive: 'text-secondary',
    logout:
      'mt-auto flex h-8 items-center gap-2 rounded-md border-t border-[#E8E0D2] px-2 pt-2 text-[13px] font-medium text-[#6B6455] hover:text-[#3F3A2E]',
    divider: 'border-[#E8E0D2]',
  },
  {
    key: 'slate',
    label: 'Cool slate',
    hex: '#EFF3F8',
    aside:
      'sticky top-0 flex h-screen w-52 shrink-0 flex-col overflow-y-auto border-r border-[#DCE4EE] bg-[#EFF3F8] p-3',
    title: 'text-sm font-semibold text-[#1E2A3A]',
    section: 'px-2 text-[11px] font-medium tracking-wide text-[#71809A] uppercase',
    item: 'text-[#5A6B85] hover:bg-[#E0E8F2]',
    itemActive: 'bg-[#D8E2F0] font-semibold text-[#1E2A3A]',
    iconActive: 'text-secondary',
    logout:
      'mt-auto flex h-8 items-center gap-2 rounded-md border-t border-[#DCE4EE] px-2 pt-2 text-[13px] font-medium text-[#5A6B85] hover:text-[#1E2A3E]',
    divider: 'border-[#DCE4EE]',
  },
]

const NAV = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, active: false },
  { label: 'Events', to: '/events', icon: Calendar, active: false },
  { label: 'Articles', to: '/articles', icon: Newspaper, active: false },
  { label: 'Achievements', to: '/achievements', icon: Trophy, active: true },
]

export function SidebarBgPrototype() {
  const [params, setParams] = useSearchParams()
  const active = VARIANTS.find((v) => v.key === params.get('v')) ?? VARIANTS[0]
  const pick = (key: string) => setParams({ v: key })

  return (
    <div className="flex min-h-screen bg-white text-foreground">
      <aside className={active.aside}>
        <div className="flex items-center gap-2 px-1">
          <span className="grid size-7 place-items-center rounded-md bg-secondary text-secondary-foreground">
            <FlaskConical className="size-3.5" />
          </span>
          <p className={active.title}>EISD CMS</p>
        </div>
        <div className="mt-6">
          <p className={active.section}>Menu</p>
          <nav className="mt-1 flex flex-col gap-0.5">
            {NAV.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className={`${BASE_ITEM} ${
                  item.active ? active.itemActive : active.item
                }`}
              >
                {item.active && (
                  <span className="absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 rounded-full bg-secondary" />
                )}
                <item.icon className={`size-3.5 ${item.active ? active.iconActive : ''}`} />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <button type="button" className={active.logout}>
          <LogOut className="size-3.5" />
          Log out
        </button>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col gap-6 p-6 pb-28">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">PROTOTYPE: sidebar bg</h1>
          <p className="text-sm text-muted-foreground">
            Throwaway — pick a variant below. Current: {active.label} ({active.hex}).
          </p>
        </div>
        <section className="rounded-xl border border-[#E6EAF2] bg-[#F7F9FF] p-1">
          <div className="rounded-lg border border-[#EBEBEB] bg-white p-5">
            <p className="text-sm">
              Active variant: <span className="font-semibold">{active.label}</span>{' '}
              <span className="font-mono text-xs tabular-nums">{active.hex}</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Achievements is the active nav item so you can judge the highlight bar
              against each background. Sidebar links navigate to the real pages.
            </p>
          </div>
        </section>
      </main>

      {/* Floating variant switcher */}
      <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border bg-background/95 p-1.5 shadow-lg backdrop-blur">
        {VARIANTS.map((v) => (
          <button
            key={v.key}
            type="button"
            onClick={() => pick(v.key)}
            title={`${v.label} (${v.hex})`}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              v.key === active.key
                ? 'bg-secondary text-secondary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <span
              className="size-3 rounded-full border border-border"
              style={{ backgroundColor: v.hex }}
            />
            {v.label}
          </button>
        ))}
      </div>
    </div>
  )
}
