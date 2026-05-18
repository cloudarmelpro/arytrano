import type { Metadata } from 'next'
import { listCinQueue } from '@/features/admin/queries/list-cin-queue'
import { CinReviewRow } from '@/features/admin/components/CinReviewRow'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'

export async function generateMetadata(): Promise<Metadata> {
  const t = getT(await getLocale())
  return { title: t('admin.cin.title') }
}

export default async function AdminOwnerVerificationsPage() {
  const [items, locale] = await Promise.all([listCinQueue(), getLocale()])
  const t = getT(locale)

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
          {t('admin.cin.title')}
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          {t('admin.cin.lead')}
        </p>
      </header>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center">
          <p className="text-base font-medium">{t('admin.cin.empty.title')}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('admin.cin.empty.lead')}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {items.map((row) => (
            <CinReviewRow
              key={row.userId}
              ownerId={row.userId}
              email={row.email}
              name={row.name}
              phone={row.phone}
              submittedAt={row.submittedAt}
              mimeType={row.mimeType}
            />
          ))}
        </ul>
      )}

      <p className="max-w-2xl rounded-md bg-muted/40 p-4 text-xs text-muted-foreground">
        {t('admin.cin.legal.notice')}
      </p>
    </div>
  )
}
