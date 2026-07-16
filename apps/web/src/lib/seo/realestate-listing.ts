/**
 * Minimum shape this helper needs from a public listing — declared locally
 * to keep `lib/` free of `features/` imports (ARCHITECTURE rule 4). The
 * feature-side `PublicListingDetail` type is a superset of this, so passing
 * one to the helpers continues to type-check.
 */
export type RealEstateListingForLd = {
  title: string
  description: string
  slug: string
  lat: string
  lng: string
  priceMonthlyMGA: number
  surfaceM2: number | null
  bedrooms: number | null
  bathrooms: number | null
  publishedAt: Date | null
  city: { slug: string; nameFr: string }
  neighborhood: { slug: string; nameFr: string }
  photos: { url: string }[]
}

/**
 * Schema.org BreadcrumbList for the listing detail page. Google uses this
 * to render the breadcrumb trail in SERP snippets (CTR boost for local search).
 *
 * Note: the city-level crumb is intentionally omitted until a dedicated
 * city landing page exists (T-015 v0.5). Emitting it now would duplicate
 * position 1's URL and fail Rich Results validation, costing the breadcrumb
 * snippet entirely. We restore the 4-item trail once /[city]/ lands.
 */
export function buildBreadcrumbListLd(
  listing: RealEstateListingForLd,
  baseUrl: string,
) {
  const detailUrl = `${baseUrl}/${listing.city.slug}/${listing.neighborhood.slug}/${listing.slug}`
  // E-T11 B4 : breadcrumb structure matches the visible nav on the
  // page (Annonces > City > Quartier > Listing). Each step except
  // the current points at a real SEO landing — Google reads the
  // hierarchy + uses it to surface rich breadcrumbs in SERP.
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Annonces',
        item: `${baseUrl}/annonces`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: listing.city.nameFr,
        item: `${baseUrl}/villes/${listing.city.slug}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: listing.neighborhood.nameFr,
        item: `${baseUrl}/villes/${listing.city.slug}/quartiers/${listing.neighborhood.slug}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: listing.title,
        item: detailUrl,
      },
    ],
  }
}

/**
 * Schema.org RealEstateListing JSON-LD builder for listing detail pages.
 *
 * Google uses this to surface rich results (price, location, photos) in
 * SERP and Discover. The shape follows https://schema.org/RealEstateListing
 * + the recommended `offers.PriceSpecification` for rental price.
 *
 * Render with `<script type="application/ld+json">` containing the stringified
 * output. React's JSX auto-escapes `</script>` so the standard pattern is safe:
 *
 *   <script type="application/ld+json" dangerouslySetInnerHTML={{
 *     __html: JSON.stringify(buildRealEstateListingLd(listing, baseUrl))
 *   }} />
 *
 * baseUrl: absolute origin (e.g. https://arytrano.com), no trailing slash.
 */
/**
 * Fable-audit P2-1 — aggregate rating passthrough. Star-rich SERP
 * snippets are the single cheapest CTR win for classified listings.
 * Only emitted when review count > 0 (Google rejects LD with 0-count
 * aggregateRating).
 */
export type ReviewStatsForLd = {
  count: number
  average: number | null
}

export function buildRealEstateListingLd(
  listing: RealEstateListingForLd,
  baseUrl: string,
  reviewStats?: ReviewStatsForLd,
) {
  const url = `${baseUrl}/${listing.city.slug}/${listing.neighborhood.slug}/${listing.slug}`

  // Google's RichResults validator flags coordinates and prices when they
  // arrive as strings — coordinates still come in as Decimal-serialized
  // strings, so parse those; price is now a plain integer (Ariary).
  const latitude = parseFloat(listing.lat)
  const longitude = parseFloat(listing.lng)
  const price = listing.priceMonthlyMGA

  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: listing.title,
    description: listing.description.slice(0, 500),
    url,
    // `datePosted` is the canonical property for classified-style content
    // (jobs, real estate, vehicles) per Google's rich-results guide for
    // RealEstateListing. `datePublished` is silently ignored in that context.
    ...(listing.publishedAt && { datePosted: listing.publishedAt.toISOString() }),
    ...(listing.photos.length > 0 && { image: listing.photos.map((p) => p.url) }),
    // Fable-audit P2-1 — aggregateRating for star snippets. Skip when
    // reviewStats is absent OR count is 0 (Google validator error).
    ...(reviewStats && reviewStats.count > 0 && reviewStats.average !== null && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: reviewStats.average,
        reviewCount: reviewStats.count,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    geo: {
      '@type': 'GeoCoordinates',
      latitude,
      longitude,
    },
    areaServed: {
      '@type': 'City',
      name: listing.city.nameFr,
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: listing.neighborhood.nameFr,
      addressRegion: listing.city.nameFr,
      addressCountry: 'MG',
    },
    offers: {
      '@type': 'Offer',
      url,
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price,
        priceCurrency: 'MGA',
        unitCode: 'MON', // ISO 8601: months
        referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitCode: 'MON' },
      },
      availability: 'https://schema.org/InStock',
    },
    ...(listing.surfaceM2 && {
      floorSize: {
        '@type': 'QuantitativeValue',
        value: listing.surfaceM2,
        unitCode: 'MTK', // ISO 8601: square meters
      },
    }),
    // `numberOfBedrooms` is the precise property; `numberOfRooms` is the
    // habitable-room total (bedrooms + living/dining, excludes
    // bathrooms + kitchen + hall) — Google's RealEstateListing rich
    // results panel surfaces both. We approximate `numberOfRooms` as
    // bedrooms + 1 because every Madagascar listing on the platform
    // has at least a salon/living room and there's no current schema
    // field for living-room count. The +1 is conservative and matches
    // the typical Fianarantsoa/Antananarivo apartment layout, where
    // even studios are listed with bedrooms=1.
    // SEO audit C-3 (2026-05-29) — adds numberOfRooms.
    ...(typeof listing.bedrooms === 'number' && {
      numberOfBedrooms: listing.bedrooms,
      numberOfRooms: listing.bedrooms + 1,
    }),
    ...(typeof listing.bathrooms === 'number' && {
      numberOfBathroomsTotal: listing.bathrooms,
    }),
  }
}
