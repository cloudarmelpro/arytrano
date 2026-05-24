import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

async function main() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL is not set')

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  })
  try {
    const users = await prisma.user.findMany({
      select: { email: true, name: true, role: true, status: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })
    console.log(`${users.length} user(s):`)
    for (const u of users) {
      console.log(
        `  - ${u.email}  [${u.role} / ${u.status}]  ${u.name ?? '(no name)'}  ${u.createdAt.toISOString()}`,
      )
    }
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
