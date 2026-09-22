// Prototype fixtures for Task 12.1 — visible WITHOUT backend.
// Covers both publish states (Draft / Published) so the UI fit can be judged.
// Shape mirrors the Prisma MediumArticle model + admin list needs.
export interface MockArticle {
  id: string
  url: string
  title: string
  description: string
  coverImage: string
  publishedDate: string
  publishedAt: string | null
  updatedAt: string
}

function iso(offsetDays: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString()
}

export const MOCK_ARTICLES: MockArticle[] = [
  {
    id: 'art-01',
    url: 'https://medium.com/@eisd/panel-surya-mini-untuk-lab-abc123',
    title: 'Panel Surya Mini untuk Lab: Dari Prototipe ke Publikasi',
    description:
      'Bagaimana tim EISD membangun prototipe panel surya mini 48 jam dan mendokumentasikan hasilnya untuk jurnal internal.',
    coverImage: '',
    publishedDate: iso(-2),
    publishedAt: iso(-1),
    updatedAt: iso(-1),
  },
  {
    id: 'art-02',
    url: 'https://medium.com/@eisd/robotika-dasar-untuk-pemula-def456',
    title: 'Robotika Dasar untuk Pemula: Modul Workshop Terbaru',
    description:
      'Ringkasan modul workshop robotika dasar — sensor, aktuator, dan pemrograman mikrokontroler untuk peserta baru.',
    coverImage: '',
    publishedDate: iso(-6),
    publishedAt: iso(-5),
    updatedAt: iso(0),
  },
  {
    id: 'art-03',
    url: 'https://medium.com/@eisd/ai-untuk-riset-sains-ghi789',
    title: 'AI untuk Riset Sains: Catatan Seminar Hybrid',
    description:
      'Poin-poin kunci seminar AI untuk riset — dari prompt engineering hingga evaluasi model untuk data eksperimen.',
    coverImage: '',
    publishedDate: iso(-12),
    publishedAt: iso(-11),
    updatedAt: iso(-8),
  },
  {
    id: 'art-04',
    url: 'https://medium.com/@eisd/open-house-lab-draft-jkl012',
    title: 'Open House Lab (draft — belum publish)',
    description:
      'Draf liputan open house lab — daftar stan, demo, dan testimoni pengunjung yang masih menunggu kurasi.',
    coverImage: '',
    publishedDate: iso(-3),
    publishedAt: null,
    updatedAt: iso(-3),
  },
  {
    id: 'art-05',
    url: 'https://medium.com/@eisd/jurnalistik-sains-untuk-peneliti-mno345',
    title: 'Jurnalistik Sains untuk Peneliti: Menulis Agar Dibaca',
    description:
      'Teknik menulis populer dari pelatihan jurnalistik sains — struktur artikel, judul, dan visual pendukung.',
    coverImage: '',
    publishedDate: iso(-7),
    publishedAt: null,
    updatedAt: iso(-6),
  },
]
