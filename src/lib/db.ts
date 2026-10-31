import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Detect if cached PrismaClient is missing models defined in the current schema.
// If so, discard it so a fresh client is created (fixes HMR issues when new models are added).
const cachedPrisma = globalForPrisma.prisma
const needsRefresh = cachedPrisma && typeof (cachedPrisma as unknown as { video?: unknown }).video === 'undefined'

if (needsRefresh) {
  // Disconnect old client (best effort) and clear cache
  cachedPrisma?.$disconnect().catch(() => {})
  globalForPrisma.prisma = undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
