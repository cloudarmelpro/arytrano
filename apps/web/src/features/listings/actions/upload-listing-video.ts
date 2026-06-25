'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/features/auth'
import { prisma } from '@/lib/db'
import { parseListingVideoFile } from '../schemas/listing-video'
import {
  uploadListingVideo,
  deleteListingVideo,
} from '../services/upload-listing-video'

export type UploadListingVideoActionState = {
  ok: boolean
  message?: string
  url?: string
  posterUrl?: string
  durationSec?: number
}

export async function uploadListingVideoAction(
  _prev: UploadListingVideoActionState,
  formData: FormData,
): Promise<UploadListingVideoActionState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, message: 'Authentification requise.' }
  }

  const listingId = String(formData.get('listingId') ?? '')
  if (!/^c[a-z0-9]{20,40}$/.test(listingId)) {
    return { ok: false, message: 'Identifiant invalide.' }
  }

  // Authz : the bearer must own the listing.
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { ownerId: true },
  })
  if (!listing) return { ok: false, message: 'Annonce introuvable.' }
  if (listing.ownerId !== session.user.id) {
    return { ok: false, message: 'Accès refusé.' }
  }

  let file: File
  try {
    file = parseListingVideoFile(formData.get('video'))
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'Fichier invalide.',
    }
  }

  const outcome = await uploadListingVideo(listingId, file)
  switch (outcome.kind) {
    case 'ok':
      revalidatePath(`/dashboard/listings/${listingId}/edit`)
      revalidatePath(`/dashboard/listings`)
      return {
        ok: true,
        url: outcome.url,
        posterUrl: outcome.posterUrl,
        durationSec: outcome.durationSec,
      }
    case 'too_long':
      return {
        ok: false,
        message: `Vidéo trop longue (${outcome.durationSec}s) — 120s maximum.`,
      }
    case 'listing_not_found':
      return { ok: false, message: 'Annonce introuvable.' }
  }
}

export type DeleteListingVideoActionState = {
  ok: boolean
  message?: string
}

export async function deleteListingVideoAction(
  _prev: DeleteListingVideoActionState,
  formData: FormData,
): Promise<DeleteListingVideoActionState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, message: 'Authentification requise.' }
  }

  const listingId = String(formData.get('listingId') ?? '')
  if (!/^c[a-z0-9]{20,40}$/.test(listingId)) {
    return { ok: false, message: 'Identifiant invalide.' }
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { ownerId: true },
  })
  if (!listing) return { ok: false, message: 'Annonce introuvable.' }
  if (listing.ownerId !== session.user.id) {
    return { ok: false, message: 'Accès refusé.' }
  }

  const outcome = await deleteListingVideo(listingId)
  if (outcome.kind === 'no_video') {
    return { ok: false, message: 'Aucune vidéo à supprimer.' }
  }
  revalidatePath(`/dashboard/listings/${listingId}/edit`)
  return { ok: true }
}
