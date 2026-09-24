import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  Check,
  FlaskConical,
  LayoutDashboard,
  LogOut,
  Newspaper,
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/reui/alert'
import { GalleryUpload, type GalleryImage } from '@/components/GalleryUpload'
import { ImageUpload, type UploadedImage } from '@/components/ImageUpload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/useAuth'
import { MOCK_EVENTS } from '@/mocks/events.fixtures'

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fromDatetimeLocal(v: string): string {
  return new Date(v).toISOString()
}

interface FormState {
  title: string
  slug: string
  slugTouched: boolean
  previewDescription: string
  content: string
  location: string
  startDate: string
  endDate: string
  coverImage: string
  headerImage: string
}

type Errors = Partial<Record<'title' | 'slug' | 'previewDescription' | 'content' | 'location' | 'startDate' | 'endDate' | 'coverImage' | 'headerImage', string>>

function validate(f: FormState, selfId: string | null): Errors {
  return { ...validateDetails(f, selfId), ...validateImages(f) }
}

// Step 1 (details): everything from title through full description.
function validateDetails(f: FormState, selfId: string | null): Errors {
  const e: Errors = {}
  if (!f.title.trim()) e.title = 'Title is required.'
  if (!f.slug.trim()) e.slug = 'Slug is required.'
  else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(f.slug.trim()))
    e.slug = 'Slug must be lowercase letters, numbers, and hyphens.'
  else if (MOCK_EVENTS.some((m) => m.slug === f.slug.trim() && m.id !== selfId))
    e.slug = 'This slug is already used — add a suffix to keep it unique.'
  if (!f.previewDescription.trim()) e.previewDescription = 'Preview description is required.'
  if (!f.content.trim()) e.content = 'Full description is required.'
  if (!f.location.trim()) e.location = 'Location is required.'
  if (!f.startDate) e.startDate = 'Start date is required.'
  if (!f.endDate) e.endDate = 'End date is required.'
  if (f.startDate && f.endDate && new Date(f.endDate) < new Date(f.startDate))
    e.endDate = 'End date must be the same as or after the start date.'
  return e
}

// Step 2 (images): cover + header required, gallery optional.
function validateImages(f: FormState): Errors {
  const e: Errors = {}
  if (!f.coverImage.trim()) e.coverImage = 'Cover image is required — pick a file or paste a URL.'
  if (!f.headerImage.trim()) e.headerImage = 'Header image is required — pick a file or paste a URL.'
  return e
}

const inputCls = 'w-full'
const errCls = 'mt-1 text-xs text-destructive'
const textareaCls =
  'min-h-28 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm'

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

