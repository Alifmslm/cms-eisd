import api from './api'
import axios from 'axios'
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
  if (!parsed.hostname.includes('.'))
    return 'That URL has no valid domain — check for typos (e.g. https://medium.com/@user/article).'
  return null
}

export type ArticleSubmitErrorKind = 'invalid' | 'unreachable' | 'metadata' | 'server'

/** Classified failure from POST /api/articles — lets the form show the right message. */
export class ArticleSubmitError extends Error {
  kind: ArticleSubmitErrorKind
  constructor(kind: ArticleSubmitErrorKind, message: string) {
    super(message)
    this.name = 'ArticleSubmitError'
    this.kind = kind
  }
}

/**
 * Maps a backend 400 message to a stable kind.
 * Backend (articles.service.ts + @IsUrl DTO) sends:
 * - "url must be a URL" → invalid
 * - "…The URL is unreachable or returned no content" → unreachable
 * - "…Could not fetch Open Graph metadata…" → metadata
 */
export function classifyArticleError(serverMessage: string): ArticleSubmitErrorKind {
  const m = serverMessage.toLowerCase()
  if (m.includes('must be a url') || m.includes('must be an url') || m.includes('invalid url'))
    return 'invalid'
  if (m.includes('unreachable') || m.includes('no content') || m.includes('timed out'))
    return 'unreachable'
  if (m.includes('metadata') || m.includes('open graph') || m.includes('og title'))
    return 'metadata'
  return 'server'
}

function serverMessageOf(payload: unknown): string {
  if (typeof payload === 'string') return payload
  if (payload && typeof payload === 'object' && 'message' in payload) {
    const m = (payload as { message?: unknown }).message
    if (typeof m === 'string') return m
    if (Array.isArray(m)) return m.filter((x) => typeof x === 'string').join(' ')
  }
  return ''
}

export function submitErrorCopy(kind: ArticleSubmitErrorKind): { title: string; hint: string } {
  switch (kind) {
    case 'invalid':
      return {
        title: 'Invalid URL',
        hint: 'Check the link for typos and make sure it starts with https://.',
      }
    case 'unreachable':
      return {
        title: 'URL is unreachable',
        hint: 'The page did not respond — check the link is public and try again in a moment.',
      }
    case 'metadata':
      return {
        title: 'Could not fetch article metadata',
        hint: 'The page loaded but has no readable title — it may block scrapers or require login.',
      }
    case 'server':
      return {
        title: 'Could not save the article',
        hint: 'Something went wrong on the server — try again, and report it if it persists.',
      }
  }
}

/**
 * Task 12.2–12.3 — creates an article from a URL only.
 * Real path (VITE_USE_MOCKS=false): POST /api/articles { url } — the
 * backend fetches OG metadata and returns the created Draft entry.
 * A backend 4xx/5xx *response* is classified and thrown as
 * ArticleSubmitError so the form can explain invalid / unreachable /
 * metadata-less URLs. No response (backend stopped) falls back to a
 * local mock Draft so the prototype still works offline.
 * Prototype path (USE_MOCKS): synthesizes a Draft entry locally.
 */
export async function createArticle(rawUrl: string): Promise<AdminArticle> {
  const url = rawUrl.trim()
  if (!USE_MOCKS) {
    try {
      const { data } = await api.post<AdminArticle>('/api/articles', { url })
      return data
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        const serverMessage = serverMessageOf(err.response.data) || err.message
        throw new ArticleSubmitError(classifyArticleError(serverMessage), serverMessage)
      }
      // No response — backend stopped. Fall through to the mock entry.
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
