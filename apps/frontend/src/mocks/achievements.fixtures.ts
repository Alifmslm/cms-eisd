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
    members: [
      { name: 'Ahmad Rizki', assistantCode: 'AHMD' },
      { name: 'Siti Rahma', assistantCode: 'STRA' },
    ],
    category: 'Hackathon',
    customCategory: null,
    level: 'International',
    result: '1st Place',
    competitionName: 'Global Hackathon 2026',
    competitionYearMonth: '2026-09',
    createdAt: iso(-20),
    updatedAt: iso(-1),
  },
  {
    id: 'ach-02',
    members: [{ name: 'Dewi Lestari', assistantCode: 'DWLS' }],
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
    members: [
      { name: 'Maya Kusuma', assistantCode: 'MYKS' },
      { name: 'Dimas Prasetyo', assistantCode: 'DMPR' },
    ],
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
    members: [
      { name: 'Budi Santoso', assistantCode: 'BDSN' },
      { name: 'Ani Wijaya', assistantCode: 'ANWJ' },
      { name: 'Rina Putri', assistantCode: 'RNPT' },
    ],
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
    members: [{ name: 'Fajar Nugroho', assistantCode: 'FJRN' }],
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
