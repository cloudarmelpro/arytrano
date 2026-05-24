import { makeUnlinkHandler } from '@/features/auth/api/unlink'

type Ctx = { params: Promise<{ provider: string }> }

export async function DELETE(req: Request, { params }: Ctx) {
  const { provider } = await params
  return makeUnlinkHandler(provider)(req)
}
