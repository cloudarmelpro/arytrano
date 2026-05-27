import { NextResponse } from 'next/server'
import { promises as fs } from 'node:fs'
import { prisma } from '@/lib/db'
import { env } from '@/lib/env'

/**
 * Public healthcheck endpoint.
 *
 * Used by:
 *   - External uptime monitoring (UptimeRobot, BetterStack) pinging
 *     `https://arytrano.com/api/health` every 1-5 min
 *   - Caddy/nginx healthcheck blocks
 *   - Manual incident debugging (`curl /api/health`)
 *
 * Returns 200 when everything is healthy, 503 when the DB ping fails.
 * Backup freshness is informational — a missing or stale backup doesn't
 * fail the healthcheck (we don't want a stuck cron to take the app
 * offline). Instead it shows up in the JSON for the monitoring agent
 * to alert on.
 */
export const dynamic = 'force-dynamic'  // never cache the healthcheck
export const runtime = 'nodejs'         // fs reads need Node runtime

type HealthStatus =
  | { ok: true; db: 'up'; lastBackupAgeHours: number | null }
  | { ok: false; db: 'down'; lastBackupAgeHours: number | null; error: string }

async function checkDb(): Promise<'up' | 'down'> {
  try {
    // Cheapest possible query — confirms the connection pool works.
    await prisma.$queryRaw`SELECT 1`
    return 'up'
  } catch {
    return 'down'
  }
}

async function getLastBackupAgeHours(): Promise<number | null> {
  try {
    const content = await fs.readFile(env.BACKUP_FRESHNESS_FILE, 'utf8')
    const ts = Number(content.trim())
    if (!Number.isFinite(ts)) return null
    const ageSeconds = Math.floor(Date.now() / 1000) - ts
    return Math.floor(ageSeconds / 3600)
  } catch {
    // File missing (first deploy, dev) or unreadable — not an error.
    return null
  }
}

export async function GET() {
  const [db, lastBackupAgeHours] = await Promise.all([
    checkDb(),
    getLastBackupAgeHours(),
  ])

  if (db === 'down') {
    const body: HealthStatus = {
      ok: false,
      db: 'down',
      lastBackupAgeHours,
      error: 'database unreachable',
    }
    return NextResponse.json(body, { status: 503 })
  }

  const body: HealthStatus = {
    ok: true,
    db: 'up',
    lastBackupAgeHours,
  }
  return NextResponse.json(body, { status: 200 })
}
