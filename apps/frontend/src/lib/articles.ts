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

/** Returns an error message for an invalid URL, or null when the URL looks usable. */
export function validateArticleUrl(raw: string): string | null {
  const url = raw.trim()
  if (!url) return 'URL is required — paste the Medium article link.'
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return 'That does not look like a valid URL — include https:// at the start.'
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:')
    return 'URL must start with http:// or https://.'
  return null
}

/**
 * Task 12.2 prototype — creates an article from a URL only.
 * Real path (VITE_USE_MOCKS=false): POST /api/articles { url } — the
 * backend fetches OG metadata and returns the created Draft entry.
 * Prototype path: synthesizes a Draft entry locally so the form works
 * with no backend (metadata fetching lands with the backend wiring).
 */
export async function createArticle(rawUrl: string): Promise<AdminArticle> {
  const url = rawUrl.trim()
  if (!USE_MOCKS) {
    try {
      const { data } = await api.post<AdminArticle>('/api/articles', { url })
      return data
    } catch {
      // Fall through to the mock entry so the prototype still works
      // with the backend stopped (12.3 covers unreachable-URL errors).
    }
  }
  const now = new Date().toISOString()
  return {
    id: `art-mock-${Date.now()}`,
    url,
    title: 'Untitled — metadata fetches on the backend',
    description: 'The backend will fill in title, description, and cover image from the URL.',
    coverImage: '',
    publishedDate: now,
    publishedAt: null,
    updatedAt: now,
  }
}
