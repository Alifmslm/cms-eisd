import api from './api'

export type AchievementCategory =
  | 'Essay'
  | 'UI/UX Competition'
  | 'Software Engineering'
  | 'Hackathon'
  | 'Other'

export type AchievementLevel = 'International' | 'National'

export type AchievementResult =
  | 'Champion'
  | '1st Place'
  | '2nd Place'
  | '3rd Place'
  | 'Finalist'

export interface Achievement {
  id: string
  memberNames: string[]
  assistantCode: string
  category: string
  customCategory: string | null
  level: string
  result: string
  competitionName: string
  competitionYearMonth: string
  createdAt: string
  updatedAt: string
}

/** Effective category shown in the UI — custom text when `Other`. */
export function effectiveCategory(a: Pick<Achievement, 'category' | 'customCategory'>): string {
  return a.category === 'Other' && a.customCategory ? a.customCategory : a.category
}

export interface AchievementFilters {
  category?: AchievementCategory
  level?: AchievementLevel
  result?: AchievementResult
  /** Exact month match, `YYYY-MM`. */
  yearMonth?: string
  /** Year prefix match, `YYYY` (matches any month of that year). */
  year?: string
  /** Matches competition name or member name. */
  search?: string
}

export interface CreateAchievementInput {
  memberNames: string[]
  assistantCode: string
  category: AchievementCategory
  customCategory?: string
  level: AchievementLevel
  result: AchievementResult
  competitionName: string
  competitionYearMonth: string
}

export type UpdateAchievementInput = Partial<CreateAchievementInput>

function toQuery(filters: AchievementFilters): Record<string, string> {
  const q: Record<string, string> = {}
  if (filters.category) q.category = filters.category
  if (filters.level) q.level = filters.level
  if (filters.result) q.result = filters.result
  if (filters.yearMonth) q.yearMonth = filters.yearMonth
  if (filters.year) q.year = filters.year
  if (filters.search?.trim()) q.search = filters.search.trim()
  return q
}

/** List achievements, newest year-month first (server orders by competitionYearMonth desc, updatedAt desc). */
export async function fetchAchievements(
  filters: AchievementFilters = {},
): Promise<Achievement[]> {
  const { data } = await api.get<Achievement[]>('/api/achievements', {
    params: toQuery(filters),
  })
  return data
}

export async function fetchAchievement(id: string): Promise<Achievement> {
  const { data } = await api.get<Achievement>(`/api/achievements/${id}`)
  return data
}

export async function createAchievement(input: CreateAchievementInput): Promise<Achievement> {
  const { data } = await api.post<Achievement>('/api/achievements', input)
  return data
}

export async function updateAchievement(
  id: string,
  input: UpdateAchievementInput,
): Promise<Achievement> {
  const { data } = await api.put<Achievement>(`/api/achievements/${id}`, input)
  return data
}

export async function deleteAchievement(id: string): Promise<void> {
  await api.delete(`/api/achievements/${id}`)
}
