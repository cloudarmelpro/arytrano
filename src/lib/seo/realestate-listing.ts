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
  priceMonthlyMGA: string
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
 * Note: the city + neighborhood crumbs currently link to /annonces (we don't
 * have dedicated city/neighborhood landing pages yet — T-017 era plan). When
 * those land, swap the `item` values to the dedicated URLs.
 */
export function buildBreadcrumbListLd(
  listing: RealEstateListingForLd,
  baseUrl: string,
) {
  const detailUrl = `${baseUrl}/${listing.city.slug}/${listing.neighborhood.slug}/${listing.slug}`
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
        // City-level page doesn't exist yet (T-015 v0.5 — dedicated city
        // landing). Point to `/annonces` (unfiltered) until then so the
        // crumb doesn't share the same URL as position 3.
        item: `${baseUrl}/annonces`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: listing.neighborhood.nameFr,
        item: `${baseUrl}/annonces?neighborhood=${listing.neighborhood.slug}`,
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
export function buildRealEstateListingLd(
  listing: RealEstateListingForLd,
  baseUrl: string,
) {
  const url = `${baseUrl}/${listing.city.slug}/${listing.neighborhood.slug}/${listing.slug}`

  // Google's RichResults validator flags coordinates and prices when they
  // arrive as strings — parse the Decimal-derived strings back to numbers.
  const latitude = parseFloat(listing.lat)
  const longitude = parseFloat(listing.lng)
  const price = parseFloat(listing.priceMonthlyMGA)

  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: listing.title,
    description: listing.description.slice(0, 500),
    url,
    ...(listing.publishedAt && { datePublished: listing.publishedAt.toISOString() }),
    ...(listing.photos.length > 0 && { image: listing.photos.map((p) => p.url) }),
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
    // Google's local-real-estate signal — match the "X pièces" search phrasing.
    // We map bedrooms → numberOfRooms (closest semantic match given our schema).
    ...(typeof listing.bedrooms === 'number' && {
      numberOfRooms: listing.bedrooms,
      numberOfBedrooms: listing.bedrooms,
    }),
    ...(typeof listing.bathrooms === 'number' && {
      numberOfBathroomsTotal: listing.bathrooms,
    }),
  }
}
