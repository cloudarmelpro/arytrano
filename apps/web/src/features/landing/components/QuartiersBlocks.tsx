import Image from 'next/image'
import Link from 'next/link'
import type { Locale } from '@/lib/i18n/config'
import { getT, type Translator } from '@/lib/i18n/translate'
import { formatAriary } from '@/lib/format/currency'
import type {
  QuartierRow,
  QuartierSampleListing,
} from '../queries/get-quartiers-data'
import {
  QUARTIER_DESCRIPTORS,
  type QuartierFullDescriptor,
} from '../quartier-descriptors'

type Tone = 'warm' | 'olive' | 'terracotta' | 'indigo'

const TONE_BG: Record<Tone, string> = {
  warm: 'bg-[repeating-linear-gradient(135deg,oklch(0.88_0.04_70)_0_14px,oklch(0.91_0.025_70)_14px_28px)]',
  olive:
    'bg-[repeating-linear-gradient(135deg,oklch(0.83_0.07_130)_0_14px,oklch(0.86_0.05_130)_14px_28px)]',
  terracotta:
    'bg-[repeating-linear-gradient(135deg,oklch(0.78_0.10_45)_0_14px,oklch(0.81_0.08_45)_14px_28px)]',
  indigo:
    'bg-[repeating-linear-gradient(135deg,oklch(0.72_0.10_277)_0_14px,oklch(0.78_0.08_277)_14px_28px)]',
}

const TONE_BADGE_FG: Record<Tone, string> = {
  warm: 'text-amber-900',
  olive: 'text-lime-900',
  terracotta: 'text-orange-900',
  indigo: 'text-primary',
}

const TONES_BY_INDEX: Tone[] = [
  'warm',
  'olive',
  'terracotta',
  'indigo',
  'warm',
  'olive',
  'terracotta',
  'indigo',
]


