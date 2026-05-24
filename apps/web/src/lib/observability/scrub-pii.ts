import type { ErrorEvent, Event } from '@sentry/nextjs'

/**
 * PII scrubber for Sentry events.
 *
 * AryTrano holds emails, phone numbers, owner identity documents,
 * and student-owner conversations. None of these should ever land in
 * a third-party error tracker — even Sentry has had breaches.
 *
 * This `beforeSend` hook mutates the event in place:
 *   - drops `request.headers.cookie` and `authorization`
 *   - drops the entire `request.data` body (may contain passwords)
 *   - masks email addresses in messages + breadcrumbs to `<email>`
 *   - masks E.164 phone numbers (`+261...`) to `<phone>`
 *   - drops `user.email` and `user.ip_address` (keeps user.id)
 *
 * Returning `null` would drop the event entirely. We always return
 * the event — masking is enough.
 */
export function scrubPii<T extends Event | ErrorEvent>(event: T): T {
  // 1. Request headers — strip auth + cookies
  if (event.request?.headers) {
    const headers = event.request.headers as Record<string, string>
    delete headers.cookie
    delete headers.Cookie
    delete headers.authorization
    delete headers.Authorization
    delete headers['x-csrf-token']
  }

  // 2. Request body — may contain passwords, payment data, etc.
  if (event.request) {
    delete event.request.data
  }

  // 3. User identity — keep `id` only
  if (event.user) {
    delete event.user.email
    delete event.user.ip_address
    delete event.user.username
  }

  // 4. Mask emails + phones in messages and breadcrumbs
  if (event.message) {
    event.message = maskPii(event.message)
  }
  for (const breadcrumb of event.breadcrumbs ?? []) {
    if (breadcrumb.message) {
      breadcrumb.message = maskPii(breadcrumb.message)
    }
    // Breadcrumb data often holds URL query strings + small payloads.
    if (breadcrumb.data && typeof breadcrumb.data === 'object') {
      maskPiiInObject(breadcrumb.data as Record<string, unknown>)
    }
  }

  // 5. Mask exception values (where the error message lives)
  for (const exception of event.exception?.values ?? []) {
    if (exception.value) {
      exception.value = maskPii(exception.value)
    }
  }

  return event
}

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi
// MG phone format: +261 + 8-10 digits, with optional spaces/dots/dashes
// between digits. The lower bound 8 catches partially-typed or malformed
// numbers (still PII), upper bound 10 prevents grabbing more than one
// adjacent number sequence.
const PHONE_RE = /\+261(?:[ .-]?\d){8,10}/g
const CIN_RE = /\b\d{12}\b/g // 12-digit MG CIN

export function maskPii(input: string): string {
  return input
    .replace(EMAIL_RE, '<email>')
    .replace(PHONE_RE, '<phone>')
    .replace(CIN_RE, '<cin>')
}

function maskPiiInObject(obj: Record<string, unknown>) {
  for (const key of Object.keys(obj)) {
    const value = obj[key]
    if (typeof value === 'string') {
      obj[key] = maskPii(value)
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      maskPiiInObject(value as Record<string, unknown>)
    }
  }
}
