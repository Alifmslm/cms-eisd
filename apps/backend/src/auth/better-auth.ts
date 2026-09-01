import { betterAuth } from 'better-auth';
import { prismaAdapter } from '@better-auth/prisma-adapter';
import { username, bearer } from 'better-auth/plugins';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET || process.env.SESSION_SECRET || 'dev-secret-change-in-production',

  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },

  user: {
    additionalFields: {
      role: {
        type: ['admin', 'user'],
        required: false,
        defaultValue: 'user',
        input: false,
      },
    },
  },

  advanced: {
    useSecureCookies: process.env.NODE_ENV === 'production',
    disableCSRFCheck: false,
    disableOriginCheck: false,
  },

  trustedOrigins: [process.env.FRONTEND_URL || 'http://localhost:5173'],

  plugins: [
    username(),
    bearer(),
  ],
});