export function QuartiersBlocks({
  locale,
  quartiers,
}: {
  locale: Locale
  quartiers: QuartierRow[]
}) {
  const t = getT(locale)
  return (
    <section className="bg-background pb-24">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="flex flex-col gap-12">
          {quartiers.map((q, i) => {
            // E-T07 Batch B2 — render the block when EITHER source has
            // copy : DB-hydrated `editorial` OR the legacy TS descriptor.
            // Skip only when neither side has content (typical for a
            // brand-new quartier seeded without any editorial yet).
            const descriptor = QUARTIER_DESCRIPTORS[q.slug]
            if (!descriptor && !q.editorial) return null
            return (
              <QuartierBlock
                key={q.slug}
                t={t}
                locale={locale}
                quartier={q}
                descriptor={descriptor ?? null}
                tone={TONES_BY_INDEX[i % TONES_BY_INDEX.length] ?? 'warm'}
                reverse={i % 2 === 1}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}

function QuartierBlock({
  t,
  locale,
  quartier,
  descriptor,
  tone,
  reverse,
}: {
  t: Translator
  locale: Locale
  quartier: QuartierRow
  /** Optional now — DB editorial supersedes when present. */
  descriptor: QuartierFullDescriptor | null
  tone: Tone
  reverse: boolean
}) {
  const name = locale === 'mg' ? quartier.nameMg : quartier.nameFr
  const heroPhoto = quartier.sampleListings[0]?.photo ?? null
  // E-T07 Batch B2 — prefer DB-driven copy when the row has been
  // hydrated; fall back to the legacy TS dictionary keys for rows
  // still on the v0.5 pipeline (the 4 new cities pre-admin CRUD).
  // Empty string if neither side has the field — caller already
  // filters out rows where both descriptor + editorial are null.
  const dbLocale =
    locale === 'mg' ? quartier.editorial?.mg : quartier.editorial?.fr
  const ambianceText =
    dbLocale?.ambiance ?? (descriptor ? t(descriptor.ambiance) : '')
  const distanceText =
    dbLocale?.distance ?? (descriptor ? t(descriptor.distance) : '')
  const walkText = dbLocale?.walk ?? (descriptor ? t(descriptor.walk) : '')
  const transportText =
    dbLocale?.transport ?? (descriptor ? t(descriptor.transport) : '')
  return (
    <article
      id={quartier.slug}
      className="grid scroll-mt-20 items-start gap-12 lg:grid-cols-[1fr_1.2fr]"
    >
      <div
        className={`relative overflow-hidden rounded-[20px] aspect-[4/5] max-lg:aspect-[16/10] ${
          heroPhoto ? 'bg-muted' : TONE_BG[tone]
        } ${reverse ? 'lg:order-2' : ''}`}
      >
        {heroPhoto ? (
          <Image
            src={heroPhoto.url}
            alt={heroPhoto.altFr ?? name}
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover"
            placeholder={heroPhoto.blurhash ? 'blur' : 'empty'}
            blurDataURL={heroPhoto.blurhash ?? undefined}
          />
        ) : null}
        {heroPhoto ? (
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent"
          />
        ) : null}
        <span className="absolute left-4 top-4">
          <span
            className={`inline-flex h-6 items-center gap-1.5 rounded-full bg-white/90 px-2.5 text-[11.5px] font-semibold backdrop-blur-sm ${
              heroPhoto ? 'text-foreground' : TONE_BADGE_FG[tone]
            }`}
          >
            {quartier.publishedListings}{' '}
            {t(
              quartier.publishedListings <= 1
                ? 'quartiers.block.dataCell.listings.value.one'
                : 'quartiers.block.dataCell.listings.value.other',
              { count: quartier.publishedListings },
            ).replace(/^\d+\s*/, '')}
          </span>
        </span>
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <h2 className="m-0 text-[clamp(28px,3vw,40px)] font-normal leading-[1.05] tracking-[-0.018em] text-foreground">
            <Link
              // Detail landing lives under the city hub (E-T11) — has
              // reviews, favorites awareness, Place schema, etc.
              href={`/villes/${quartier.citySlug}/quartiers/${quartier.slug}`}
              className="transition hover:text-primary"
            >
              {name}
            </Link>
          </h2>
          <p className="mt-3.5 text-[16px] leading-[1.55] text-foreground/70">
            {ambianceText}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 max-sm:grid-cols-2">
          <DataCell
            label={t('quartiers.block.dataCell.avgPrice')}
            value={
              quartier.avgPriceMGA
                ? formatAriary(quartier.avgPriceMGA)
                : t('quartiers.block.dataCell.avgPrice.noData')
            }
            sub={
              quartier.avgPriceMGA
                ? t('quartiers.block.dataCell.avgPrice.sub')
                : null
            }
          />
          <DataCell
            label={t('quartiers.block.dataCell.distance')}
            value={distanceText}
          />
          <DataCell
            label={t('quartiers.block.dataCell.listings')}
            value={t(
              quartier.publishedListings <= 1
                ? 'quartiers.block.dataCell.listings.value.one'
                : 'quartiers.block.dataCell.listings.value.other',
              { count: quartier.publishedListings },
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-6 max-sm:grid-cols-1 max-sm:gap-4">
          <Poi label={t('quartiers.block.poi.walk')} body={walkText} />
          <Poi
            label={t('quartiers.block.poi.transport')}
            body={transportText}
          />
        </div>

        <div className="border-t border-border pt-5">
          <div className="mb-3.5 flex items-baseline justify-between">
            <span className="text-[13px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              {t('quartiers.block.sample.label')}
            </span>
            <Link
              // Always scope by city — neighborhood slugs are unique
              // PER city (e.g. "anjoma" exists in Fianarantsoa AND
              // Toamasina), so a bare ?neighborhood= would surface
              // wrong-city results in E-T07 multi-ville mode.
              href={`/annonces?city=${quartier.citySlug}&neighborhood=${quartier.slug}`}
              className="text-[13.5px] font-semibold text-primary transition hover:text-primary/80 hover:underline"
            >
              {t(
                quartier.publishedListings <= 1
                  ? 'quartiers.block.sample.viewAll.one'
                  : 'quartiers.block.sample.viewAll.other',
                { count: quartier.publishedListings },
              )}{' '}
              →
            </Link>
          </div>
          {quartier.sampleListings.length === 0 ? (
            <p className="rounded-xl bg-muted/60 px-4 py-5 text-center text-[13px] text-muted-foreground">
              {t('quartiers.block.sample.empty')}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
              {quartier.sampleListings.map((l) => (
                <MiniCard key={l.id} listing={l} t={t} citySlug={quartier.citySlug} quartierSlug={quartier.slug} />
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

function DataCell({
  label,
  value,
  sub,
}: {
  label: string
  value: string
  sub?: string | null
}) {
  return (
    <div className="rounded-[10px] bg-muted/60 px-4 py-3.5">
      <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1.5 text-[18px] font-bold tracking-[-0.015em] text-foreground">
        {value}
        {sub ? (
          <span className="text-[13px] font-medium text-muted-foreground">
            {sub}
          </span>
        ) : null}
      </div>
    </div>
  )
}

function Poi({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        <PinIcon />
        {label}
      </div>
      <div className="text-[14px] leading-[1.5] text-foreground">{body}</div>
    </div>
  )
}

function MiniCard({
  listing,
  t,
  citySlug,
  quartierSlug,
}: {
  listing: QuartierSampleListing
  t: Translator
  citySlug: string
  quartierSlug: string
}) {
  const typeLabel = t(`listing.type.${listing.type}` as const)
  return (
    <Link
      href={`/${citySlug}/${quartierSlug}/${listing.slug}`}
      className="flex gap-3 rounded-xl bg-muted/60 p-2.5 transition hover:-translate-y-px hover:bg-muted/80"
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
        {listing.photo ? (
          <Image
            src={listing.photo.url}
            alt={listing.photo.altFr ?? listing.title}
            fill
            sizes="64px"
            className="object-cover"
            placeholder={listing.photo.blurhash ? 'blur' : 'empty'}
            blurDataURL={listing.photo.blurhash ?? undefined}
          />
        ) : null}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[13.5px] font-semibold text-foreground">
          {listing.title}
        </span>
        <span className="text-[12px] text-muted-foreground">{typeLabel}</span>
        <span className="mt-0.5 text-[13.5px] font-bold text-foreground">
          {formatAriary(listing.priceMonthlyMGA)}
        </span>
      </div>
    </Link>
  )
}

function PinIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 10c0 7-8 12-8 12s-8-5-8-12a8 8 0 0 1 16 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}
