import { makeDeletePhotoHandler } from '@/features/listings/api/photos'

type Ctx = { params: Promise<{ id: string; photoId: string }> }

export async function DELETE(req: Request, { params }: Ctx) {
  const { id, photoId } = await params
  return makeDeletePhotoHandler(id, photoId)(req)
}
