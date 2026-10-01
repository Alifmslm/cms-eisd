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

interface AchievementSeedMember {
  name: string;
  assistantCode: string;
}

interface AchievementSeed {
  members: AchievementSeedMember[];
  category: string;
  customCategory: string | null;
  level: string;
  result: string;
  competitionName: string;
  competitionYearMonth: string;
}

const ACHIEVEMENT_SEEDS: AchievementSeed[] = [
  {
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
  },
  {
    members: [{ name: 'Dewi Lestari', assistantCode: 'DWLS' }],
    category: 'UI/UX Competition',
    customCategory: null,
    level: 'National',
    result: 'Finalist',
    competitionName: 'Nasional UI/UX Challenge 2026',
    competitionYearMonth: '2026-05',
  },
  {
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
  },
  {
    members: [{ name: 'Fajar Nugroho', assistantCode: 'FJRN' }],
    category: 'Software Engineering',
    customCategory: null,
    level: 'International',
    result: '1st Place',
    competitionName: 'International Software Engineering Cup 2025',
    competitionYearMonth: '2025-08',
  },
  {
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
  },
];

async function seedAchievements() {
  // Drop legacy rows from before the member-codes migration (no members).
  const legacy = await prisma.achievement.deleteMany({ where: { members: { none: {} } } });
  if (legacy.count > 0) {
    console.log(`Removed ${legacy.count} legacy achievement row(s) without members.`);
  }
  // Idempotency on the natural key (competitionName, competitionYearMonth).
  let created = 0;
  for (const seed of ACHIEVEMENT_SEEDS) {
    const existing = await prisma.achievement.findFirst({
      where: {
        competitionName: seed.competitionName,
        competitionYearMonth: seed.competitionYearMonth,
      },
    });
    if (existing) {
      console.log(`Achievement already exists, skipping: ${seed.competitionName} (${seed.competitionYearMonth})`);
      continue;
    }
    await prisma.achievement.create({
      data: {
        category: seed.category,
        customCategory: seed.customCategory,
        level: seed.level,
        result: seed.result,
        competitionName: seed.competitionName,
        competitionYearMonth: seed.competitionYearMonth,
        members: { create: seed.members },
      },
    });
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
