import {
  makeDeleteHandler,
  makePatchHandler,
} from '@/features/search/api/manage'

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(req: Request, ctx: Ctx) {
  return makePatchHandler()(req, ctx)
}

export async function DELETE(req: Request, ctx: Ctx) {
  return makeDeleteHandler()(req, ctx)
}
