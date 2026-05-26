import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('@/lib/env', () => ({
  env: { AUTH_URL: 'https://arytrano.test', NODE_ENV: 'test' },
}))
vi.mock('@/lib/db', () => ({
  prisma: {
    lease: { findUnique: vi.fn(), update: vi.fn() },
    listing: { update: vi.fn() },
    $transaction: vi.fn(),
  },
}))
vi.mock('@/lib/email/send-transactional', () => ({
  sendTransactionalEmail: vi.fn().mockResolvedValue(undefined),
}))

import { tenantSignLease } from './tenant-sign-lease'
import { prisma } from '@/lib/db'

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(prisma.$transaction).mockImplementation(
    async (ops: unknown) => {
      if (Array.isArray(ops)) return Promise.all(ops)
      throw new Error('Unexpected $transaction shape')
    },
  )
})

const baseLease = {
  id: 'lease_1',
  status: 'PENDING_TENANT',
  tenantId: 'tenant_1',
  listingId: 'listing_1',
  owner: {
    id: 'owner_1',
    name: 'Hery R.',
    email: 'owner@example.mg',
    locale: 'FR_MG',
  },
  tenant: { name: 'Mialy R.', email: 'tenant@example.mg' },
  listing: { title: 'Studio Andrainjato' },
}

describe('tenantSignLease', () => {
  it('returns not_found when the lease does not exist', async () => {
    vi.mocked(prisma.lease.findUnique).mockResolvedValue(null)

    const result = await tenantSignLease('lease_x', 'tenant_1')

    expect(result).toEqual({ kind: 'not_found', leaseId: 'lease_x' })
  })

  it('returns not_tenant when the caller is not the designated tenant', async () => {
    vi.mocked(prisma.lease.findUnique).mockResolvedValue(baseLease as never)

    const result = await tenantSignLease('lease_1', 'someone_else')

    expect(result).toEqual({ kind: 'not_tenant', leaseId: 'lease_1' })
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })

  it('returns invalid_status when the lease is not PENDING_TENANT', async () => {
    vi.mocked(prisma.lease.findUnique).mockResolvedValue({
      ...baseLease,
      status: 'DRAFT',
    } as never)

    const result = await tenantSignLease('lease_1', 'tenant_1')

    expect(result).toEqual({
      kind: 'invalid_status',
      leaseId: 'lease_1',
      currentStatus: 'DRAFT',
    })
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })

  it('transitions Lease ACTIVE + flips Listing to RENTED in a single transaction', async () => {
    vi.mocked(prisma.lease.findUnique).mockResolvedValue(baseLease as never)

    const result = await tenantSignLease('lease_1', 'tenant_1')

    expect(result).toEqual({ kind: 'ok', leaseId: 'lease_1' })
    expect(prisma.$transaction).toHaveBeenCalledOnce()
  })
})
