/**
 * Promote a user to ADMIN role.
 *
 * Usage:
 *   npx tsx prisma/promote-admin.ts <email>
 *
 * Bumps `tokenVersion` so any outstanding JWT (mobile bearer tokens, web
 * session if cookie not rotated) is invalidated. Web users will see the
 * new role after their next sign-in.
 *
 * Kept under `prisma/` next to `seed.ts` — same operational scope, never
 * imported from app code.
 */
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

async function main() {
  const email = process.argv[2]?.trim().toLowerCase()
  if (!email) {
    console.error('Usage: npx tsx prisma/promote-admin.ts <email>')
    process.exit(1)
  }

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL is not set')

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  })
  try {
    const before = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, role: true, status: true },
    })
    if (!before) {
      console.error(`❌ No user found for email: ${email}`)
      process.exit(1)
    }
    if (before.status !== 'ACTIVE') {
      console.error(`❌ User ${email} is ${before.status} — refusing to promote.`)
      process.exit(1)
    }
    if (before.role === 'ADMIN') {
      console.log(`ℹ️  ${email} is already ADMIN. Nothing to do.`)
      return
    }

    const after = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN', tokenVersion: { increment: 1 } },
      select: { email: true, role: true, tokenVersion: true },
    })
    console.log(`✅ Promoted: ${after.email} → ${after.role}`)
    console.log(`   tokenVersion bumped to ${after.tokenVersion} — sign out + sign back in to refresh your web session JWT.`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
