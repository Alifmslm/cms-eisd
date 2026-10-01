import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Award,
  Calendar,
  FlaskConical,
  LayoutDashboard,
  LogOut,
  Medal,
  Newspaper,
  Pencil,
  Plus,
  Search,
  Trash2,
  Trophy,
} from 'lucide-react'
import { Badge } from '@/components/reui/badge'
import { IconTile } from '@/components/reui/icon-tile'
import { StatNumber } from '@/components/StatNumber'
import { Alert, AlertDescription, AlertTitle } from '@/components/reui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { FilterDropdown } from '@/components/FilterDropdown'
import { useAuth } from '@/context/useAuth'
import {
  effectiveCategory,
  isChampion,
  memberNames,
  type Achievement,
  type AchievementCategory,
  type AchievementLevel,
  type AchievementResult,
} from '@/lib/achievements'
import { isAdmin } from '@/lib/roles'
import { MOCK_ACHIEVEMENTS } from '@/mocks/achievements.fixtures'

type LevelFilter = 'All' | AchievementLevel
type ResultFilter = 'All' | AchievementResult
type CategoryFilter = 'All' | AchievementCategory

const CATEGORY_FILTERS: CategoryFilter[] = [
  'All',
  'Essay',
  'UI/UX Competition',
  'Software Engineering',
  'Hackathon',
  'Other',
]
const LEVEL_FILTERS: LevelFilter[] = ['All', 'International', 'National']
const RESULT_FILTERS: ResultFilter[] = ['All', '1st Place', '2nd Place', '3rd Place', 'Finalist']

const PAGE_SIZE = 5

