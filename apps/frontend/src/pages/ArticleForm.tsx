import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Calendar,
  FlaskConical,
  LayoutDashboard,
  LogOut,
  Newspaper,
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/reui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/useAuth'
import {
  ArticleSubmitError,
  createArticle,
  submitErrorCopy,
  validateArticleUrl,
  type AdminArticle,
} from '@/lib/articles'

const inputCls = 'w-full'
const errCls = 'mt-1 text-xs text-destructive'

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

export function ArticleForm() {
  const navigate = useNavigate()
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<ArticleSubmitError | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [created, setCreated] = useState<AdminArticle | null>(null)

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    const problem = validateArticleUrl(url)
    setError(problem)
    setSubmitError(null)
    if (problem) return
    setSubmitting(true)
    try {
      const entry = await createArticle(url)
      setCreated(entry)
      toast.success('Article saved as Draft.')
    } catch (err) {
      setCreated(null)
      setSubmitError(
        err instanceof ArticleSubmitError
          ? err
          : new ArticleSubmitError('server', err instanceof Error ? err.message : 'Unknown error'),
      )
    } finally {
      setSubmitting(false)
    }
  }

  const reset = () => {
    setUrl('')
    setError(null)
    setSubmitError(null)
    setCreated(null)
  }

  return (
    <div className="flex min-h-screen bg-white text-foreground">
      <Sidebar />
      <main className="mx-auto flex w-full max-w-3xl min-w-0 flex-1 flex-col gap-6 p-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={() => void navigate('/articles')} title="Back to articles">
            <ArrowLeft className="size-4" />
          </Button>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold">New article</h1>
            <p className="text-sm text-muted-foreground">
              Paste the Medium URL — title, description, and cover image are fetched automatically.
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => void onSubmit(e)}
          noValidate
          className="flex flex-col gap-5 rounded-xl border border-[#E6EAF2] bg-[#F7F9FF] p-1"
        >
          <div className="flex flex-col gap-5 rounded-lg border border-[#EBEBEB] bg-white p-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="art-url">
                Medium URL <span className="text-destructive">*</span>
              </Label>
              <Input
                id="art-url"
                className={inputCls}
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value)
                  if (error) setError(null)
                  if (submitError) setSubmitError(null)
                  if (created) setCreated(null)
                }}
                placeholder="https://medium.com/@eisd/your-article-abc123"
                inputMode="url"
                aria-invalid={!!error}
              />
              {!error && (
                <p className="text-xs text-muted-foreground">
                  Saved as a Draft — publish it from the list once ready.
                </p>
              )}
              {error && (
                <p className={errCls} role="alert">
                  {error}
                </p>
              )}
            </div>

            {submitError &&
              (() => {
                const copy = submitErrorCopy(submitError.kind)
                return (
                  <Alert>
                    <AlertTitle>{copy.title}</AlertTitle>
                    <AlertDescription>
                      <span className="mb-1 block break-all">{submitError.message}</span>
                      <span className="block text-xs">{copy.hint}</span>
                    </AlertDescription>
                  </Alert>
                )
              })()}

            {created && (
              <Alert>
                <AlertTitle>Saved as Draft</AlertTitle>
                <AlertDescription>
                  <span className="mb-3 block break-all">
                    “{created.title}” ({created.url})
                  </span>
                  <span className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" type="button" onClick={() => void navigate('/articles')}>
                      Back to articles
                    </Button>
                    <Button variant="outline" size="sm" type="button" onClick={reset}>
                      Add another
                    </Button>
                  </span>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
              <Link to="/articles">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" className="text-white" disabled={submitting}>
                {submitting ? 'Saving…' : 'Fetch & save as Draft'}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
