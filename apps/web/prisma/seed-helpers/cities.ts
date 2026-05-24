/**
 * Static seed data for the 5 launch cities (E-T07 multi-ville).
 *
 * Layout per city :
 *   - slug, nameFr, nameMg : human-readable identifiers
 *   - lat / lng : centre-ville centroid (string for Prisma Decimal)
 *   - neighborhoods : student-relevant fokontany / quartiers
 *
 * Quartier selection focused on :
 *   - Proximity to public universities + lycées
 *   - Existing student rental market (informal beta interviews)
 *   - Mix of centre-ville (lively) + outer ring (calmer / cheaper)
 *
 * Coordinates are centre-of-fokontany approximations. v1 launch
 * doesn't require perfect GIS data — the map overlay uses these for
 * pin placement only. Refine post-launch with a proper GIS source
 * (OpenStreetMap admin_level=10 fokontany boundaries when published).
 *
 * IMPORTANT : do NOT remove a quartier slug once a listing references
 * it — the cascade is `Restrict`. Renaming is fine (slug stays,
 * nameFr/nameMg update). Adding new ones is free.
 */
export type CitySeed = {
  slug: string
  nameFr: string
  nameMg: string
  lat: string
  lng: string
  neighborhoods: Array<{
    slug: string
    nameFr: string
    nameMg: string
    lat: string
    lng: string
  }>
}

const FIANARANTSOA: CitySeed = {
  slug: 'fianarantsoa',
  nameFr: 'Fianarantsoa',
  nameMg: 'Fianarantsoa',
  lat: '-21.4554',
  lng: '47.0857',
  neighborhoods: [
    { slug: 'andrainjato', nameFr: 'Andrainjato', nameMg: 'Andrainjato', lat: '-21.4628', lng: '47.0764' },
    { slug: 'antarandolo', nameFr: 'Antarandolo', nameMg: 'Antarandolo', lat: '-21.4717', lng: '47.0728' },
    { slug: 'tsianolondroa', nameFr: 'Tsianolondroa', nameMg: 'Tsianolondroa', lat: '-21.4504', lng: '47.0856' },
    { slug: 'mahamanina', nameFr: 'Mahamanina', nameMg: 'Mahamanina', lat: '-21.4581', lng: '47.0892' },
    { slug: 'anjoma', nameFr: 'Anjoma', nameMg: 'Anjoma', lat: '-21.4488', lng: '47.0903' },
    { slug: 'ankidona', nameFr: 'Ankidona', nameMg: 'Ankidona', lat: '-21.4395', lng: '47.0828' },
    { slug: 'ambalavato', nameFr: 'Ambalavato', nameMg: 'Ambalavato', lat: '-21.4612', lng: '47.0830' },
    { slug: 'mahasoabe', nameFr: 'Mahasoabe', nameMg: 'Mahasoabe', lat: '-21.4790', lng: '47.0801' },
  ],
}

const ANTANANARIVO: CitySeed = {
  slug: 'antananarivo',
  nameFr: 'Antananarivo',
  nameMg: 'Antananarivo',
  lat: '-18.8792',
  lng: '47.5079',
  neighborhoods: [
    { slug: 'ankatso', nameFr: 'Ankatso', nameMg: 'Ankatso', lat: '-18.9135', lng: '47.5552' },
    { slug: 'ankaditapaka', nameFr: 'Ankaditapaka', nameMg: 'Ankaditapaka', lat: '-18.8918', lng: '47.5371' },
    { slug: 'mahamasina', nameFr: 'Mahamasina', nameMg: 'Mahamasina', lat: '-18.9152', lng: '47.5252' },
    { slug: 'anosy', nameFr: 'Anosy', nameMg: 'Anosy', lat: '-18.9134', lng: '47.5217' },
    { slug: 'ambohijatovo', nameFr: 'Ambohijatovo', nameMg: 'Ambohijatovo', lat: '-18.9059', lng: '47.5267' },
    { slug: 'ankorondrano', nameFr: 'Ankorondrano', nameMg: 'Ankorondrano', lat: '-18.8736', lng: '47.5226' },
    { slug: 'isoraka', nameFr: 'Isoraka', nameMg: 'Isoraka', lat: '-18.9099', lng: '47.5251' },
    { slug: 'ambondrona', nameFr: 'Ambondrona', nameMg: 'Ambondrona', lat: '-18.8857', lng: '47.5310' },
    { slug: 'analakely', nameFr: 'Analakely', nameMg: 'Analakely', lat: '-18.9091', lng: '47.5246' },
    { slug: 'tsaralalana', nameFr: 'Tsaralalàna', nameMg: 'Tsaralalàna', lat: '-18.9006', lng: '47.5226' },
  ],
}

