import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}))
vi.mock('@/lib/db', () => ({
  prisma: {
    lease: { findMany: vi.fn() },
    listing: { findMany: vi.fn(), updateMany: vi.fn() },
  },
}))
vi.mock('./apply-lease-payment-side-effect', () => ({
  applyLeasePaymentSideEffect: vi.fn(),
}))

import { reconcileStuckLeaseActivations } from './reconcile-stuck-lease-activations'
import { prisma } from '@/lib/db'
import { applyLeasePaymentSideEffect } from './apply-lease-payment-side-effect'

beforeEach(() => {
  vi.clearAllMocks()
  // Default the H-4 orphan-listing sweep to empty so existing tests
  // don't have to wire it; per-test cases override as needed.
  vi.mocked(prisma.listing.findMany).mockResolvedValue([] as never)
  vi.mocked(prisma.listing.updateMany).mockResolvedValue({ count: 0 } as never)
})

describe('reconcileStuckLeaseActivations', () => {
  it('returns zero counts when no stuck rows exist', async () => {
    vi.mocked(prisma.lease.findMany).mockResolvedValue([] as never)
    const result = await reconcileStuckLeaseActivations()
    expect(result).toEqual({
      scanned: 0,
      replayed: 0,
      alreadyActive: 0,
      failed: 0,
      orphanListingsFreed: 0,
    })
    expect(applyLeasePaymentSideEffect).not.toHaveBeenCalled()
  })

  it('replays the side-effect for each stuck lease', async () => {
    vi.mocked(prisma.lease.findMany).mockResolvedValue([
      { id: 'lease_1', paymentId: 'pay_1' },
      { id: 'lease_2', paymentId: 'pay_2' },
    ] as never)
    vi.mocked(applyLeasePaymentSideEffect).mockResolvedValue({
      kind: 'lease_now_active',
      leaseId: 'lease_x',
    } as never)

    const result = await reconcileStuckLeaseActivations()

    expect(result.scanned).toBe(2)
    expect(result.replayed).toBe(2)
    expect(result.alreadyActive).toBe(0)
    expect(applyLeasePaymentSideEffect).toHaveBeenCalledTimes(2)
  })

  it('counts already_active replays separately so telemetry stays honest', async () => {
    vi.mocked(prisma.lease.findMany).mockResolvedValue([
      { id: 'lease_1', paymentId: 'pay_1' },
    ] as never)
    vi.mocked(applyLeasePaymentSideEffect).mockResolvedValue({
      kind: 'already_active',
      leaseId: 'lease_1',
    } as never)

    const result = await reconcileStuckLeaseActivations()

    expect(result.alreadyActive).toBe(1)
    expect(result.replayed).toBe(0)
  })

  it('counts race_lost as replayed (side-effect did its job)', async () => {
    vi.mocked(prisma.lease.findMany).mockResolvedValue([
      { id: 'lease_1', paymentId: 'pay_1' },
    ] as never)
    vi.mocked(applyLeasePaymentSideEffect).mockResolvedValue({
      kind: 'race_lost_marked_refused',
      leaseId: 'lease_1',
    } as never)

    const result = await reconcileStuckLeaseActivations()

    expect(result.replayed).toBe(1)
  })

  it('captures failures to Sentry without breaking the batch', async () => {
    vi.mocked(prisma.lease.findMany).mockResolvedValue([
      { id: 'lease_throws', paymentId: 'pay_x' },
      { id: 'lease_ok', paymentId: 'pay_y' },
    ] as never)
    vi.mocked(applyLeasePaymentSideEffect)
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce({
        kind: 'lease_now_active',
        leaseId: 'lease_ok',
      } as never)

    const result = await reconcileStuckLeaseActivations()

    expect(result.failed).toBe(1)
    expect(result.replayed).toBe(1)
  })

  it('skips rows with no paymentId (defensive)', async () => {
    vi.mocked(prisma.lease.findMany).mockResolvedValue([
      { id: 'lease_orphan', paymentId: null },
    ] as never)

    const result = await reconcileStuckLeaseActivations()

    expect(result.scanned).toBe(1)
    expect(applyLeasePaymentSideEffect).not.toHaveBeenCalled()
  })

  // ---------- Payment audit H-4 (2026-05-29) ---------- //
  // Orphan listing sweep — flip TERMINATED+RENTED back to PUBLISHED.

  it('frees orphan RENTED listings whose lease is already TERMINATED', async () => {
    vi.mocked(prisma.listing.findMany).mockResolvedValue([
      { id: 'listing_1' },
      { id: 'listing_2' },
    ] as never)
    vi.mocked(prisma.listing.updateMany).mockResolvedValue({
      count: 1,
    } as never)
    vi.mocked(prisma.lease.findMany).mockResolvedValue([] as never)

    const result = await reconcileStuckLeaseActivations()

    expect(result.orphanListingsFreed).toBe(2)
    expect(prisma.listing.updateMany).toHaveBeenCalledTimes(2)
  })

  it('counts only listings that actually flipped (race-safe count)', async () => {
    vi.mocked(prisma.listing.findMany).mockResolvedValue([
      { id: 'listing_1' },
      { id: 'listing_2' },
    ] as never)
    vi.mocked(prisma.listing.updateMany)
      .mockResolvedValueOnce({ count: 1 } as never)
      // Second listing was raced — another path already flipped it.
      .mockResolvedValueOnce({ count: 0 } as never)
    vi.mocked(prisma.lease.findMany).mockResolvedValue([] as never)

    const result = await reconcileStuckLeaseActivations()

    expect(result.orphanListingsFreed).toBe(1)
  })
})
