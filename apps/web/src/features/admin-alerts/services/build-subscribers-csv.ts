import 'server-only'
import { prisma } from '@/lib/db'

type Row = {
  phoneE164: string
  locale: string
  quartierSlug: string | null
  createdAt: Date
}

/**
 * RFC-4180 safe CSV escaper. Wraps a field in double quotes when it
 * contains a comma, double quote, CR, LF, or starts with one of the
 * Excel formula triggers (=, +, -, @) — those last four are a
 * CSV-injection vector (Excel/Sheets will execute a leading "="
 * formula when the file is opened).
 */
function escapeCsv(value: string): string {
  const needsQuote =
    /[",\r\n]/.test(value) || /^[=+\-@]/.test(value) || value.length === 0
  if (!needsQuote) return value
  // Prefix Excel-formula triggers with a leading single quote so the
  // spreadsheet renders the literal characters instead of a formula.
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value
  return `"${safe.replace(/"/g, '""')}"`
}

function formatRow(r: Row): string {
  return [
    escapeCsv(r.phoneE164),
    escapeCsv(r.locale),
    escapeCsv(r.quartierSlug ?? ''),
    escapeCsv(r.createdAt.toISOString()),
  ].join(',')
}

/**
 * Build a CSV of active WhatsApp Alert subscribers matching the
 * filter, OR the explicit list of ids passed by the admin (selection
 * via checkbox in the UI). When `ids` is provided, the filter is
 * ignored — the admin's explicit selection wins.
 *
 * Header row : phone,locale,quartier,createdAt
 *
 * Unsubscribed rows are NEVER exported, even if their id was passed
 * explicitly — protects against bulk-copy mistakes that re-target
 * opted-out users.
 *
 * Caller is responsible for the `Content-Type` + `Content-Disposition`
 * response headers; we return the raw string only.
 */
export async function buildSubscribersCsv(opts: {
  ids?: string[]
  quartierSlug?: string
  locale?: string
}): Promise<string> {
  const where = {
    unsubscribedAt: null,
    ...(opts.ids && opts.ids.length > 0
      ? { id: { in: opts.ids } }
      : {
          ...(opts.quartierSlug !== undefined
            ? { quartierSlug: opts.quartierSlug || null }
            : {}),
          ...(opts.locale !== undefined ? { locale: opts.locale } : {}),
        }),
  }

  const rows = await prisma.whatsAppAlert.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      phoneE164: true,
      locale: true,
      quartierSlug: true,
      createdAt: true,
    },
  })

  // RFC 4180 with CRLF line separator + UTF-8 BOM so Excel auto-
  // detects encoding (otherwise it mojibakes accented quartier
  // names on Windows). U+FEFF as escape literal — invisible chars
  // in source are too easy to lose during copy/paste.
  const BOM = '﻿'
  const header = 'phone,locale,quartier,createdAt'
  const body = rows.map(formatRow).join('\r\n')
  return BOM + header + '\r\n' + body
}
