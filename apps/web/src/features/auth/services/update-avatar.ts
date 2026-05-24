import 'server-only'
import { ZodError } from 'zod'
import { prisma } from '@/lib/db'
import { uploadBuffer, deleteAsset } from '@/lib/cloudinary'
import { sniffImage } from '@/lib/images/sniff'
import { errors } from '@/lib/api/errors'
import { parseAvatarFile } from '../schemas'

export async function updateAvatar(userId: string, file: File): Promise<{ url: string }> {
  try {
    parseAvatarFile(file)
  } catch (err) {
    if (err instanceof ZodError) {
      throw errors.validation(err.issues[0]?.message ?? 'Fichier invalide')
    }
    throw err
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  // Magic-bytes sniff before the Cloudinary transfer — blocks polyglot
  // uploads (SVG / HTML / PDF disguised as image/jpeg) and saves bandwidth.
  const sniff = await sniffImage(buffer)
  if (!sniff.ok) {
    console.warn('[update-avatar] magic-bytes rejected', { reason: sniff.reason })
    throw errors.validation('Fichier non reconnu comme image (JPG, PNG, WebP ou HEIC)')
  }

  const result = await uploadBuffer(buffer, {
    folder: 'arytrano/avatars',
    publicId: `user-${userId}`,
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto' },
    ],
  })
  await prisma.user.update({
    where: { id: userId },
    data: { image: result.url },
  })
  return { url: result.url }
}

export async function removeAvatar(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { image: null },
  })
  // Best-effort delete from Cloudinary — don't fail user op if it errors.
  await deleteAsset(`arytrano/avatars/user-${userId}`).catch(() => {})
}
