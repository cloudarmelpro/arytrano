import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { formatAriary } from '@/lib/format/currency'
import { env } from '@/lib/env'
import { safeJsonLd } from '@/lib/seo/safe-json-ld'
import { ogDefaults } from '@/lib/seo/og-defaults'
import { localeAlternates } from '@/lib/seo/alternates'

export const dynamic = 'force-dynamic'

type Params = Promise<{ slug: string }>

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { slug } = await params
  const owner = await prisma.user.findUnique({
    where: { publicSlug: slug },
    select: { name: true, status: true },
  })
  if (!owner || owner.status !== 'ACTIVE') return { title: 'Profil introuvable' }
  const display = owner.name ?? 'Propriétaire'
  // Fable-audit P0-1 — brand suffix comes from the layout template.
  // Fable-audit P0-2 — spread ogDefaults so shares carry an image.
  // Fable-audit P1-4 — hreflang via localeAlternates.
  return {
    title: `${display} — Propriétaire`,
    description: `Toutes les annonces publiées par ${display} sur AryTrano.`,
    alternates: await localeAlternates(`/proprio/${slug}`),
    openGraph: {
      ...ogDefaults,
      title: `${display} — Propriétaire`,
      type: 'profile',
      url: `/proprio/${slug}`,
    },
  }
}

export default async function OwnerPublicProfilePage({
  params,
}: {
  params: Params
}) {
  const { slug } = await params
  const owner = await prisma.user.findUnique({
    where: { publicSlug: slug },
    select: {
      id: true,
      name: true,
      image: true,
      status: true,
      role: true,
      createdAt: true,
      ownerProfile: { select: { verifiedAt: true } },
    },
  })
  if (
    !owner ||
    owner.status !== 'ACTIVE' ||
    (owner.role !== 'OWNER' && owner.role !== 'ADMIN')
  ) {
    notFound()
  }

  const listings = await prisma.listing.findMany({
    where: { ownerId: owner.id, status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    take: 24,
    select: {
      id: true,
      title: true,
      slug: true,
      priceMonthlyMGA: true,
      city: { select: { slug: true, nameFr: true } },
      neighborhood: { select: { slug: true, nameFr: true } },
      photos: {
        select: { url: true },
        orderBy: { position: 'asc' },
        take: 1,
      },
    },
  })

  const displayName = owner.name ?? 'Propriétaire'
  const initial = displayName[0]?.toUpperCase() ?? 'P'
  const memberSince = owner.createdAt.toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  })
  const baseUrl = env.AUTH_URL.replace(/\/$/, '')
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    dateCreated: owner.createdAt.toISOString(),
    mainEntity: {
      '@type': 'Person',
      name: displayName,
      url: `${baseUrl}/proprio/${slug}`,
    },
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-12 sm:px-6 lg:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />

      <header className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-primary/10 text-primary">
          {owner.image ? (
            <Image
              src={owner.image}
              alt={`Photo de profil de ${displayName}`}
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-2xl font-semibold">
              {initial}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
            {displayName}
          </h1>
          <p className="text-sm text-muted-foreground">
            Propriétaire AryTrano depuis {memberSince}
            {owner.ownerProfile?.verifiedAt ? ' · Identité vérifiée ✓' : ''}
          </p>
        </div>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">
          {listings.length === 0
            ? 'Aucune annonce publiée pour le moment'
            : `${listings.length} annonce${listings.length > 1 ? 's' : ''} en ligne`}
        </h2>
        {listings.length > 0 && (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((l) => (
              <li key={l.id}>
                <Link
                  href={`/${l.city.slug}/${l.neighborhood.slug}/${l.slug}`}
                  className="group flex flex-col gap-2"
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted ring-1 ring-border/60">
                    {l.photos[0]?.url ? (
                      <Image
                        src={l.photos[0].url}
                        alt={l.title}
                        fill
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                        —
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p className="line-clamp-1 text-sm font-medium text-foreground">
                      {l.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {l.neighborhood.nameFr}, {l.city.nameFr}
                    </p>
                    <p className="font-mono text-sm text-foreground">
                      {formatAriary(l.priceMonthlyMGA)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
