import 'server-only'
import { prisma } from '@/lib/db'

export type OnboardingStep = {
  key: string
  label: string
  done: boolean
  hint: string
  href: string
}

export type OnboardingProgress = {
  steps: OnboardingStep[]
  doneCount: number
  totalCount: number
  allDone: boolean
}

/**
 * OWN-18 — checklist-style onboarding for new owners. Reads the user
 * row once + a lightweight aggregate on Listing to know how far the
 * owner has gone. Cheap enough to run on every dashboard load; the
 * card hides itself once every step is done so we don't nag repeat
 * visitors.
 */
export async function getOwnerOnboardingProgress(
  userId: string,
): Promise<OnboardingProgress> {
  const [user, ownerProfile, listingCounts] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        emailVerified: true,
        phone: true,
        phoneVerifiedAt: true,
        ownerTermsAcceptedAt: true,
      },
    }),
    prisma.ownerProfile.findUnique({
      where: { userId },
      select: {
        cinUploadedAt: true,
        verifiedAt: true,
      },
    }),
    prisma.listing.groupBy({
      by: ['status'],
      where: { ownerId: userId, status: { in: ['DRAFT', 'PUBLISHED'] } },
      _count: true,
    }),
  ])

  const drafts = listingCounts.find((r) => r.status === 'DRAFT')?._count ?? 0
  const published =
    listingCounts.find((r) => r.status === 'PUBLISHED')?._count ?? 0

  const steps: OnboardingStep[] = [
    {
      key: 'email',
      label: 'Vérifie ton email',
      done: Boolean(user?.emailVerified),
      hint: 'Cherche l’email « Confirme ton compte » dans ta boîte.',
      href: '/dashboard/settings',
    },
    {
      key: 'phone',
      label: 'Ajoute + vérifie ton téléphone',
      done: Boolean(user?.phone && user.phoneVerifiedAt),
      hint: 'Obligatoire pour publier — un OTP par SMS confirme le numéro.',
      href: '/dashboard/profile',
    },
    {
      key: 'terms',
      label: 'Accepte les CGU propriétaire',
      done: Boolean(user?.ownerTermsAcceptedAt),
      hint: 'Une fois par compte. Prend 30 s à lire.',
      href: '/onboarding/owner/terms',
    },
    {
      key: 'draft',
      label: 'Crée ta première annonce',
      done: drafts > 0 || published > 0,
      hint: 'Titre, photos, prix. Sauvegardé en brouillon en attendant.',
      href: '/dashboard/listings/new',
    },
    {
      key: 'publish',
      label: 'Publie ta première annonce',
      done: published > 0,
      hint: 'Elle apparaît sur /annonces dès la publication.',
      href: '/dashboard/listings',
    },
    {
      key: 'cin',
      label: 'Ajoute ta CIN (badge « vérifié »)',
      done: Boolean(ownerProfile?.verifiedAt),
      hint: 'Optionnel — mais les étudiants contactent 3× plus les profils vérifiés.',
      href: '/dashboard/verify-owner',
    },
  ]

  const doneCount = steps.filter((s) => s.done).length
  return {
    steps,
    doneCount,
    totalCount: steps.length,
    allDone: doneCount === steps.length,
  }
}
