import 'server-only'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { env } from '@/lib/env'

declare global {
  var __prisma: PrismaClient | undefined
}

function makeClient() {
  const adapter = new PrismaPg({ connectionString: env.DATABASE_URL })
  return new PrismaClient({
    adapter,
    log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })
}

export const prisma = global.__prisma ?? makeClient()

if (env.NODE_ENV !== 'production') {
  global.__prisma = prisma
}
