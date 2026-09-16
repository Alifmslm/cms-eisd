import api from './api'
import { MOCK_EVENTS, type MockEvent } from '@/mocks/events.fixtures'
import { eventStatus as dashboardEventStatus, type EventStatus } from './dashboard'

export type AdminEvent = MockEvent
export type { EventStatus }

// Prototype mode: true = render fixtures instantly, no backend needed.
// Set VITE_USE_MOCKS=false once the admin list endpoint exists and you
// want to exercise the real API (still falls back to fixtures on error).
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false'

export function getEventStatus(e: Pick<AdminEvent, 'startDate' | 'endDate'>): EventStatus {
  return dashboardEventStatus(e)
}

/**
 * Task 11.6 prototype — pure flip of the publish state (no backend).
 * Publish stamps `publishedAt` with now; unpublish returns to Draft (null).
 * The real implementation will POST `:id/publish` / `:id/unpublish` and
 * adopt the server's timestamp instead.
 */
export function togglePublishState(e: AdminEvent, now = new Date()): AdminEvent {
  const published = e.publishedAt !== null
  return {
    ...e,
    publishedAt: published ? null : now.toISOString(),
    updatedAt: now.toISOString(),
  }
}

/** Admin list — tries backend, falls back to fixtures so the page works with backend stopped. */
export async function fetchAdminEvents(): Promise<AdminEvent[]> {
  if (USE_MOCKS) return MOCK_EVENTS
  try {
    const { data } = await api.get<AdminEvent[]>('/api/events')
    return data
  } catch {
    return MOCK_EVENTS
  }
}

export function formatShort(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
