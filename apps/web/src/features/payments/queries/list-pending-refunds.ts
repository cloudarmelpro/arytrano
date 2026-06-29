import 'server-only'
import { prisma } from '@/lib/db'

export type PendingRefundRow = {
  id: string
  amountMGA: number
  purpose: string
  createdAt: Date
  payerPhone: string | null
  user: { id: string; name: string | null; email: string }
  lease: { id: string } | null
}

export async function listPendingRefunds(): Promise<PendingRefundRow[]> {
  return prisma.payment.findMany({
    where: { status: 'REFUND_PENDING' },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      amountMGA: true,
      purpose: true,
      createdAt: true,
      payerPhone: true,
      user: { select: { id: true, name: true, email: true } },
      lease: { select: { id: true } },
    },
  })
}
