import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
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
  const uni = await prisma.university.findUnique({
    where: { slug },
    select: { nameFr: true, acronym: true, city: { select: { nameFr: true } } },
  })
  if (!uni) return { title: 'Université introuvable' }
  const title = `Logements étudiants près de ${uni.acronym} — ${uni.city.nameFr}`
  return {
    title,
    description: `Toutes les annonces AryTrano à proximité de ${uni.nameFr}. Logements vérifiés, contact direct propriétaire, paiement Mobile Money.`,
    // Fable-audit P1-3 — hreflang consistent with the rest of the site.
    alternates: await localeAlternates(`/universites/${slug}`),
    openGraph: {
      // Fable-audit P0-2 — spread ogDefaults so shares carry an image.
      ...ogDefaults,
      title,
      type: 'website',
      url: `/universites/${slug}`,
    },
  }
}

/**
 * MKT-17 — co-branded landing page per university. Combines the
 * TEN-21 tagged neighborhoods and the TEN-11 bbox fallback into a
 * single "listings near {campus}" surface. Shareable URL for
 * university partnerships (student affairs office announcements,
 * WhatsApp intros, partnership emails).
 */
export default async function UniversityLandingPage({
  params,
}: {
  params: Params
}) {
  const { slug } = await params
  const uni = await prisma.university.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      acronym: true,
      nameFr: true,
      lat: true,
      lng: true,
      address: true,
      city: { select: { slug: true, nameFr: true } },
    },
  })
  if (!uni) notFound()

  // Prefer tagged neighborhoods (TEN-21). Fall back to bbox around
  // the campus (TEN-11) when no tags exist.
  const tagged = await prisma.neighborhoodUniversity.findMany({
    where: { universityId: uni.id },
    select: { neighborhoodId: true },
  })
  const listings = await prisma.listing.findMany({
    where: {
      status: 'PUBLISHED',
      ...(tagged.length > 0
        ? { neighborhoodId: { in: tagged.map((t) => t.neighborhoodId) } }
        : {
            lat: {
              gte: (Number(uni.lat) - 0.027).toFixed(6),
              lte: (Number(uni.lat) + 0.027).toFixed(6),
            },
            lng: {
              gte: (Number(uni.lng) - 0.029).toFixed(6),
              lte: (Number(uni.lng) + 0.029).toFixed(6),
            },
          }),
    },
    orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
    take: 18,
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

  const baseUrl = env.AUTH_URL.replace(/\/$/, '')
  // Fable-audit P2-6 — add geo + containedInPlace when we have coords.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollegeOrUniversity',
    name: uni.nameFr,
    alternateName: uni.acronym,
    ...(uni.address ? { address: uni.address } : {}),
    geo: {
      '@type': 'GeoCoordinates',
      latitude: Number(uni.lat),
      longitude: Number(uni.lng),
    },
    containedInPlace: {
      '@type': 'City',
      name: uni.city.nameFr,
      url: `${baseUrl}/villes/${uni.city.slug}`,
    },
    url: `${baseUrl}/universites/${uni.slug}`,
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6 lg:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />

      <header className="flex flex-col gap-3">
        <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
          Partenaire AryTrano
        </span>
        <h1 className="text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
          Logements étudiants près de <span className="text-primary">{uni.acronym}</span>
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          {uni.nameFr} — {uni.city.nameFr}. Sélection AryTrano de logements
          vérifiés à proximité du campus. Contact direct avec le propriétaire,
          caution simple, paiement Mobile Money.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">
          {listings.length === 0
            ? 'Aucune annonce disponible pour le moment'
            : `${listings.length} annonce${listings.length > 1 ? 's' : ''} sélectionnée${listings.length > 1 ? 's' : ''}`}
        </h2>
        {listings.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
            Inscris-toi pour recevoir une alerte dès qu’une annonce publie
            près de {uni.acronym}.
          </p>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((l) => (
              <li key={l.id}>
                {/* Fable-audit P1-3 — no UTM on internal links (they'd
                    self-pollute analytics + mint crawlable parameterized
                    URLs). Attribution is captured on the entry to
                    /universites/<slug>, not on the exit. */}
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
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
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

      <section className="rounded-2xl border border-border bg-muted/30 p-6">
        <h2 className="text-base font-semibold text-foreground">
          Étudiant·e à {uni.acronym} ? Reçois un mail quand une nouvelle annonce publie.
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Inscris-toi + configure tes filtres en 30 secondes.
        </p>
        <Link
          href="/sign-up?returnTo=/annonces"
          className="mt-4 inline-flex h-10 items-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Créer un compte
        </Link>
      </section>
    </div>
  )
}
