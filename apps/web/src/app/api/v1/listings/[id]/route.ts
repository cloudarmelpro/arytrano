import { makeGetOneHandler } from '@/features/listings/api/get-one'
import { makeUpdateHandler } from '@/features/listings/api/update'
import { makeDeleteHandler } from '@/features/listings/api/delete-one'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(req: Request, { params }: Ctx) {
  const { id } = await params
  return makeGetOneHandler(id)(req)
}

export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params
  return makeUpdateHandler(id)(req)
}

export async function DELETE(req: Request, { params }: Ctx) {
  const { id } = await params
  return makeDeleteHandler(id)(req)
}
