// Prototype fixtures for Task 11.1 — visible WITHOUT backend.
// Covers every computed status (Incoming / On Going / Finished) and
// both publish states (Draft / Published) so the UI fit can be judged.
export interface MockEvent {
  id: string
  slug: string
  title: string
  location: string
  startDate: string
  endDate: string
  publishedAt: string | null
  updatedAt: string
  coverImage: string
}

function iso(offsetDays: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString()
}

export const MOCK_EVENTS: MockEvent[] = [
  {
    id: 'evt-01',
    slug: 'annual-meeting-2026',
    title: 'Annual Meeting 2026',
    location: 'Aula Utama, Gedung EISD',
    startDate: iso(12),
    endDate: iso(13),
    publishedAt: iso(-2),
    updatedAt: iso(-1),
    coverImage: '',
  },
  {
    id: 'evt-02',
    slug: 'workshop-robotika-dasar',
    title: 'Workshop Robotika Dasar',
    location: 'Lab Robotika Lt. 2',
    startDate: iso(-1),
    endDate: iso(1),
    publishedAt: iso(-5),
    updatedAt: iso(0),
    coverImage: '',
  },
  {
    id: 'evt-03',
    slug: 'seminar-ai-untuk-riset',
    title: 'Seminar AI untuk Riset',
    location: 'Ruang Seminar Hybrid (Zoom + Offline)',
    startDate: iso(-10),
    endDate: iso(-9),
    publishedAt: iso(-12),
    updatedAt: iso(-8),
    coverImage: '',
  },
  {
    id: 'evt-04',
    slug: 'open-house-lab-draft',
    title: 'Open House Lab (draft — belum publish)',
    location: 'Seluruh Area Lab EISD',
    startDate: iso(30),
    endDate: iso(31),
    publishedAt: null,
    updatedAt: iso(-3),
    coverImage: '',
  },
  {
    id: 'evt-05',
    slug: 'pelatihan-jurnalistik-sains',
    title: 'Pelatihan Jurnalistik Sains',
    location: 'Perpustakaan Pusat, Ruang 3A',
    startDate: iso(3),
    endDate: iso(3),
    publishedAt: null,
    updatedAt: iso(-6),
    coverImage: '',
  },
  {
    id: 'evt-06',
    slug: 'hackathon-energi-terbarukan',
    title: 'Hackathon Energi Terbarukan: 48 Jam Membangun Prototipe Panel Surya Mini',
    location: 'Gedung Innovation Hub, Jakarta Selatan',
    startDate: iso(-40),
    endDate: iso(-38),
    publishedAt: iso(-45),
    updatedAt: iso(-37),
    coverImage: '',
  },
]
