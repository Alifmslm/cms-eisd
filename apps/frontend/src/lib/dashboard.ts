import api from './api'

// Shapes returned by GET /api/dashboard (admin only).
export interface DashboardEvent {
  id: string
  slug: string
  title: string
  location: string
  startDate: string
  endDate: string
  publishedAt: string | null
  updatedAt: string
}

export interface DashboardArticle {
  id: string
  title: string
  url: string
  publishedAt: string | null
  updatedAt: string
}

export interface DashboardResponse {
  totalEvents: number
  totalArticles: number
  publishedEvents: number
  draftEvents: number
  publishedArticles: number
  draftArticles: number
  upcomingEvents: number
  upcomingEventsList: DashboardEvent[]
  latestEvents: DashboardEvent[]
  latestArticles: DashboardArticle[]
}

export async function fetchDashboard(): Promise<DashboardResponse> {
  const { data } = await api.get<DashboardResponse>('/api/dashboard')
  return data
}

export type EventStatus = 'Incoming' | 'On Going' | 'Finished'

export function eventStatus(
  e: Pick<DashboardEvent, 'startDate' | 'endDate'>,
  now = new Date(),
): EventStatus {
  const start = new Date(e.startDate).getTime()
  const end = new Date(e.endDate).getTime()
  const t = now.getTime()
  if (t < start) return 'Incoming'
  if (t > end) return 'Finished'
  return 'On Going'
}
