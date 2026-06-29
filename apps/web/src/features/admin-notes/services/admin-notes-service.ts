import 'server-only'
import { prisma } from '@/lib/db'
import { errors } from '@/lib/api/errors'
import type { CreateAdminNoteInput } from '../schemas'

export async function createAdminNote(
  input: CreateAdminNoteInput,
  authorId: string,
): Promise<{ id: string }> {
  const note = await prisma.adminNote.create({
    data: {
      authorId,
      targetType: input.targetType,
      targetId: input.targetId,
      body: input.body,
    },
    select: { id: true },
  })
  return note
}

export async function deleteAdminNote(
  noteId: string,
  callerId: string,
): Promise<void> {
  // Only the author may delete their own notes. Other admins can still
  // see the row in the audit log.
  const note = await prisma.adminNote.findUnique({
    where: { id: noteId },
    select: { authorId: true },
  })
  if (!note) throw errors.notFound('Note introuvable')
  if (note.authorId !== callerId) {
    throw errors.forbidden('Seul l’auteur peut supprimer cette note')
  }
  await prisma.adminNote.delete({ where: { id: noteId } })
}
