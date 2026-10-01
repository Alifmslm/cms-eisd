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
  type AchievementCategory,
  type AchievementLevel,
  type AchievementMember,
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
const RESULTS: AchievementResult[] = ['1st Place', '2nd Place', '3rd Place', 'Finalist']

const YEAR_MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/
const ASSISTANT_CODE_RE = /^[A-Z]{4}$/

interface FormState {
  competitionName: string
  members: AchievementMember[]
  nameDraft: string
  codeDraft: string
  category: AchievementCategory
  customCategory: string
  level: AchievementLevel
  result: AchievementResult
  competitionYearMonth: string
}

type Errors = Partial<
  Record<
    | 'competitionName'
    | 'members'
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
  const names = f.members.map((m) => m.name.trim()).filter(Boolean)
  if (names.length === 0) e.members = 'Add at least one member with their assistant code.'
  else {
    const bad = f.members.find(
      (m) => !m.name.trim() || !ASSISTANT_CODE_RE.test(m.assistantCode.trim().toUpperCase()),
    )
    if (bad) e.members = 'Each member needs a name and a 4-letter code (A–Z).'
    else {
      const codes = f.members.map((m) => m.assistantCode.trim().toUpperCase())
      if (new Set(codes).size !== codes.length)
        e.members = 'Assistant codes must be unique — one code per member.'
    }
  }
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
        active ? 'bg-secondary/10 font-semibold text-foreground' : 'text-muted-foreground hover:bg-[#F5F5F5]'
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
    <aside className="sticky top-0 flex h-screen w-52 shrink-0 flex-col overflow-y-auto border-r border-border bg-white p-3">
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
          members: existing.members.map((m) => ({ ...m })),
          nameDraft: '',
          codeDraft: '',
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
          members: [],
          nameDraft: '',
          codeDraft: '',
          category: 'Hackathon',
          customCategory: '',
          level: 'National',
          result: '1st Place',
          competitionYearMonth: '',
        },
  )
  const [errors, setErrors] = useState<Errors>({})
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

  const addMember = () => {
    const name = form.nameDraft.trim()
    const code = form.codeDraft.trim().toUpperCase()
    if (!name || !ASSISTANT_CODE_RE.test(code)) return
    const dup = form.members.some(
      (m) =>
        m.name.trim().toLowerCase() === name.toLowerCase() ||
        m.assistantCode.trim().toUpperCase() === code,
    )
    if (!dup) set('members', [...form.members, { name, assistantCode: code }])
    set('nameDraft', '')
    set('codeDraft', '')
  }

  const removeMember = (code: string) =>
    set(
      'members',
      form.members.filter((m) => m.assistantCode !== code),
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
    // Prototype: no backend — redirect to the list with a success toast.
    toast.success('Achievement created.')
    void navigate('/achievements')
  }

  const confirmSaveChanges = () => {
    setConfirmSave(false)
    toast.success('Achievement updated.')
    void navigate('/achievements')
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

            {field(
              'members',
              'Members',
              <div className="flex flex-col gap-2">
                {form.members.length > 0 && (
                  <ul className="flex flex-col gap-1.5" aria-label="Added members">
                    {form.members.map((m) => (
                      <li
                        key={m.assistantCode}
                        className="inline-flex items-center justify-between gap-2 rounded-lg border border-border bg-[#F7F9FF] px-2.5 py-1.5 text-xs font-medium"
                      >
                        <span>
                          {m.name} <span className="text-muted-foreground">({m.assistantCode})</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => removeMember(m.assistantCode)}
                          aria-label={`Remove ${m.name}`}
                          className="grid size-5 place-items-center rounded-full text-muted-foreground hover:text-destructive"
                        >
                          <X className="size-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="grid gap-2 sm:grid-cols-[1fr_7rem_auto]">
                  <Input
                    id="ach-members"
                    className={inputCls}
                    value={form.nameDraft}
                    onChange={(e) => set('nameDraft', e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addMember()
                      }
                    }}
                    placeholder="Member name"
                    aria-invalid={!!errors.members}
                  />
                  <Input
                    className={`${inputCls} uppercase`}
                    value={form.codeDraft}
                    onChange={(e) =>
                      set('codeDraft', e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addMember()
                      }
                    }}
                    placeholder="Code"
                    maxLength={4}
                    aria-label="Assistant code"
                    aria-invalid={!!errors.members}
                  />
                  <Button type="button" variant="outline" onClick={addMember}>
                    Add
                  </Button>
                </div>
              </div>,
              'Each member has their own 4-letter code — codes must be unique across all records.',
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
