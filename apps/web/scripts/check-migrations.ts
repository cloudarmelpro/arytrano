/**
 * Reports the diff between the migrations in `prisma/migrations/`
 * (what the code expects) and `_prisma_migrations` rows in the
 * connected DB (what has actually been applied).
 *
 * Run :
 *   npm run check:migrations
 *
 * Exit codes :
 *   0 → DB is up-to-date (every local migration is applied).
 *   1 → DB has pending migrations OR is ahead of the working tree
 *       (the second case means you pulled a branch with FEWER
 *       migrations than your DB — usually fine but worth flagging).
 *   2 → could not reach the DB (env / network problem).
 *
 * Uses the standalone pg driver instead of Prisma's client so it
 * keeps working even when the schema in the working tree is broken
 * (e.g. just-pulled migration referencing a column that doesn't
 * exist on the live DB — exactly the situation this script is
 * meant to surface).
 */
import 'dotenv/config'
import { Client } from 'pg'
import { readdir } from 'node:fs/promises'
import { join } from 'node:path'

const MIGRATIONS_DIR = join(import.meta.dirname, '..', 'prisma', 'migrations')

async function readLocalMigrations(): Promise<string[]> {
  const entries = await readdir(MIGRATIONS_DIR, { withFileTypes: true })
  return entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort()
}

async function readAppliedMigrations(): Promise<string[]> {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error('[check:migrations] DATABASE_URL is not set — abort.')
    process.exit(2)
  }
  const client = new Client({ connectionString: url })
  try {
    await client.connect()
  } catch (err) {
    console.error(
      '[check:migrations] could not reach DB :',
      err instanceof Error ? err.message : String(err),
    )
    process.exit(2)
  }
  try {
    // The `_prisma_migrations` table is created by `prisma migrate
    // deploy` on first run — its absence means a fresh DB.
    const res = await client.query<{ migration_name: string }>(
      `select migration_name
       from "_prisma_migrations"
       where finished_at is not null
       order by migration_name asc`,
    )
    return res.rows.map((r) => r.migration_name)
  } catch (err) {
    // 42P01 = undefined_table — `_prisma_migrations` doesn't exist.
    // Treat as "nothing applied yet" rather than an error, since
    // it's a normal pre-deploy state.
    if (
      err &&
      typeof err === 'object' &&
      'code' in err &&
      (err as { code: string }).code === '42P01'
    ) {
      return []
    }
    throw err
  } finally {
    await client.end()
  }
}

async function main() {
  const [local, applied] = await Promise.all([
    readLocalMigrations(),
    readAppliedMigrations(),
  ])
  const appliedSet = new Set(applied)
  const localSet = new Set(local)
  const pending = local.filter((m) => !appliedSet.has(m))
  const ahead = applied.filter((m) => !localSet.has(m))

  console.log(`Local migrations  : ${local.length}`)
  console.log(`Applied to DB     : ${applied.length}`)
  console.log()

  if (pending.length === 0 && ahead.length === 0) {
    console.log('✅ DB is in sync — nothing to do.')
    process.exit(0)
  }

  if (pending.length > 0) {
    console.log(`⚠️  ${pending.length} pending migration(s) :`)
    for (const m of pending) console.log(`   - ${m}`)
    console.log()
    console.log('Fix: npx prisma migrate deploy && npx prisma db seed')
    console.log()
  }

  if (ahead.length > 0) {
    console.log(
      `ℹ️  ${ahead.length} migration(s) applied to DB but missing locally :`,
    )
    for (const m of ahead) console.log(`   - ${m}`)
    console.log()
    console.log(
      '(Probably fine — happens after switching to a branch with fewer migrations.)',
    )
    console.log()
  }

  process.exit(pending.length > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error('[check:migrations] unexpected error :', err)
  process.exit(2)
})
