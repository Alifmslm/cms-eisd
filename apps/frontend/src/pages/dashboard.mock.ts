// Temporary mock data for the Dashboard page.
// Swap `getDashboardData()` for real API calls when wiring tasks 10.2–10.4
// (GET /api/events, GET /api/articles). Sorting rules already match the spec:
// upcoming by startDate asc (10.3), latest by updatedAt desc (10.4).

export type EventStatus = 'Incoming' | 'On Going' | 'Finished'

export interface MockEvent {
  id: string
  slug: string
  title: string
  location: string
  startDate: string
  endDate: string
  updatedAt: string
  publishedAt: string | null
}

export interface MockArticle {
  id: string
  title: string
  url: string
  updatedAt: string
  publishedAt: string | null
}

export function eventStatus(e: MockEvent, now = new Date()): EventStatus {
  const start = new Date(e.startDate).getTime()
  const end = new Date(e.endDate).getTime()
  const t = now.getTime()
  if (t < start) return 'Incoming'
  if (t > end) return 'Finished'
  return 'On Going'
}

const EVENTS: MockEvent[] = [
  {
    id: 'e1',
    slug: 'robotics-open-house',
    title: 'Robotics Open House',
    location: 'Lab Hall A',
    startDate: '2026-09-12T09:00:00Z',
    endDate: '2026-09-12T16:00:00Z',
    updatedAt: '2026-09-02T10:00:00Z',
    publishedAt: '2026-08-28T09:00:00Z',
  },
  {
    id: 'e2',
    slug: 'embedded-workshop',
    title: 'Embedded Systems Workshop',
    location: 'Room 204',
    startDate: '2026-09-05T13:00:00Z',
    endDate: '2026-09-06T17:00:00Z',
    updatedAt: '2026-09-01T15:00:00Z',
    publishedAt: '2026-08-20T09:00:00Z',
  },
  {
    id: 'e3',
    slug: 'ai-seminar',
    title: 'AI Research Seminar',
    location: 'Auditorium',
    startDate: '2026-08-20T10:00:00Z',
    endDate: '2026-08-20T12:00:00Z',
    updatedAt: '2026-08-29T11:00:00Z',
    publishedAt: '2026-08-10T09:00:00Z',
  },
  {
    id: 'e4',
    slug: 'draft-iot-hackathon',
    title: 'IoT Hackathon (draft)',
    location: 'Lab Hall B',
    startDate: '2026-10-02T09:00:00Z',
    endDate: '2026-10-03T18:00:00Z',
    updatedAt: '2026-09-03T08:00:00Z',
    publishedAt: null,
  },
]

const ARTICLES: MockArticle[] = [
  {
    id: 'a1',
    title: 'Why we moved perception to the edge',
    url: 'https://medium.com/eisd/edge-perception',
    updatedAt: '2026-09-01T09:00:00Z',
    publishedAt: '2026-08-30T09:00:00Z',
  },
  {
    id: 'a2',
    title: 'Sensor fusion notes, part 2 (draft)',
    url: 'https://medium.com/eisd/sensor-fusion-2',
    updatedAt: '2026-09-02T09:00:00Z',
    publishedAt: null,
  },
]

export function getDashboardData(now = new Date()) {
  const published = EVENTS.filter((e) => e.publishedAt !== null)
  const upcoming = published
    .filter((e) => new Date(e.endDate).getTime() >= now.getTime())
    .sort((a, b) => +new Date(a.startDate) - +new Date(b.startDate))
  const latest = [...EVENTS].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
  return {
    totalEvents: EVENTS.length,
    totalArticles: ARTICLES.length,
    publishedEvents: published.length,
    draftEvents: EVENTS.length - published.length,
    upcoming,
    latest,
    articles: ARTICLES,
  }
}

export type DashboardData = ReturnType<typeof getDashboardData>
