'use server'

import { ZodError, z } from 'zod'
import QRCode from 'qrcode'
import { ApiError } from '@/lib/api/errors'
import { auth } from '../auth'
import {
  enableTotp,
  disableTotp,
  startTotpSetup,
} from '../services/totp'
import { buildOtpAuthUrl } from '@/lib/auth/totp'

const codeSchema = z.string().trim().min(6).max(10)

export type TotpSetupState =
  | { ok: false; message: string }
  | {
      ok: true
      secret: string
      otpauth: string
      qrDataUrl: string
    }

/**
 * Step 1 — generate a fresh TOTP secret + QR code. Nothing persisted yet.
 * Caller must follow up with `enableTotpAction(secret, firstCode)`.
 *
 * Why no DB write here: a half-finished setup (user closes the tab after
 * scanning) shouldn't leave a stale secret on the account.
 */
export async function startTotpSetupAction(): Promise<TotpSetupState> {
  const session = await auth()
  if (!session?.user?.id || !session.user.email) {
    return { ok: false, message: 'Authentification requise' }
  }
  const { secret } = startTotpSetup()
  const otpauth = buildOtpAuthUrl({
    secret,
    accountLabel: session.user.email,
    issuer: 'AryTrano',
  })
  const qrDataUrl = await QRCode.toDataURL(otpauth, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 256,
  })
  return { ok: true, secret, otpauth, qrDataUrl }
}

const enableSchema = z.object({
  secret: z.string().min(16).max(128),
  code: z.string().regex(/^\d{6}$/, 'Code à 6 chiffres'),
})

export type EnableTotpState =
  | { ok: false; message: string }
  | { ok: true; recoveryCodes: string[] }

export async function enableTotpAction(input: {
  secret: string
  code: string
}): Promise<EnableTotpState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, message: 'Authentification requise' }
  }
  let parsed
  try {
    parsed = enableSchema.parse(input)
  } catch (err) {
    if (err instanceof ZodError) {
      return {
        ok: false,
        message: err.issues[0]?.message ?? 'Paramètres invalides',
      }
    }
    throw err
  }
  try {
    const { recoveryCodes } = await enableTotp({
      userId: session.user.id,
      secret: parsed.secret,
      firstCode: parsed.code,
    })
    return { ok: true, recoveryCodes }
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, message: err.message }
    console.error('[enableTotpAction]', err)
    return { ok: false, message: 'Impossible d\'activer le 2FA pour le moment.' }
  }
}

export type DisableTotpState = { ok: boolean; message?: string }

export async function disableTotpAction(code: string): Promise<DisableTotpState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, message: 'Authentification requise' }
  }
  const parsed = codeSchema.safeParse(code)
  if (!parsed.success) {
    return { ok: false, message: 'Code invalide' }
  }
  try {
    await disableTotp({ userId: session.user.id, code: parsed.data })
    return { ok: true }
  } catch (err) {
    if (err instanceof ApiError) return { ok: false, message: err.message }
    console.error('[disableTotpAction]', err)
    return { ok: false, message: 'Impossible de désactiver le 2FA.' }
  }
}
