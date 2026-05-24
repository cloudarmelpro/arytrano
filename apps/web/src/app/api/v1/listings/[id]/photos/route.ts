import {
  makeUploadPhotoHandler,
  makeReorderPhotosHandler,
} from '@/features/listings/api/photos'

type Ctx = { params: Promise<{ id: string }> }

export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params
  return makeUploadPhotoHandler(id)(req)
}

export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params
  return makeReorderPhotosHandler(id)(req)
}
