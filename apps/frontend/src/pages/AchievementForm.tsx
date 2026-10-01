import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Calendar,
  FlaskConical,
  LayoutDashboard,
  LogOut,
  Newspaper,
  Trophy,
  X,
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/reui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/useAuth'
import {
  effectiveCategory,
  type AchievementCategory,
  type AchievementLevel,
  type AchievementResult,
} from '@/lib/achievements'
import { MOCK_ACHIEVEMENTS } from '@/mocks/achievements.fixtures'

const CATEGORIES: AchievementCategory[] = [
  'Essay',
  'UI/UX Competition',
  'Software Engineering',
  'Hackathon',
  'Other',
]
const LEVELS: AchievementLevel[] = ['International', 'National']
const RESULTS: AchievementResult[] = ['Champion', '1st Place', '2nd Place', '3rd Place', 'Finalist']

const YEAR_MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/
const ASSISTANT_CODE_RE = /^[A-Z]{4}$/

interface FormState {
  competitionName: string
  memberNames: string[]
  nameDraft: string
  assistantCode: string
  category: AchievementCategory
  customCategory: string
  level: AchievementLevel
  result: AchievementResult
  competitionYearMonth: string
}

type Errors = Partial<
  Record<
    | 'competitionName'
    | 'memberNames'
    | 'assistantCode'
    | 'category'
    | 'customCategory'
    | 'level'
    | 'result'
    | 'competitionYearMonth',
    string
  >
>

function validate(f: FormState): Errors {
  const e: Errors = {}
  if (!f.competitionName.trim()) e.competitionName = 'Competition name is required.'
  else if (f.competitionName.trim().length > 200)
    e.competitionName = 'Competition name must be 200 characters or fewer.'
  const names = f.memberNames.map((n) => n.trim()).filter(Boolean)
  if (names.length === 0) e.memberNames = 'Add at least one member name.'
  if (!f.assistantCode.trim()) e.assistantCode = 'Assistant code is required.'
  else if (!ASSISTANT_CODE_RE.test(f.assistantCode.trim().toUpperCase()))
    e.assistantCode = 'Assistant code must be exactly 4 letters (A–Z).'
  if (f.category === 'Other') {
    if (!f.customCategory.trim()) e.customCategory = 'Describe the category when “Other” is selected.'
    else if (f.customCategory.trim().length > 100)
      e.customCategory = 'Custom category must be 100 characters or fewer.'
  }
  if (!f.competitionYearMonth) e.competitionYearMonth = 'Competition month is required.'
  else if (!YEAR_MONTH_RE.test(f.competitionYearMonth))
    e.competitionYearMonth = 'Use YYYY-MM with month 01–12.'
  return e
}

const inputCls = 'w-full'
const errCls = 'mt-1 text-xs text-destructive'
const selectCls =
  'h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive md:text-sm'

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

