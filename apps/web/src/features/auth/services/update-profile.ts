import 'server-only'
import type { Locale, UserRole } from '@prisma/client'
import { prisma } from '@/lib/db'
import type { UpdateProfileInput } from '../schemas'

export type ProfileSnapshot = {
  id: string
  email: string
  name: string | null
  phone: string | null
  image: string | null
  role: UserRole
  locale: Locale
}

export async function getProfile(userId: string): Promise<ProfileSnapshot> {
  return prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { id: true, email: true, name: true, phone: true, image: true, role: true, locale: true },
  })
}

export async function updateProfile(
  userId: string,
  input: UpdateProfileInput,
): Promise<ProfileSnapshot> {
  // TRU-01 — when the phone number changes, drop the verification
  // stamp so the next publish forces a fresh OTP round. We compare
  // the new value against what's currently on the row.
  const current = await prisma.user.findUnique({
    where: { id: userId },
    select: { phone: true },
  })
  const nextPhone = input.phone ? input.phone : null
  const phoneChanged = (current?.phone ?? null) !== nextPhone

  return prisma.user.update({
    where: { id: userId },
    data: {
      name: input.name ? input.name : null,
      phone: nextPhone,
      ...(phoneChanged && { phoneVerifiedAt: null }),
      ...(input.locale ? { locale: input.locale } : {}),
    },
    select: { id: true, email: true, name: true, phone: true, image: true, role: true, locale: true },
  })
}
