import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock prisma BEFORE importing the service — Vitest hoists vi.mock.
vi.mock('@/lib/db', () => ({
  prisma: {
    listing: { findFirst: vi.fn() },
    review: { findUnique: vi.fn(), create: vi.fn() },
    contactEvent: { findFirst: vi.fn() },
    user: { findUnique: vi.fn() },
  },
}))

// `server-only` is fine to noop in a Node test env — it normally throws if
// imported from a Client Component bundle, which isn't a concern here.
vi.mock('server-only', () => ({}))

// Env reads from process.env at module load — provide a synthetic config
// so createReview can boot in unit tests without a real .env file.
vi.mock('@/lib/env', () => ({
  env: {
    AUTH_URL: 'https://arytrano.test',
    NODE_ENV: 'test',
  },
}))

// The fire-and-forget email pipeline isn't under test here — stub it.
vi.mock('@/lib/email/send-transactional', () => ({
  sendTransactionalEmail: vi.fn().mockResolvedValue(undefined),
}))

import { createReview } from './create-review'
import { prisma } from '@/lib/db'

const fakeListing = {
  id: 'list1',
  ownerId: 'owner1',
  title: 'Studio meublé à Andrainjato',
  slug: 'studio-xyz12345',
  city: { slug: 'fianarantsoa' },
  neighborhood: { slug: 'andrainjato' },
  owner: {
    id: 'owner1',
    email: 'owner@example.com',
    name: 'Rakoto',
    locale: 'FR_MG' as const,
  },
}
const fakeReview = {
  id: 'rev1',
  listingId: 'list1',
  authorId: 'student1',
  rating: 5,
  body: 'Belle annonce, propriétaire sérieux et chambre propre.',
  verifiedStay: false,
  ownerResponse: null,
  status: 'PUBLISHED' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(prisma.listing.findFirst).mockResolvedValue(fakeListing as never)
  vi.mocked(prisma.review.findUnique).mockResolvedValue(null as never)
  vi.mocked(prisma.review.create).mockResolvedValue(fakeReview as never)
  vi.mocked(prisma.user.findUnique).mockResolvedValue({ name: 'Hery' } as never)
})

describe('createReview · verifiedStay', () => {
  it('writes verifiedStay=true when a prior ContactEvent exists for the author', async () => {
    vi.mocked(prisma.contactEvent.findFirst).mockResolvedValue({
      id: 'ce1',
    } as never)

    await createReview({
      authorId: 'student1',
      data: {
        listingId: 'list1',
        rating: 5,
        body: 'Belle annonce, propriétaire sérieux et chambre propre.',
      },
    })

    expect(prisma.contactEvent.findFirst).toHaveBeenCalledWith({
      where: { listingId: 'list1', viewerId: 'student1' },
      select: { id: true },
    })
    expect(prisma.review.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ verifiedStay: true }),
      }),
    )
  })

  it('writes verifiedStay=false when the author has no prior ContactEvent', async () => {
    vi.mocked(prisma.contactEvent.findFirst).mockResolvedValue(null as never)

    await createReview({
      authorId: 'student1',
      data: {
        listingId: 'list1',
        rating: 4,
        body: 'Avis sans contact préalable via la plateforme — pas vérifié.',
      },
    })

    expect(prisma.review.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ verifiedStay: false }),
      }),
    )
  })

  it('refuses self-review even before checking ContactEvent', async () => {
    await expect(
      createReview({
        authorId: 'owner1', // same as fakeListing.ownerId
        data: {
          listingId: 'list1',
          rating: 5,
          body: 'Owners cannot review their own listing.',
        },
      }),
    ).rejects.toThrow(/propre/)
    expect(prisma.contactEvent.findFirst).not.toHaveBeenCalled()
  })

  it('refuses a duplicate review (existing row)', async () => {
    vi.mocked(prisma.review.findUnique).mockResolvedValue({
      id: 'rev0',
    } as never)
    await expect(
      createReview({
        authorId: 'student1',
        data: {
          listingId: 'list1',
          rating: 5,
          body: 'Trying to review twice should be rejected with 409.',
        },
      }),
    ).rejects.toThrow(/déjà/)
  })
})
