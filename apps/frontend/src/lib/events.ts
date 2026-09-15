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
