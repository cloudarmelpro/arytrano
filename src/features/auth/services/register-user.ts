import 'server-only'
import type { UserRole } from '@prisma/client'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/auth/password'
import { errors } from '@/lib/api/errors'

export type RegisterUserInput = {
  email: string
  password: string
  name?: string
  role?: UserRole
}

export type RegisteredUser = {
  id: string
  email: string
  name: string | null
  role: UserRole
  tokenVersion: number
}

/**
 * Create a new user with hashed password.
 * Throws ApiError(409) if email already taken.
 */
export async function registerUser(input: RegisterUserInput): Promise<RegisteredUser> {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  })
  if (existing) {
    throw errors.conflict('Un compte existe déjà pour cet email')
  }

  const passwordHash = await hashPassword(input.password)

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      name: input.name ?? null,
      role: input.role ?? 'STUDENT',
    },
    select: { id: true, email: true, name: true, role: true, tokenVersion: true },
  })

  return user
}
