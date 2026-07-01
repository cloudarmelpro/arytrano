import 'server-only'

/**
 * SEC-22 — minimal structured logger. Vercel Logs / Contabo journald
 * both keep 90 days of stdout; we standardize the shape so a downstream
 * shipper (Axiom, Logflare) can parse without a custom regex per feature.
 *
 * Rules:
 *  - Emit ONE line per event. Newlines inside msg/data get replaced.
 *  - Never include PII (email, phone, IP raw). Callers must scrub or
 *    pass `ipHash` instead. Data payload larger than 8 KB is truncated.
 *  - Level maps 1:1 with syslog severity: debug < info < warn < error.
 *
 * Zero deps. Console-based so the runtime doesn't need a shipper to
 * still be readable during dev.
 */

type Level = 'debug' | 'info' | 'warn' | 'error'

const MAX_PAYLOAD_BYTES = 8 * 1024

function emit(level: Level, event: string, data?: Record<string, unknown>) {
  const line: Record<string, unknown> = {
    ts: new Date().toISOString(),
    level,
    event,
    ...(data ?? {}),
  }
  let serialized: string
  try {
    serialized = JSON.stringify(line)
  } catch {
    serialized = JSON.stringify({
      ts: line.ts,
      level,
      event,
      err: 'serialization-failure',
    })
  }
  if (serialized.length > MAX_PAYLOAD_BYTES) {
    serialized = serialized.slice(0, MAX_PAYLOAD_BYTES - 20) + '"…(truncated)"}'
  }
  // Route by level so ESM stdout / stderr streams stay independent.
  if (level === 'error') console.error(serialized)
  else if (level === 'warn') console.warn(serialized)
  else console.log(serialized)
}

export const log = {
  debug: (event: string, data?: Record<string, unknown>) =>
    emit('debug', event, data),
  info: (event: string, data?: Record<string, unknown>) =>
    emit('info', event, data),
  warn: (event: string, data?: Record<string, unknown>) =>
    emit('warn', event, data),
  error: (event: string, data?: Record<string, unknown>) =>
    emit('error', event, data),
}
