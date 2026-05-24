/**
 * Schema.org `Place` + `ItemList` JSON-LD helpers (E-T11).
 *
 * Used by /villes/<city> and /villes/<city>/quartiers/<quartier>
 * landing pages so Google understands them as geographic entities
 * with a list of associated rentable units. Helps with rich-result
 * eligibility on geo-targeted queries.
 *
 * The returned object is a plain JS value — caller wraps it in
 * `safeJsonLd()` before stuffing into a `<script type="application/
 * ld+json">` tag (see memory `feedback_json_ld_xss`).
 */
export type PlaceSchemaInput = {
  name: string
  description: string
  url: string
  /** Decimal degrees. Optional — omit if we don't have coords. */
  lat?: number
  lng?: number
  /** Parent place hierarchy. Country first, then optional regions. */
  containedIn?: Array<{ name: string; type: 'Country' | 'AdministrativeArea' }>
}

export function buildPlaceSchema(input: PlaceSchemaInput): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: input.name,
    description: input.description,
    url: input.url,
  }
  if (input.lat !== undefined && input.lng !== undefined) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: input.lat,
      longitude: input.lng,
    }
  }
  if (input.containedIn && input.containedIn.length > 0) {
    // Use `containedInPlace` (newer Schema.org canonical) over
    // `containedIn` (deprecated). Array preserves the hierarchy.
    schema.containedInPlace = input.containedIn.map((c) => ({
      '@type': c.type === 'Country' ? 'Country' : 'AdministrativeArea',
      name: c.name,
    }))
  }
  return schema
}

export type ItemListInput = {
  name: string
  itemListElement: Array<{
    name: string
    url: string
    /** Optional positive integer price (for `Offer` typed items). */
    priceMGA?: number
  }>
}

/**
 * `ItemList` with `Offer` items pointing at listing detail URLs.
 * Google uses this to surface "X listings in {city}" in rich results.
 */
export function buildListingItemList(
  input: ItemListInput,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: input.name,
    numberOfItems: input.itemListElement.length,
    itemListElement: input.itemListElement.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      url: item.url,
      name: item.name,
      ...(item.priceMGA !== undefined
        ? {
            offers: {
              '@type': 'Offer',
              priceCurrency: 'MGA',
              price: item.priceMGA,
            },
          }
        : {}),
    })),
  }
}
