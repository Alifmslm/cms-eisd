import { auth } from '../src/auth/better-auth';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function seedAdmin() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    throw new Error('ADMIN_USERNAME and ADMIN_PASSWORD env vars are required');
  }

  const email = `${username}@cms.local`;

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    console.log(`Admin user already exists (id: ${existing.id}), skipping admin seed.`);
  } else {
    const result = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: 'Admin',
        username,
      },
    });

    // Promote to admin role (signUpEmail defaults to 'user')
    await prisma.user.update({
      where: { id: result.user.id },
      data: { role: 'admin' },
    });

    console.log('Admin account created via Better Auth:');
    console.log(`  username: ${result.user.username}`);
    console.log(`  email: ${result.user.email}`);
    console.log(`  role: admin`);
    console.log(`  id: ${result.user.id}`);
  }
}

interface AchievementSeed {
  memberNames: string[];
  assistantCode: string;
  category: string;
  customCategory: string | null;
  level: string;
  result: string;
  competitionName: string;
  competitionYearMonth: string;
}

const ACHIEVEMENT_SEEDS: AchievementSeed[] = [
  {
    memberNames: ['Ahmad Rizki', 'Siti Rahma'],
    assistantCode: 'EISD',
    category: 'Hackathon',
    customCategory: null,
    level: 'International',
    result: 'Champion',
    competitionName: 'Global Hackathon 2026',
    competitionYearMonth: '2026-09',
  },
  {
    memberNames: ['Dewi Lestari'],
    assistantCode: 'UXID',
    category: 'UI/UX Competition',
    customCategory: null,
    level: 'National',
    result: 'Finalist',
    competitionName: 'Nasional UI/UX Challenge 2026',
    competitionYearMonth: '2026-05',
  },
  {
    memberNames: ['Budi Santoso', 'Ani Wijaya', 'Rina Putri'],
    assistantCode: 'ESSY',
    category: 'Essay',
    customCategory: null,
    level: 'National',
    result: '2nd Place',
    competitionName: 'Lomba Esai Teknologi 2025',
    competitionYearMonth: '2025-11',
  },
  {
    memberNames: ['Fajar Nugroho'],
    assistantCode: 'SOFT',
    category: 'Software Engineering',
    customCategory: null,
    level: 'International',
    result: '1st Place',
    competitionName: 'International Software Engineering Cup 2025',
    competitionYearMonth: '2025-08',
  },
  {
    memberNames: ['Maya Kusuma', 'Dimas Prasetyo'],
    assistantCode: 'GAME',
    category: 'Other',
    customCategory: 'Game Jam',
    level: 'National',
    result: '3rd Place',
    competitionName: 'Nusantara Game Jam 2026',
    competitionYearMonth: '2026-02',
  },
];

async function seedAchievements() {
  // No @@unique on Achievement, so idempotency is check-then-insert on the
  // natural key (competitionName, assistantCode, competitionYearMonth).
  let created = 0;
  for (const seed of ACHIEVEMENT_SEEDS) {
    const existing = await prisma.achievement.findFirst({
      where: {
        competitionName: seed.competitionName,
        assistantCode: seed.assistantCode,
        competitionYearMonth: seed.competitionYearMonth,
      },
    });
    if (existing) {
      console.log(`Achievement already exists, skipping: ${seed.competitionName} (${seed.competitionYearMonth})`);
      continue;
    }
    await prisma.achievement.create({ data: seed });
    created += 1;
    console.log(`Achievement seeded: ${seed.competitionName} (${seed.competitionYearMonth})`);
  }
  console.log(`Achievement seeding done: ${created} created, ${ACHIEVEMENT_SEEDS.length - created} skipped.`);
}

async function main() {
  await seedAdmin();
  await seedAchievements();
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
