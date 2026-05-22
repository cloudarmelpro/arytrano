import type { Metadata } from 'next'
import Link from 'next/link'
import { listAdminTestimonials } from '@/features/admin-testimonials/server'
import type {
  StatusFilter,
  AdminTestimonialRow,
} from '@/features/admin-testimonials/server'
import { TestimonialActions } from '@/features/admin-testimonials'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'
import type { TestimonialAudience } from '@/features/admin-testimonials/schemas/testimonial'

export const metadata: Metadata = {
  title: 'Témoignages · Admin AryTrano',
  robots: { index: false, follow: false },
}

type SearchParams = Promise<{
  cursor?: string
  audience?: string
  status?: string
}>

function isAudience(v: string | undefined): v is TestimonialAudience {
  return v === 'STUDENT' || v === 'OWNER'
}
function isStatus(v: string | undefined): v is StatusFilter {
  return v === 'all' || v === 'published' || v === 'draft'
}

export default async function AdminTestimonialsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const [sp, locale] = await Promise.all([searchParams, getLocale()])
  const t = getT(locale)

  const audience = isAudience(sp.audience) ? sp.audience : undefined
  const status: StatusFilter = isStatus(sp.status) ? sp.status : 'all'

  const { items, nextCursor, hasMore } = await listAdminTestimonials({
    audience,
    status: status === 'all' ? undefined : status,
    cursor: sp.cursor,
  })

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-primary">
            {t('admin.testimonials.list.title')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('admin.testimonials.list.lead')}
          </p>
        </div>
        <Link
          href="/admin/testimonials/new"
          className="inline-flex h-10 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          {t('admin.testimonials.list.create')}
        </Link>
      </header>

      <FilterTabs
        currentAudience={audience}
        currentStatus={status}
        labels={{
          all: t('admin.testimonials.filter.audience.all'),
          owner: t('admin.testimonials.filter.audience.owner'),
          student: t('admin.testimonials.filter.audience.student'),
          statusAll: t('admin.testimonials.filter.status.all'),
          statusPublished: t('admin.testimonials.filter.status.published'),
          statusDraft: t('admin.testimonials.filter.status.draft'),
        }}
      />

      {items.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-muted/30 p-12 text-center text-sm text-muted-foreground">
          {t('admin.testimonials.list.empty')}
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-border rounded-md border border-border bg-card">
          {items.map((item) => (
            <li key={item.id}>
              <Row item={item} locale={locale} />
            </li>
          ))}
        </ul>
      )}

      {hasMore && nextCursor ? (
        <nav className="flex justify-center">
          <Link
            href={`/admin/testimonials?cursor=${nextCursor}${audience ? `&audience=${audience}` : ''}${status !== 'all' ? `&status=${status}` : ''}`}
            className="inline-flex h-10 items-center rounded-md border border-border bg-background px-5 text-sm font-medium transition hover:bg-muted"
          >
            {t('admin.testimonials.list.next')}
          </Link>
        </nav>
      ) : null}
    </div>
  )
}

function FilterTabs({
  currentAudience,
  currentStatus,
  labels,
}: {
  currentAudience: TestimonialAudience | undefined
  currentStatus: StatusFilter
  labels: {
    all: string
    owner: string
    student: string
    statusAll: string
    statusPublished: string
    statusDraft: string
  }
}) {
  const audienceOptions: Array<{
    label: string
    value: TestimonialAudience | undefined
  }> = [
    { label: labels.all, value: undefined },
    { label: labels.owner, value: 'OWNER' },
    { label: labels.student, value: 'STUDENT' },
  ]
  const statusOptions: Array<{ label: string; value: StatusFilter }> = [
    { label: labels.statusAll, value: 'all' },
    { label: labels.statusPublished, value: 'published' },
    { label: labels.statusDraft, value: 'draft' },
  ]
  return (
    <div className="flex flex-wrap gap-6">
      <div className="flex flex-wrap items-center gap-2">
        {audienceOptions.map((opt) => {
          const active = opt.value === currentAudience
          const href = `/admin/testimonials?${[
            opt.value ? `audience=${opt.value}` : '',
            currentStatus !== 'all' ? `status=${currentStatus}` : '',
          ]
            .filter(Boolean)
            .join('&')}`
          return (
            <Link
              key={opt.label}
              href={href || '/admin/testimonials'}
              aria-current={active ? 'page' : undefined}
              className={`inline-flex h-8 items-center rounded-md px-3 text-xs font-medium transition ${
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border text-foreground hover:bg-muted'
              }`}
            >
              {opt.label}
            </Link>
          )
        })}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {statusOptions.map((opt) => {
          const active = opt.value === currentStatus
          const href = `/admin/testimonials?${[
            currentAudience ? `audience=${currentAudience}` : '',
            opt.value !== 'all' ? `status=${opt.value}` : '',
          ]
            .filter(Boolean)
            .join('&')}`
          return (
            <Link
              key={opt.value}
              href={href || '/admin/testimonials'}
              aria-current={active ? 'page' : undefined}
              className={`inline-flex h-8 items-center rounded-md px-3 text-xs font-medium transition ${
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border text-foreground hover:bg-muted'
              }`}
            >
              {opt.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function Row({
  item,
  locale,
}: {
  item: AdminTestimonialRow
  locale: string
}) {
  const dateFmt = new Intl.DateTimeFormat(
    locale === 'mg' ? 'fr-FR' : 'fr-FR',
    { day: '2-digit', month: 'short', year: 'numeric' },
  )
  return (
    <article className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-start">
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex h-5 items-center rounded-full px-2 text-[10.5px] font-bold uppercase tracking-[0.08em] ${
              item.audience === 'OWNER'
                ? 'bg-primary/10 text-primary'
                : 'bg-emerald-50 text-emerald-700'
            }`}
          >
            {item.audience}
          </span>
          {item.publishedAt ? (
            <span className="inline-flex h-5 items-center rounded-full bg-emerald-50 px-2 text-[10.5px] font-bold uppercase tracking-[0.08em] text-emerald-700">
              ● Live
            </span>
          ) : (
            <span className="inline-flex h-5 items-center rounded-full bg-muted px-2 text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
              ○ Draft
            </span>
          )}
          <span className="text-[11px] font-mono text-muted-foreground">
            sort={item.sortOrder}
          </span>
        </div>
        <p className="line-clamp-3 text-[14.5px] leading-[1.55] text-foreground">
          &ldquo;{item.body}&rdquo;
        </p>
        <p className="mt-2 text-[12.5px] font-medium text-muted-foreground">
          — {item.authorName}
          {item.authorMeta ? ` · ${item.authorMeta}` : ''}
        </p>
        <p className="mt-1 text-[11.5px] text-muted-foreground/80">
          Créé le {dateFmt.format(item.createdAt)}
          {item.publishedAt
            ? ` · Publié le ${dateFmt.format(item.publishedAt)}`
            : ''}
        </p>
      </div>
      <TestimonialActions
        id={item.id}
        isPublished={item.publishedAt !== null}
      />
    </article>
  )
}
