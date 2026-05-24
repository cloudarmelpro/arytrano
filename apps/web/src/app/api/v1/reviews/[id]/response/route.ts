import {
  makeRespondHandler,
  makeDeleteResponseHandler,
} from '@/features/reviews/api/response'

type Ctx = { params: Promise<{ id: string }> }

export async function POST(req: Request, ctx: Ctx) {
  return makeRespondHandler()(req, ctx)
}

export async function DELETE(req: Request, ctx: Ctx) {
  return makeDeleteResponseHandler()(req, ctx)
}
