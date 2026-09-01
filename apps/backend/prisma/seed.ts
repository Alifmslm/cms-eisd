import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const username = process.env.ADMIN_USERNAME || 'admin';

  const admin = await prisma.user.upsert({
    where: { username },
    update: { role: 'admin' },
    create: {
      username,
      email: `${username}@cms.local`,
      name: 'Admin',
      emailVerified: true,
      role: 'admin',
    },
  });

  console.log(`Default admin account ready:`);
  console.log(`  username: ${admin.username}`);
  console.log(`  role: ${admin.role}`);
  console.log(`  id: ${admin.id}`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
