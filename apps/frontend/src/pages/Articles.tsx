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
  fetchAdminArticles,
  formatLong,
  toggleArticlePublish,
  USE_MOCKS,
  type AdminArticle,
} from '@/lib/articles'

type PublishFilter = 'All' | 'Published' | 'Draft'

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
          {item('Events', '/events', Calendar)}
          {item('Articles', '/articles', Newspaper, true)}
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

function PublishBadge({ published }: { published: boolean }) {
  return published ? (
    <Badge variant="success-light">Published</Badge>
  ) : (
    <Badge variant="warning-light">Draft</Badge>
  )
}

export function Articles() {
  const [articles, setArticles] = useState<AdminArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [publishFilter, setPublishFilter] = useState<PublishFilter>('All')
  const [query, setQuery] = useState('')
  const [togglingId, setTogglingId] = useState<string | null>(null)

  useEffect(() => {
    let live = true
    ;(async () => {
      const data = await fetchAdminArticles()
      if (live) {
        setArticles(data)
        setLoading(false)
      }
    })()
    return () => {
      live = false
    }
  }, [])

  const counts = useMemo(() => {
    let published = 0
    for (const a of articles) if (a.publishedAt !== null) published += 1
    return { total: articles.length, published, draft: articles.length - published }
  }, [articles])

  // 12.4: adopt the server timestamp when live, optimistic flip in prototype.
  const togglePublish = async (id: string) => {
    const current = articles.find((a) => a.id === id)
    if (!current || togglingId !== null) return
    setTogglingId(id)
    try {
      const next = await toggleArticlePublish(current)
      setArticles((prev) => prev.map((a) => (a.id === id ? next : a)))
    } finally {
      setTogglingId(null)
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return articles
      .filter((a) => {
        if (publishFilter === 'Published') return a.publishedAt !== null
        if (publishFilter === 'Draft') return a.publishedAt === null
        return true
      })
      .filter((a) =>
        q ? `${a.title} ${a.description} ${a.url}`.toLowerCase().includes(q) : true,
      )
      .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
  }, [articles, publishFilter, query])

  return (
    <div className="flex min-h-screen bg-white text-foreground">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col gap-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold">Articles</h1>
            <p className="text-sm text-muted-foreground">
              {counts.total} total · {counts.published} published · {counts.draft} draft
            </p>
          </div>
          <Link to="/articles/new">
            <Button className="text-white">
              <Plus className="size-4" /> New article
            </Button>
          </Link>
        </div>

        {USE_MOCKS && (
          <Alert>
            <AlertTitle>Prototype data — no backend needed</AlertTitle>
            <AlertDescription>
              Showing 5 fixtures covering Draft / Published. Publish toggles apply in memory
              only (reset on reload). Set VITE_USE_MOCKS=false to hit the real API.
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
                  placeholder="Search title, description, URL…"
                  className="pl-8"
                />
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
              <p className="py-8 text-center text-sm text-muted-foreground">Loading articles…</p>
            ) : filtered.length === 0 ? (
              <div className="py-4">
                <Alert>
                  <AlertTitle>No articles match</AlertTitle>
                  <AlertDescription>
                    {articles.length === 0
                      ? 'Add your first article by URL to see it here.'
                      : 'Try clearing the search or choosing a different filter.'}
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="text-left text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                      <th className="pb-2 font-medium">Article</th>
                      <th className="pb-2 font-medium whitespace-nowrap">Updated</th>
                      <th className="pb-2 text-right font-medium">Status</th>
                      <th className="w-28 pb-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((a) => (
                      <tr
                        key={a.id}
                        className="border-t border-border align-middle even:bg-[#F7F9FF]"
                      >
                        <td className="max-w-96 py-3 pr-3 pl-2">
                          <div className="flex items-center gap-3">
                            <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-md border border-border bg-muted text-muted-foreground">
                              {a.coverImage ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={a.coverImage} alt="" className="size-full object-cover" />
                              ) : (
                                <ImageIcon className="size-4" />
                              )}
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate font-medium">{a.title}</span>
                              <span className="block truncate text-xs text-muted-foreground">
                                {a.description}
                              </span>
                              <a
                                href={a.url}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="block truncate text-xs text-secondary underline-offset-4 hover:underline"
                              >
                                {a.url}
                              </a>
                            </span>
                          </div>
                        </td>
                        <td className="py-3 pr-3 text-xs whitespace-nowrap text-muted-foreground tabular-nums">
                          {formatLong(a.updatedAt)}
                        </td>
                        <td className="py-3 pr-2 text-right">
                          <PublishBadge published={a.publishedAt !== null} />
                        </td>
                        <td className="py-3 pr-2 text-right">
                          <button
                            type="button"
                            onClick={() => void togglePublish(a.id)}
                            disabled={togglingId === a.id}
                            title={
                              a.publishedAt !== null
                                ? `Unpublish “${a.title}” (back to Draft)`
                                : `Publish “${a.title}” (goes live)`
                            }
                            aria-label={
                              a.publishedAt !== null ? `Unpublish ${a.title}` : `Publish ${a.title}`
                            }
                            className={
                              a.publishedAt !== null
                                ? 'text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline disabled:opacity-40'
                                : 'text-xs font-medium text-success-foreground underline-offset-4 hover:underline disabled:opacity-40'
                            }
                          >
                            {togglingId === a.id
                              ? 'Saving…'
                              : a.publishedAt !== null
                                ? 'Unpublish'
                                : 'Publish'}
                          </button>
                        </td>
                      </tr>
                    ))}
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