export function EventForm({ mode }: { mode: 'create' | 'edit' }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const existing = useMemo(
    () => (mode === 'edit' ? (MOCK_EVENTS.find((m) => m.id === id) ?? null) : null),
    [mode, id],
  )

  // Lazy init from the fixture so edit mode preloads without a setState-in-effect.
  const [form, setForm] = useState<FormState>(() =>
    mode === 'edit' && existing
      ? {
          title: existing.title,
          slug: existing.slug,
          slugTouched: true,
          previewDescription: '',
          content: '',
          location: existing.location,
          startDate: toDatetimeLocal(existing.startDate),
          endDate: toDatetimeLocal(existing.endDate),
          coverImage: existing.coverImage || '',
          headerImage: '',
        }
      : {
          title: '',
          slug: '',
          slugTouched: false,
          previewDescription: '',
          content: '',
          location: '',
          startDate: '',
          endDate: '',
          coverImage: '',
          headerImage: '',
        },
  )
  const [errors, setErrors] = useState<Errors>({})
  // Sticky-bar elevation: show a shadow once the form scrolls underneath.
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const [submitted, setSubmitted] = useState<null | { slug: string; title: string; galleryCount: number }>(null)
  // Two-section flow: 0 = details (title → full description), 1 = images.
  // All section state lives in this component, so going Back never loses input.
  const [step, setStep] = useState<0 | 1>(0)
  // 11.3: image pickers mirror their preview URL into form.coverImage/headerImage.
  const [cover, setCover] = useState<UploadedImage | null>(() =>
    mode === 'edit' && existing?.coverImage
      ? { previewUrl: existing.coverImage, fileName: existing.coverImage, uploaded: true }
      : null,
  )
  const [header, setHeader] = useState<UploadedImage | null>(null)
  // 11.5: optional gallery, max 4. Stored as preview URLs for the submit preview.
  const [gallery, setGallery] = useState<GalleryImage[]>([])

  const syncCover = (img: UploadedImage | null) => {
    setCover(img)
    setForm((f) => ({ ...f, coverImage: img?.previewUrl ?? '' }))
  }
  const syncHeader = (img: UploadedImage | null) => {
    setHeader(img)
    setForm((f) => ({ ...f, headerImage: img?.previewUrl ?? '' }))
  }

  if (mode === 'edit' && !existing) {
    return (
      <div className="flex min-h-screen bg-white text-foreground">
        <Sidebar />
        <main className="flex min-w-0 flex-1 flex-col gap-6 p-6">
          <Alert>
            <AlertTitle>Event not found</AlertTitle>
            <AlertDescription>
              <span className="mb-3 block">No event with this id exists.</span>
              <Link to="/events" className="text-sm font-medium underline underline-offset-4">
                Back to events
              </Link>
            </AlertDescription>
          </Alert>
        </main>
      </div>
    )
  }

  const set = (k: keyof FormState, v: string | boolean) =>
    setForm((f) => {
      const next = { ...f, [k]: v }
      if (k === 'title' && typeof v === 'string' && !f.slugTouched) next.slug = slugify(v)
      return next
    })

  const selfId = mode === 'edit' ? (existing?.id ?? null) : null

  const goNext = () => {
    const errs = validateDetails(form, selfId)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    setStep(1)
  }

  const goBack = () => {
    setSubmitted(null)
    setStep(0)
  }

  const onSubmit = (ev: React.FormEvent) => {
    ev.preventDefault()
    const errs = validate(form, selfId)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    // Prototype: no backend — show what WOULD be saved.
    setSubmitted({ slug: form.slug.trim(), title: form.title.trim(), galleryCount: gallery.length })
  }

  const field = (
    name: keyof Errors,
    label: string,
    control: React.ReactNode,
    hint?: string,
  ) => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={`evt-${name}`}>
        {label} <span className="text-destructive">*</span>
      </Label>
      {control}
      {hint && !errors[name] && <p className="text-xs text-muted-foreground">{hint}</p>}
      {errors[name] && (
        <p className={errCls} role="alert">
          {errors[name]}
        </p>
      )}
    </div>
  )

  return (
    <div className="flex min-h-screen bg-white text-foreground">
      <Sidebar />
      <main className="mx-auto flex w-full max-w-3xl min-w-0 flex-1 flex-col gap-6 p-6">
        {/* Sticky header: back-to-events + title + step state stay visible on scroll. */}
        <div
          className={`sticky top-0 z-20 -mx-6 flex flex-col gap-3 border-b border-border bg-white/95 px-6 py-3 backdrop-blur transition-shadow ${
            scrolled ? 'shadow-[0_12px_16px_-12px_#e5e5e5]' : 'shadow-none'
          }`}
        >
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon-sm" onClick={() => void navigate('/events')} title="Back to events">
              <ArrowLeft className="size-4" />
            </Button>
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-semibold">{mode === 'create' ? 'New event' : 'Edit event'}</h1>
              <p className="text-sm text-muted-foreground">
                {mode === 'create'
                  ? 'Fill in the event details first, then add images.'
                  : `Editing “${existing?.title}” — edits to a Published event would go live immediately.`}
              </p>
            </div>
          </div>

          {/* Section stepper: details → images. Back never drops entered state. */}
          {/* pl-10 lines the stepper up with the title text (back button + gap). */}
          <ol className="flex items-center gap-2 pl-10" aria-label="Form progress">
            {['Event details', 'Images'].map((label, i) => {
              const done = step > i
              const active = step === i
              return (
                <li key={label} className="flex items-center gap-2">
                  {i > 0 && <span className="h-px w-8 bg-border" aria-hidden />}
                  <span
                    className={`grid size-6 place-items-center rounded-full text-[11px] font-semibold ${
                      done || active ? 'bg-success text-white' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {done ? <Check className="size-3.5" /> : i + 1}
                  </span>
                  <span className={`text-xs font-medium ${active ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {label}
                  </span>
                </li>
              )
            })}
          </ol>
        </div>

        <form
          onSubmit={onSubmit}
          noValidate
          className="flex flex-col gap-5 rounded-xl border border-[#E6EAF2] bg-[#F7F9FF] p-1"
        >
          <div className="flex flex-col gap-5 rounded-lg border border-[#EBEBEB] bg-white p-5">
            {step === 0 ? (
              <>
                {field(
                  'title',
                  'Title',
                  <Input
                    id="evt-title"
                    className={inputCls}
                    value={form.title}
                    onChange={(e) => set('title', e.target.value)}
                    placeholder="e.g. Annual Meeting 2026"
                    aria-invalid={!!errors.title}
                  />,
                )}
                {/* Slug is auto-generated from the title and kept headless (no manual input). */}
                <div className="grid gap-5 sm:grid-cols-2">
                  {field(
                    'startDate',
                    'Start date',
                    <Input
                      id="evt-startDate"
                      type="datetime-local"
                      className={inputCls}
                      value={form.startDate}
                      onChange={(e) => set('startDate', e.target.value)}
                      aria-invalid={!!errors.startDate}
                    />,
                  )}
                  {field(
                    'endDate',
                    'End date',
                    <Input
                      id="evt-endDate"
                      type="datetime-local"
                      className={inputCls}
                      value={form.endDate}
                      onChange={(e) => set('endDate', e.target.value)}
                      aria-invalid={!!errors.endDate}
                    />,
                    'Must be the same as or after the start date.',
                  )}
                </div>
                {field(
                  'location',
                  'Location',
                  <Input
                    id="evt-location"
                    className={inputCls}
                    value={form.location}
                    onChange={(e) => set('location', e.target.value)}
                    placeholder="e.g. Aula Utama, Gedung EISD"
                    aria-invalid={!!errors.location}
                  />,
                )}
                {field(
                  'previewDescription',
                  'Preview description',
                  <textarea
                    id="evt-previewDescription"
                    className={textareaCls}
                    value={form.previewDescription}
                    onChange={(e) => set('previewDescription', e.target.value)}
                    placeholder="Short text for listing cards (1–2 sentences)"
                    rows={2}
                    aria-invalid={!!errors.previewDescription}
                  />,
                  'Shown on listing cards.',
                )}
                {field(
                  'content',
                  'Full description',
                  <textarea
                    id="evt-content"
                    className={textareaCls}
                    value={form.content}
                    onChange={(e) => set('content', e.target.value)}
                    placeholder="Detail page body (markdown supported later)"
                    rows={6}
                    aria-invalid={!!errors.content}
                  />,
                )}

                <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
                  <Link to="/events">
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                  </Link>
                  <Button type="button" className="text-white" onClick={goNext}>
                    Next
                  </Button>
                </div>
              </>
            ) : (
              <>
                {field(
                  'coverImage',
                  'Cover image',
                  <ImageUpload
                    id="evt-coverImage"
                    value={cover}
                    onChange={syncCover}
                    aspectRatio={{ w: 16, h: 9 }}
                    hint="listing/card image"
                    invalid={!!errors.coverImage}
                  />,
                  'Must be 16:9 — other shapes are rejected before upload.',
                )}
                {field(
                  'headerImage',
                  'Header image',
                  <ImageUpload
                    id="evt-headerImage"
                    value={header}
                    onChange={syncHeader}
                    invalid={!!errors.headerImage}
                  />,
                  'Detail page banner.',
                )}

                <div className="flex flex-col gap-1.5">
                  <Label>
                    Gallery images <span className="font-normal text-muted-foreground">(optional, max 4)</span>
                  </Label>
                  <GalleryUpload value={gallery} onChange={setGallery} />
                  <p className="text-xs text-muted-foreground">
                    V1 caps the gallery at 4 — the list is array-shaped so V2 can raise the limit without a schema change.
                  </p>
                </div>

                {submitted && (
                  <Alert>
                    <AlertTitle>{mode === 'create' ? 'Looks good — would save as Draft' : 'Looks good — would save edits'}</AlertTitle>
                    <AlertDescription>
                      “{submitted.title}” (/{submitted.slug}) passed validation against {fromDatetimeLocal(form.startDate)} →{' '}
                      {fromDatetimeLocal(form.endDate)}
                      {submitted.galleryCount > 0
                        ? ` with ${submitted.galleryCount} galler${submitted.galleryCount === 1 ? 'y image' : 'y images'}.`
                        : ' with no gallery images.'}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex items-center justify-between gap-2 border-t border-border pt-4">
                  <Button variant="outline" type="button" onClick={goBack}>
                    Back to details
                  </Button>
                  <Button type="submit" className="text-white">
                    {mode === 'create' ? 'Save as Draft' : 'Save changes'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </form>
      </main>
    </div>
  )
}
