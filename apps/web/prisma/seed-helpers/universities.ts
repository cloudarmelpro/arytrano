/**
 * TEN-11 — seed list of universities used by the "Search near campus"
 * filter. Coordinates are the public-facing main entrance / admin
 * building from OpenStreetMap. Ten institutions cover the launch
 * cities; more can be added later through the admin without code.
 */

export type UniversitySeed = {
  slug: string
  citySlug: string
  nameFr: string
  acronym: string
  lat: number
  lng: number
  address: string | null
}

export const UNIVERSITY_SEEDS: UniversitySeed[] = [
  // --- Fianarantsoa (launch city) ----------------------------------
  {
    slug: 'ua-fianarantsoa',
    citySlug: 'fianarantsoa',
    nameFr: 'Université d’Antananarivo — Campus Fianarantsoa',
    acronym: 'UA-FNR',
    lat: -21.4448,
    lng: 47.0856,
    address: 'Campus Andrainjato, Fianarantsoa',
  },
  {
    slug: 'ipt-fianar',
    citySlug: 'fianarantsoa',
    nameFr: 'Institut Polytechnique Technologique de Fianarantsoa',
    acronym: 'IPT',
    lat: -21.4524,
    lng: 47.0794,
    address: 'Avenue de l’Université, Fianarantsoa',
  },
  {
    slug: 'iss-fianar',
    citySlug: 'fianarantsoa',
    nameFr: 'Institut Supérieur de Sciences — Fianarantsoa',
    acronym: 'ISS',
    lat: -21.456,
    lng: 47.082,
    address: 'Andrainjato, Fianarantsoa',
  },

  // --- Antananarivo (Q1 expansion city) ----------------------------
  {
    slug: 'ua-ankatso',
    citySlug: 'antananarivo',
    nameFr: 'Université d’Antananarivo — Campus Ankatso',
    acronym: 'UA',
    lat: -18.9189,
    lng: 47.5476,
    address: 'Campus Ankatso, Antananarivo',
  },
  {
    slug: 'inscae',
    citySlug: 'antananarivo',
    nameFr: 'Institut National des Sciences Comptables et de l’Administration d’Entreprise',
    acronym: 'INSCAE',
    lat: -18.8896,
    lng: 47.5237,
    address: 'Antaninandro, Antananarivo',
  },
  {
    slug: 'ipnt',
    citySlug: 'antananarivo',
    nameFr: 'Institut Polytechnique National des Télécommunications',
    acronym: 'IPNT',
    lat: -18.9133,
    lng: 47.5219,
    address: 'Ankorondrano, Antananarivo',
  },
  {
    slug: 'esti',
    citySlug: 'antananarivo',
    nameFr: 'École Supérieure des Technologies de l’Information',
    acronym: 'ESTI',
    lat: -18.9011,
    lng: 47.5267,
    address: 'Ankadifotsy, Antananarivo',
  },

  // --- Toamasina ---------------------------------------------------
  {
    slug: 'ut-toamasina',
    citySlug: 'toamasina',
    nameFr: 'Université de Toamasina',
    acronym: 'UT',
    lat: -18.156,
    lng: 49.402,
    address: 'Barikadimy, Toamasina',
  },

  // --- Mahajanga ---------------------------------------------------
  {
    slug: 'um-mahajanga',
    citySlug: 'mahajanga',
    nameFr: 'Université de Mahajanga',
    acronym: 'UM',
    lat: -15.722,
    lng: 46.319,
    address: 'Ambondrona, Mahajanga',
  },

  // --- Toliara -----------------------------------------------------
  {
    slug: 'ut-toliara',
    citySlug: 'toliara',
    nameFr: 'Université de Toliara',
    acronym: 'UTo',
    lat: -23.355,
    lng: 43.671,
    address: 'Maninday, Toliara',
  },
]
