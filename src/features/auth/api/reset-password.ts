import 'server-only'
import { ok, withErrorHandling } from '@/lib/api/response'
import { signTokenPair } from '@/lib/auth/jwt'
import { prisma } from '@/lib/db'
import { resetPassword } from '../services/reset-password'
import { resetPasswordSchema } from '../schemas'

/** POST /api/v1/auth/reset-password — mobile */
export const POST = withErrorHandling(async (req: Request) => {
  const body = await req.json()
  const input = resetPasswordSchema.parse(body)
  const { userId } = await resetPassword(input)

  // resetPassword has already incremented tokenVersion — re-read to get the
  // fresh value for the newly-issued JWT pair.
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true, tokenVersion: true },
  })
  const tokens = await signTokenPair({
    sub: user.id,
    role: user.role,
    ver: user.tokenVersion,
  })

  return ok({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    tokens,
  })
})
