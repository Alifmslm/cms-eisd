import { auth } from '../src/auth/better-auth';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    throw new Error('ADMIN_USERNAME and ADMIN_PASSWORD env vars are required');
  }

  const email = `${username}@cms.local`;

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    console.log(`Admin user already exists (id: ${existing.id}), skipping seed.`);
    console.log(`To re-seed, delete the user first: DELETE FROM users WHERE username = '${username}';`);
    return;
  }

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

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