export function AchievementForm({ mode }: { mode: 'create' | 'edit' }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const existing = useMemo(
    () => (mode === 'edit' ? (MOCK_ACHIEVEMENTS.find((m) => m.id === id) ?? null) : null),
    [mode, id],
  )

  // Lazy init from the fixture so edit mode preloads without a setState-in-effect.
  const [form, setForm] = useState<FormState>(() =>
    mode === 'edit' && existing
      ? {
          competitionName: existing.competitionName,
          memberNames: [...existing.memberNames],
          nameDraft: '',
          assistantCode: existing.assistantCode,
          category: (CATEGORIES as string[]).includes(existing.category)
            ? (existing.category as AchievementCategory)
            : 'Other',
          customCategory: existing.customCategory ?? '',
          level: (LEVELS as string[]).includes(existing.level)
            ? (existing.level as AchievementLevel)
            : 'National',
          result: (RESULTS as string[]).includes(existing.result)
            ? (existing.result as AchievementResult)
            : 'Finalist',
          competitionYearMonth: existing.competitionYearMonth,
        }
      : {
          competitionName: '',
          memberNames: [],
          nameDraft: '',
          assistantCode: '',
          category: 'Hackathon',
          customCategory: '',
          level: 'National',
          result: 'Champion',
          competitionYearMonth: '',
        },
  )
  const [errors, setErrors] = useState<Errors>({})
  const [submitted, setSubmitted] = useState<{ title: string } | null>(null)
  const [confirmSave, setConfirmSave] = useState(false)

  if (mode === 'edit' && !existing) {
    return (
      <div className="flex min-h-screen bg-white text-foreground">
        <Sidebar />
        <main className="flex min-w-0 flex-1 flex-col gap-6 p-6">
          <Alert>
            <AlertTitle>Achievement not found</AlertTitle>
            <AlertDescription>
              <span className="mb-3 block">No achievement with this id exists.</span>
              <Link to="/achievements" className="text-sm font-medium underline underline-offset-4">
                Back to achievements
              </Link>
            </AlertDescription>
          </Alert>
        </main>
      </div>
    )
  }

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const addName = () => {
    const name = form.nameDraft.trim()
    if (!name) return
    const dup = form.memberNames.some((n) => n.trim().toLowerCase() === name.toLowerCase())
    if (!dup) set('memberNames', [...form.memberNames, name])
    set('nameDraft', '')
  }

  const removeName = (name: string) =>
    set(
      'memberNames',
      form.memberNames.filter((n) => n !== name),
    )

  const onSubmit = (ev: React.FormEvent) => {
    ev.preventDefault()
    const errs = validate(form)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    if (mode === 'edit') {
      setConfirmSave(true)
      return
    }
    // Prototype: no backend — show what WOULD be saved.
    setSubmitted({ title: form.competitionName.trim() })
    toast.success('Achievement created.')
  }

  const confirmSaveChanges = () => {
    setConfirmSave(false)
    toast.success('Achievement updated.')
    void navigate('/achievements')
  }

  const summary = () => {
    const names = form.memberNames.map((n) => n.trim()).filter(Boolean).join(', ')
    const cat =
      form.category === 'Other' ? form.customCategory.trim() : effectiveCategory(form)
    return `${names} · ${form.assistantCode.trim().toUpperCase()} · ${cat} · ${form.level} · ${form.result} · ${form.competitionYearMonth}`
  }

  const field = (
    name: keyof Errors,
    label: string,
    control: React.ReactNode,
    hint?: string,
  ) => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={`ach-${name}`}>
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
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={() => void navigate('/achievements')} title="Back to achievements">
            <ArrowLeft className="size-4" />
          </Button>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold">
              {mode === 'create' ? 'New achievement' : 'Edit achievement'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {mode === 'create'
                ? 'Record who won what, where, and when.'
                : `Editing “${existing?.competitionName}”.`}
            </p>
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          noValidate
          className="flex flex-col gap-5 rounded-xl border border-[#E6EAF2] bg-[#F7F9FF] p-1"
        >
          <div className="flex flex-col gap-5 rounded-lg border border-[#EBEBEB] bg-white p-5">
            {field(
              'competitionName',
              'Competition name',
              <Input
                id="ach-competitionName"
                className={inputCls}
                value={form.competitionName}
                onChange={(e) => set('competitionName', e.target.value)}
                placeholder="e.g. Global Hackathon 2026"
                maxLength={200}
                aria-invalid={!!errors.competitionName}
              />,
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              {field(
                'assistantCode',
                'Assistant code',
                <Input
                  id="ach-assistantCode"
                  className={`${inputCls} uppercase`}
                  value={form.assistantCode}
                  onChange={(e) =>
                    set('assistantCode', e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4))
                  }
                  placeholder="e.g. EISD"
                  maxLength={4}
                  aria-invalid={!!errors.assistantCode}
                />,
                'Exactly 4 letters — stored uppercase.',
              )}
              {field(
                'competitionYearMonth',
                'Competition month',
                <Input
                  id="ach-competitionYearMonth"
                  type="month"
                  className={inputCls}
                  value={form.competitionYearMonth}
                  onChange={(e) => set('competitionYearMonth', e.target.value)}
                  aria-invalid={!!errors.competitionYearMonth}
                />,
                'Month the competition took place.',
              )}
            </div>

            {field(
              'memberNames',
              'Member names',
              <div className="flex flex-col gap-2">
                {form.memberNames.length > 0 && (
                  <ul className="flex flex-wrap gap-1.5" aria-label="Added members">
                    {form.memberNames.map((n) => (
                      <li
                        key={n}
                        className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium"
                      >
                        {n}
                        <button
                          type="button"
                          onClick={() => removeName(n)}
                          aria-label={`Remove ${n}`}
                          className="grid size-4 place-items-center rounded-full text-muted-foreground hover:text-destructive"
                        >
                          <X className="size-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex gap-2">
                  <Input
                    id="ach-memberNames"
                    className={inputCls}
                    value={form.nameDraft}
                    onChange={(e) => set('nameDraft', e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addName()
                      }
                    }}
                    placeholder="Type a name, press Enter or Add"
                    aria-invalid={!!errors.memberNames}
                  />
                  <Button type="button" variant="outline" onClick={addName}>
                    Add
                  </Button>
                </div>
              </div>,
              'One or more members — duplicates are ignored.',
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              {field(
                'category',
                'Competition category',
                <select
                  id="ach-category"
                  className={selectCls}
                  value={form.category}
                  onChange={(e) => set('category', e.target.value as AchievementCategory)}
                  aria-invalid={!!errors.category}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>,
              )}
              {field(
                'level',
                'Competition level',
                <select
                  id="ach-level"
                  className={selectCls}
                  value={form.level}
                  onChange={(e) => set('level', e.target.value as AchievementLevel)}
                  aria-invalid={!!errors.level}
                >
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>,
              )}
            </div>

            {form.category === 'Other' &&
              field(
                'customCategory',
                'Custom category',
                <Input
                  id="ach-customCategory"
                  className={inputCls}
                  value={form.customCategory}
                  onChange={(e) => set('customCategory', e.target.value)}
                  placeholder="e.g. Game Jam"
                  maxLength={100}
                  aria-invalid={!!errors.customCategory}
                />,
                'Required when category is “Other”.',
              )}

            {field(
              'result',
              'Achievement',
              <select
                id="ach-result"
                className={selectCls}
                value={form.result}
                onChange={(e) => set('result', e.target.value as AchievementResult)}
                aria-invalid={!!errors.result}
              >
                {RESULTS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>,
            )}

            {submitted && mode === 'create' && (
              <Alert>
                <AlertTitle>Looks good — would save</AlertTitle>
                <AlertDescription>“{submitted.title}” passed validation: {summary()}.</AlertDescription>
              </Alert>
            )}

            <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
              <Link to="/achievements">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" className="text-white">
                {mode === 'create' ? 'Save achievement' : 'Save changes'}
              </Button>
            </div>
          </div>
        </form>
      </main>

      {confirmSave && mode === 'edit' && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4"
          onClick={() => setConfirmSave(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="save-achievement-title"
            aria-describedby="save-achievement-desc"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-xl border border-border bg-background p-5 shadow-lg"
          >
            <h2 id="save-achievement-title" className="text-base font-semibold">
              Save changes to “{form.competitionName.trim() || existing?.competitionName}”?
            </h2>
            <p id="save-achievement-desc" className="mt-1.5 text-sm text-muted-foreground">
              Your edits will be saved to this achievement record.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" autoFocus onClick={() => setConfirmSave(false)}>
                Keep editing
              </Button>
              <Button className="text-white" onClick={confirmSaveChanges}>
                Save changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
