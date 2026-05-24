import { makePublishHandler } from '@/features/listings/api/publish'

type Ctx = { params: Promise<{ id: string }> }

export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params
  return makePublishHandler(id)(req)
}
