import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Shared Prisma client — critical on Vercel serverless so we don't
 * open a new connection pool on every controller / cold start.
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

// Always reuse across warm invocations (including production serverless)
globalForPrisma.prisma = prisma;