function formatMonth(ym: string): string {
  const [y, m] = ym.split('-')
  const date = new Date(Number(y), Number(m) - 1, 1)
  if (Number.isNaN(date.getTime())) return ym
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

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
          {item('Events', '/events', Calendar)}
          {item('Articles', '/articles', Newspaper)}
          {item('Achievements', '/achievements', Trophy, true)}
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

function ResultBadge({ result }: { result: string }) {
  if (result === '1st Place' || result === '2nd Place' || result === '3rd Place')
    return <Badge variant="success-light">{result}</Badge>
  if (result === 'Finalist') return <Badge variant="warning-light">{result}</Badge>
  return <Badge variant="info-light">{result}</Badge>
}

export function Achievements() {
  const { user } = useAuth()
  const admin = isAdmin(user?.role)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All')
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('All')
  const [resultFilter, setResultFilter] = useState<ResultFilter>('All')
  const [yearFilter, setYearFilter] = useState<string>('All')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)
  // Prototype: deletion is confirmed then applied in memory only.
  // DELETE /api/achievements/:id lands with the real API (task 3.1/3.3).
  const [pendingDelete, setPendingDelete] = useState<Achievement | null>(null)

  useEffect(() => {
    let live = true
    // Prototype: fixtures first; task 3.3 wires fetchAchievements() here.
    const t = setTimeout(() => {
      if (live) {
        setAchievements(MOCK_ACHIEVEMENTS)
        setLoading(false)
      }
    }, 0)
    return () => {
      live = false
      clearTimeout(t)
    }
  }, [])

  const yearOptions = useMemo(() => {
    const years = new Set(achievements.map((a) => a.competitionYearMonth.slice(0, 4)))
    return ['All', ...[...years].sort((a, b) => b.localeCompare(a))]
  }, [achievements])

  // Dashboard-style stat cards: total split into champion / finalist detail.
  const stats = useMemo(() => {
    let champions = 0
    let finalists = 0
    for (const a of achievements) {
      if (isChampion(a)) champions += 1
      else if (a.result === 'Finalist') finalists += 1
    }
    return [
      { label: 'Total achievements', value: achievements.length, icon: Trophy, tileClassName: 'bg-amber-500 text-white' },
      { label: 'Champions', value: champions, icon: Medal, tileClassName: 'bg-emerald-500 text-white' },
      { label: 'Finalists', value: finalists, icon: Award, tileClassName: 'bg-cyan-600 text-white' },
    ]
  }, [achievements])

  const rowRefs = useRef(new Map<string, HTMLTableRowElement>())
  const prevRects = useRef(new Map<string, DOMRect>())

  // Prototype: confirmed deletion, in memory only (DELETE /api/achievements/:id
  // lands with the real API).
  const confirmDelete = () => {
    if (!pendingDelete) return
    const title = pendingDelete.competitionName
    setAchievements((prev) => prev.filter((a) => a.id !== pendingDelete.id))
    setPendingDelete(null)
    toast.success(`“${title}” was deleted.`)
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
    return achievements
      .filter((a) => (categoryFilter === 'All' ? true : a.category === categoryFilter))
      .filter((a) => (levelFilter === 'All' ? true : a.level === levelFilter))
      .filter((a) => (resultFilter === 'All' ? true : a.result === resultFilter))
      .filter((a) =>
        yearFilter === 'All' ? true : a.competitionYearMonth.startsWith(yearFilter),
      )
      .filter((a) =>
        q
          ? `${a.competitionName} ${memberNames(a).join(' ')} ${a.members.map((m) => m.assistantCode).join(' ')}`
              .toLowerCase()
              .includes(q)
          : true,
      )
      .sort(
        (a, b) =>
          b.competitionYearMonth.localeCompare(a.competitionYearMonth) ||
          +new Date(b.updatedAt) - +new Date(a.updatedAt),
      )
  }, [achievements, categoryFilter, levelFilter, resultFilter, yearFilter, query])

  // Reset to the first page whenever the visible set changes.
  useEffect(() => {
    setPage(0)
  }, [categoryFilter, levelFilter, resultFilter, yearFilter, query])

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pages - 1)
  const items = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE)
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

  // FLIP playback: after the visible order changes (filter, search), glide
  // each surviving row from its previous position to its new one. Page
  // changes are excluded — remounted rows already cascade in via CSS.
  const prevPage = useRef(safePage)
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
  }, [filtered, safePage])

  return (
    <div className="flex min-h-screen bg-white text-foreground">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col gap-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold">Achievements</h1>
            <p className="text-sm text-muted-foreground">Competition wins and finalist records</p>
          </div>
          {admin && (
            <Link to="/achievements/new">
              <Button className="text-white">
                <Plus className="size-4" /> New achievement
              </Button>
            </Link>
          )}
        </div>

        {/* Stat cards in #F7F9FF wrapper — same entrance as the dashboard:
            wrapper lands first, cards cascade after with a 50ms stagger. */}
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

        <section
          style={{ animationDelay: '100ms' }}
          className="section-enter rounded-xl border border-[#E6EAF2] bg-[#F7F9FF] p-1"
        >
          <div className="flex flex-col gap-4 rounded-lg border border-[#EBEBEB] bg-white p-5">
            <div className="flex flex-wrap items-center gap-x-1 gap-y-2 rounded-lg bg-white py-2">
              <div className="relative mr-auto w-full max-w-64">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search competition, member, code…"
                  aria-label="Search achievements"
                  className="pl-8"
                />
              </div>
              <span className="hidden h-5 w-px bg-border sm:block" />
              <FilterDropdown
                label="Category"
                value={categoryFilter}
                options={CATEGORY_FILTERS}
                onPick={setCategoryFilter}
              />
              <span className="hidden h-5 w-px bg-border sm:block" />
              <FilterDropdown
                label="Level"
                value={levelFilter}
                options={LEVEL_FILTERS}
                onPick={setLevelFilter}
              />
              <span className="hidden h-5 w-px bg-border sm:block" />
              <FilterDropdown
                label="Result"
                value={resultFilter}
                options={RESULT_FILTERS}
                onPick={setResultFilter}
              />
              <span className="hidden h-5 w-px bg-border sm:block" />
              <FilterDropdown
                label="Year"
                value={yearFilter}
                options={yearOptions}
                onPick={setYearFilter}
                align="right"
              />
            </div>

            {loading ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Loading achievements…</p>
            ) : filtered.length === 0 ? (
              <div className="py-4">
                <Alert>
                  <AlertTitle>No achievements match</AlertTitle>
                  <AlertDescription>
                    {achievements.length === 0
                      ? 'Create your first achievement to see it here.'
                      : 'Try clearing the search or choosing a different filter.'}
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <>
              <div className="overflow-x-auto overflow-y-clip">
                <table className="w-full min-w-[760px] text-sm">
                  <thead>
                    <tr className="text-left text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                      <th className="pb-2 font-medium">Competition</th>
                      <th className="pb-2 font-medium">Members</th>
                      <th className="pb-2 text-left font-medium">Category</th>
                      <th className="pb-2 font-medium">Result</th>
                      <th className="pb-2 font-medium whitespace-nowrap">Year</th>
                      {admin && <th className="w-24 pb-2" />}
                    </tr>
                  </thead>
                  <tbody key={safePage}>
                    {items.map((a, i) => (
                      <tr
                        key={a.id}
                        ref={(el) => {
                          if (el) rowRefs.current.set(a.id, el)
                          else rowRefs.current.delete(a.id)
                        }}
                        style={{ animationDelay: `${i * 40}ms` }}
                        className="page-row-enter border-t border-border align-middle even:bg-[#F7F9FF]"
                      >
                        <td className="max-w-72 py-3 pr-3 pl-2">
                          <div className="flex min-w-0 flex-col">
                            <span className="block truncate font-medium">{a.competitionName}</span>
                            <span className="truncate text-xs text-muted-foreground">
                              {a.members.map((m) => `${m.name} (${m.assistantCode})`).join(', ')}
                            </span>
                          </div>
                        </td>
                        <td className="max-w-48 py-3 pr-3 text-xs text-muted-foreground">
                          <span className="block truncate">{a.level}</span>
                        </td>
                        <td className="py-3 pr-3 text-left text-xs whitespace-nowrap text-muted-foreground">
                          {effectiveCategory(a)}
                          {a.category === 'Other' && (
                            <span className="ml-1 text-[10px]">(Other)</span>
                          )}
                        </td>
                        <td className="py-3 pr-3">
                          <ResultBadge result={a.result} />
                        </td>
                        <td className="py-3 pr-3 text-xs whitespace-nowrap text-muted-foreground tabular-nums">
                          {formatMonth(a.competitionYearMonth)}
                        </td>
                        {admin && (
                          <td className="py-3 pr-2 text-right">
                            <span className="inline-flex items-center gap-3">
                              <Link
                                to={`/achievements/${a.id}/edit`}
                                title={`Edit “${a.competitionName}”`}
                                aria-label={`Edit ${a.competitionName}`}
                                className="grid size-7 place-items-center rounded-md border border-border text-muted-foreground hover:bg-secondary/10 hover:text-secondary"
                              >
                                <Pencil className="size-3.5" />
                              </Link>
                              <button
                                type="button"
                                onClick={() => setPendingDelete(a)}
                                title={`Delete “${a.competitionName}” permanently`}
                                aria-label={`Delete ${a.competitionName}`}
                                className="grid size-7 place-items-center rounded-md border border-border text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </span>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
              </>
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
            aria-labelledby="delete-achievement-title"
            aria-describedby="delete-achievement-desc"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-xl border border-border bg-background p-5 shadow-lg"
          >
            <h2 id="delete-achievement-title" className="text-base font-semibold">
              Delete “{pendingDelete.competitionName}”?
            </h2>
            <p id="delete-achievement-desc" className="mt-1.5 text-sm text-muted-foreground">
              This will permanently remove the achievement record. This can’t be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" autoFocus onClick={() => setPendingDelete(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete achievement
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
