import 'server-only'
import { prisma } from '@/lib/db'
import type { AdminNoteTargetType } from '../schemas'

export type AdminNoteRow = {
  id: string
  body: string
  createdAt: Date
  updatedAt: Date
  author: {
    id: string
    name: string | null
    email: string
  }
}

export async function listAdminNotes(
  targetType: AdminNoteTargetType,
  targetId: string,
): Promise<AdminNoteRow[]> {
  return prisma.adminNote.findMany({
    where: { targetType, targetId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      body: true,
      createdAt: true,
      updatedAt: true,
      author: {
        select: { id: true, name: true, email: true },
      },
    },
  })
}
