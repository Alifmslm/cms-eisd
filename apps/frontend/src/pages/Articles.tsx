import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  Check,
  Copy,
  Eye,
  FileText,
  FlaskConical,
  LayoutDashboard,
  Link2,
  LogOut,
  Newspaper,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import { Badge } from '@/components/reui/badge'
import { IconTile } from '@/components/reui/icon-tile'
import { Alert, AlertDescription, AlertTitle } from '@/components/reui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FilterDropdown } from '@/components/FilterDropdown'
import { useAuth } from '@/context/useAuth'
import {
  deleteArticle,
  fetchAdminArticles,
  formatLong,
  toggleArticlePublish,
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
  // 12.5: deletion is confirmed then applied (server DELETE when live,
  // in-memory removal in prototype).
  const [pendingDelete, setPendingDelete] = useState<AdminArticle | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deletedNotice, setDeletedNotice] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyLink = async (id: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // Clipboard API unavailable (permissions/insecure context) — legacy fallback.
      const ta = document.createElement('textarea')
      ta.value = url
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    setCopiedId(id)
    window.setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1500)
  }

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

  // Dashboard-style stat cards, same as the events header.
  const stats = useMemo(() => {
    let published = 0
    for (const a of articles) if (a.publishedAt !== null) published += 1
    return [
      { label: 'Total articles', value: articles.length, icon: Newspaper, tileClassName: 'bg-rose-500 text-white' },
      { label: 'Live', value: published, icon: Eye, tileClassName: 'bg-emerald-500 text-white' },
      { label: 'Drafts', value: articles.length - published, icon: FileText, tileClassName: 'bg-cyan-600 text-white' },
    ]
  }, [articles])

  // FLIP reorder animation, same as the events table: row elements by id.
  // Positions are compared on every visible-order change (toggle, filter,
  // search), so moved rows always glide instead of jumping.
  const rowRefs = useRef(new Map<string, HTMLTableRowElement>())
  const prevRects = useRef(new Map<string, DOMRect>())

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

  // 12.5: confirmed deletion — DELETE on the server when live, then drop
  // from local state in both modes (prototype removals reset on reload).
  const confirmDelete = async () => {
    if (!pendingDelete || deleting) return
    const title = pendingDelete.title
    setDeleting(true)
    setDeleteError(null)
    try {
      await deleteArticle(pendingDelete.id)
      setArticles((prev) => prev.filter((a) => a.id !== pendingDelete.id))
      setPendingDelete(null)
      setDeletedNotice(`“${title}” was deleted.`)
    } catch {
      setDeleteError('The server refused the deletion — the article may already be gone. Try reloading the list.')
    } finally {
      setDeleting(false)
    }
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
    return articles
      .filter((a) => {
        if (publishFilter === 'Published') return a.publishedAt !== null
        if (publishFilter === 'Draft') return a.publishedAt === null
        return true
      })
      .filter((a) =>
        q ? `${a.title} ${a.description} ${a.url}`.toLowerCase().includes(q) : true,
      )
      .sort((a, b) => {
        // Same rule as the events table: drafts first, then newest first.
        // (Articles have no schedule/end date, so there is no past-last tier.)
        const draftDelta =
          (a.publishedAt === null ? 0 : 1) - (b.publishedAt === null ? 0 : 1)
        if (draftDelta !== 0) return draftDelta
        return (
          +new Date(b.publishedDate) - +new Date(a.publishedDate) ||
          +new Date(b.updatedAt) - +new Date(a.updatedAt)
        )
      })
  }, [articles, publishFilter, query])

  // FLIP playback: after the visible order changes, glide each surviving
  // row from its previous position to its new one. Transform-only (GPU),
  // WAAPI so a second change mid-flight retargets instead of restarting.
  useLayoutEffect(() => {
    const prev = prevRects.current
    const next = new Map<string, DOMRect>()
    rowRefs.current.forEach((el, id) => next.set(id, el.getBoundingClientRect()))
    prevRects.current = next
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
  }, [filtered])

  return (
    <div className="flex min-h-screen bg-white text-foreground">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col gap-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold">Articles</h1>
            <p className="text-sm text-muted-foreground">Medium links and publish states</p>
          </div>
          <Link to="/articles/new">
            <Button className="text-white">
              <Plus className="size-4" /> New article
            </Button>
          </Link>
        </div>

        {/* Stat cards in #F7F9FF wrapper — same style as the events header. */}
        <section className="rounded-xl border border-[#E6EAF2] bg-[#F7F9FF] p-1">
          <div className="grid grid-cols-3 gap-1">
            {stats.map((s) => (
              <div key={s.label} className="flex items-stretch justify-between gap-4 rounded-lg border border-[#EBEBEB] bg-white p-5">
                <div className="flex min-w-0 flex-col gap-1">
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-semibold tabular-nums">{s.value}</p>
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
                  placeholder="Search title, description, URL…"
                  aria-label="Search articles"
                  className="pl-8"
                />
              </div>
              <span className="hidden h-5 w-px bg-border sm:block" />
              <FilterDropdown
                label="Publish"
                value={publishFilter}
                options={PUBLISH_FILTERS}
                onPick={setPublishFilter}
                align="right"
              />
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
              <div className="overflow-x-auto overflow-y-clip">
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="text-left text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                      <th className="pb-2 font-medium">Article</th>
                      <th className="pb-2 font-medium whitespace-nowrap">Updated</th>
                      <th className="pb-2 text-right font-medium">Status</th>
                      <th className="w-44 pb-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((a, i) => (
                      <tr
                        key={a.id}
                        ref={(el) => {
                          if (el) rowRefs.current.set(a.id, el)
                          else rowRefs.current.delete(a.id)
                        }}
                        style={{ animationDelay: `${Math.min(i, 9) * 40}ms` }}
                        className="page-row-enter border-t border-border align-middle even:bg-[#F7F9FF]"
                      >
                        <td className="max-w-96 py-3 pr-3 pl-2">
                          <div className="flex min-w-0 flex-col">
                            <span className="block truncate font-medium">{a.title}</span>
                            <span className="flex items-center gap-1 truncate text-xs">
                              <Link2 className="size-3 shrink-0 text-muted-foreground" />
                              <a
                                href={a.url}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="truncate text-secondary underline-offset-4 hover:underline"
                              >
                                article link
                              </a>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  void copyLink(a.id, a.url)
                                }}
                                title="Copy article link"
                                aria-label={`Copy link of ${a.title}`}
                                className="grid size-5 shrink-0 place-items-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
                              >
                                {copiedId === a.id ? (
                                  <Check className="size-3 text-success-foreground" />
                                ) : (
                                  <Copy className="size-3" />
                                )}
                              </button>
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
                          <span className="inline-flex items-center gap-3">
                            <button
                              type="button"
                              role="switch"
                              aria-checked={a.publishedAt !== null}
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
                              className="flex items-center gap-2 disabled:opacity-40"
                            >
                              <span
                                className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                                  a.publishedAt !== null ? 'bg-success' : 'bg-border'
                                }`}
                              >
                                <span
                                  className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow transition-transform ${
                                    a.publishedAt !== null ? 'translate-x-4' : ''
                                  }`}
                                />
                              </span>
                              <span
                                className={`text-xs font-medium ${
                                  a.publishedAt !== null
                                    ? 'text-success-foreground'
                                    : 'text-muted-foreground'
                                }`}
                              >
                                {togglingId === a.id
                                  ? 'Saving…'
                                  : a.publishedAt !== null
                                    ? 'Live'
                                    : 'Draft'}
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDeletedNotice(null)
                                setDeleteError(null)
                                setPendingDelete(a)
                              }}
                              title={`Delete “${a.title}” permanently`}
                              aria-label={`Delete ${a.title}`}
                              className="grid size-7 place-items-center rounded-md border border-border text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </span>
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

      {pendingDelete && (
        <div
          className="overlay-enter fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4"
          onClick={() => {
            if (!deleting) {
              setPendingDelete(null)
              setDeleteError(null)
            }
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-article-title"
            aria-describedby="delete-article-desc"
            onClick={(e) => e.stopPropagation()}
            className="dialog-enter w-full max-w-md rounded-xl border border-border bg-background p-5 shadow-lg"
          >
            <h2 id="delete-article-title" className="text-base font-semibold">
              Delete “{pendingDelete.title}”?
            </h2>
            <p id="delete-article-desc" className="mt-1.5 text-sm text-muted-foreground">
              This permanently removes the article
              {pendingDelete.publishedAt !== null ? ', including its public page,' : ''} and it
              can’t be undone — there is no revision history in V1.
            </p>
            {deleteError && (
              <p className="mt-3 text-xs text-destructive" role="alert">
                {deleteError}
              </p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <Button
                variant="outline"
                autoFocus
                disabled={deleting}
                onClick={() => {
                  setPendingDelete(null)
                  setDeleteError(null)
                }}
              >
                Cancel
              </Button>
              <Button variant="destructive" disabled={deleting} onClick={() => void confirmDelete()}>
                {deleting ? 'Deleting…' : 'Delete article'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
