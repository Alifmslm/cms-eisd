// Prototype fixtures for achievements — visible WITHOUT backend.
// Covers every category (incl. Other), both levels, all results, and
// distinct year-months so filter + sort fit can be judged.
import type { Achievement } from '@/lib/achievements'

function iso(offsetDays: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString()
}

export const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-01',
    memberNames: ['Ahmad Rizki', 'Siti Rahma'],
    assistantCode: 'EISD',
    category: 'Hackathon',
    customCategory: null,
    level: 'International',
    result: 'Champion',
    competitionName: 'Global Hackathon 2026',
    competitionYearMonth: '2026-09',
    createdAt: iso(-20),
    updatedAt: iso(-1),
  },
  {
    id: 'ach-02',
    memberNames: ['Dewi Lestari'],
    assistantCode: 'UXID',
    category: 'UI/UX Competition',
    customCategory: null,
    level: 'National',
    result: 'Finalist',
    competitionName: 'Nasional UI/UX Challenge 2026',
    competitionYearMonth: '2026-05',
    createdAt: iso(-40),
    updatedAt: iso(-2),
  },
  {
    id: 'ach-03',
    memberNames: ['Maya Kusuma', 'Dimas Prasetyo'],
    assistantCode: 'GAME',
    category: 'Other',
    customCategory: 'Game Jam',
    level: 'National',
    result: '3rd Place',
    competitionName: 'Nusantara Game Jam 2026',
    competitionYearMonth: '2026-02',
    createdAt: iso(-60),
    updatedAt: iso(-3),
  },
  {
    id: 'ach-04',
    memberNames: ['Budi Santoso', 'Ani Wijaya', 'Rina Putri'],
    assistantCode: 'ESSY',
    category: 'Essay',
    customCategory: null,
    level: 'National',
    result: '2nd Place',
    competitionName: 'Lomba Esai Teknologi 2025',
    competitionYearMonth: '2025-11',
    createdAt: iso(-80),
    updatedAt: iso(-4),
  },
  {
    id: 'ach-05',
    memberNames: ['Fajar Nugroho'],
    assistantCode: 'SOFT',
    category: 'Software Engineering',
    customCategory: null,
    level: 'International',
    result: '1st Place',
    competitionName: 'International Software Engineering Cup 2025',
    competitionYearMonth: '2025-08',
    createdAt: iso(-100),
    updatedAt: iso(-5),
  },
]
