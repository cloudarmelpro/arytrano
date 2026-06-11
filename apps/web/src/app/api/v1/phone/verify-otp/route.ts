import { makeVerifyPhoneOtpHandler } from '@/features/phone-otp/api/verify'

export const POST = makeVerifyPhoneOtpHandler()
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
