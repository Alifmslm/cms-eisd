import api from './api'
import { MOCK_ARTICLES, type MockArticle } from '@/mocks/articles.fixtures'

export type AdminArticle = MockArticle

// Prototype mode: true = render fixtures instantly, no backend needed.
// Set VITE_USE_MOCKS=false once the admin list endpoint exists and you
// want to exercise the real API (still falls back to fixtures on error).
// NOTE: GET /api/articles currently returns published-only (public API),
// so the admin list keeps the fixtures-first behavior until a dedicated
// admin endpoint (findAll, drafts included) lands.
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false'

/** Admin list — tries backend, falls back to fixtures so the page works with backend stopped. */
export async function fetchAdminArticles(): Promise<AdminArticle[]> {
  if (USE_MOCKS) return MOCK_ARTICLES
  try {
    const { data } = await api.get<AdminArticle[]>('/api/articles')
    return data
  } catch {
    return MOCK_ARTICLES
  }
}

export function formatLong(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