const TOAMASINA: CitySeed = {
  slug: 'toamasina',
  nameFr: 'Toamasina',
  nameMg: 'Toamasina',
  lat: '-18.1492',
  lng: '49.4023',
  neighborhoods: [
    { slug: 'anjoma-toamasina', nameFr: 'Anjoma', nameMg: 'Anjoma', lat: '-18.1547', lng: '49.4015' },
    { slug: 'mangarivotra', nameFr: 'Mangarivotra', nameMg: 'Mangarivotra', lat: '-18.1604', lng: '49.4087' },
    { slug: 'ankirihiry', nameFr: 'Ankirihiry', nameMg: 'Ankirihiry', lat: '-18.1438', lng: '49.3946' },
    { slug: 'tanambao-v', nameFr: 'Tanambao V', nameMg: 'Tanambao V', lat: '-18.1395', lng: '49.4101' },
    { slug: 'ampasimazava', nameFr: 'Ampasimazava', nameMg: 'Ampasimazava', lat: '-18.1715', lng: '49.4032' },
    { slug: 'morarano-toamasina', nameFr: 'Morarano', nameMg: 'Morarano', lat: '-18.1352', lng: '49.4054' },
    { slug: 'bazar-be', nameFr: 'Bazar Be', nameMg: 'Bazar Be', lat: '-18.1487', lng: '49.4047' },
  ],
}

const MAHAJANGA: CitySeed = {
  slug: 'mahajanga',
  nameFr: 'Mahajanga',
  nameMg: 'Mahajanga',
  lat: '-15.7167',
  lng: '46.3167',
  neighborhoods: [
    { slug: 'mahajanga-be', nameFr: 'Mahajanga Be', nameMg: 'Mahajanga Be', lat: '-15.7204', lng: '46.3185' },
    { slug: 'mahabibo', nameFr: 'Mahabibo', nameMg: 'Mahabibo', lat: '-15.7245', lng: '46.3265' },
    { slug: 'aranta', nameFr: 'Aranta', nameMg: 'Aranta', lat: '-15.7172', lng: '46.3231' },
    { slug: 'antanimalandy', nameFr: 'Antanimalandy', nameMg: 'Antanimalandy', lat: '-15.7129', lng: '46.3140' },
    { slug: 'mahajanga-tsaramandroso', nameFr: 'Tsaramandroso', nameMg: 'Tsaramandroso', lat: '-15.7298', lng: '46.3320' },
    { slug: 'ambondrona-mahajanga', nameFr: 'Ambondrona', nameMg: 'Ambondrona', lat: '-15.7185', lng: '46.3289' },
  ],
}

const TOLIARA: CitySeed = {
  slug: 'toliara',
  nameFr: 'Toliara',
  nameMg: 'Toliara',
  lat: '-23.3500',
  lng: '43.6667',
  neighborhoods: [
    { slug: 'sanfily', nameFr: 'Sanfily', nameMg: 'Sanfily', lat: '-23.3441', lng: '43.6685' },
    { slug: 'mahavatse', nameFr: 'Mahavatse', nameMg: 'Mahavatse', lat: '-23.3578', lng: '43.6612' },
    { slug: 'tsimenatse', nameFr: 'Tsimenatse', nameMg: 'Tsimenatse', lat: '-23.3531', lng: '43.6701' },
    { slug: 'ankilibe', nameFr: 'Ankilibe', nameMg: 'Ankilibe', lat: '-23.3702', lng: '43.6480' },
    { slug: 'betania', nameFr: 'Betania', nameMg: 'Betania', lat: '-23.3415', lng: '43.6735' },
    { slug: 'andaboly', nameFr: 'Andaboly', nameMg: 'Andaboly', lat: '-23.3486', lng: '43.6634' },
  ],
}

export const CITY_SEEDS: CitySeed[] = [
  FIANARANTSOA,
  ANTANANARIVO,
  TOAMASINA,
  MAHAJANGA,
  TOLIARA,
]
