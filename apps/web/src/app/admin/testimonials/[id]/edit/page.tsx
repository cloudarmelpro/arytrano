import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdminTestimonialById } from '@/features/admin-testimonials/server'
import { TestimonialForm } from '@/features/admin-testimonials'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'

export const metadata: Metadata = {
  title: 'Éditer le témoignage · Admin AryTrano',
  robots: { index: false, follow: false },
}

type Params = Promise<{ id: string }>

export default async function EditTestimonialPage({
  params,
}: {
  params: Params
}) {
  const { id } = await params
  const [row, locale] = await Promise.all([
    getAdminTestimonialById(id),
    getLocale(),
  ])
  if (!row) notFound()
  const t = getT(locale)

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <Link
          href="/admin/testimonials"
          className="text-sm text-muted-foreground transition hover:text-foreground"
        >
          ← {t('admin.testimonials.list.backLink')}
        </Link>
        <h1 className="mt-2 text-3xl font-semibold text-primary">
          {t('admin.testimonials.edit.title')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('admin.testimonials.edit.lead')}
        </p>
      </header>

      <TestimonialForm mode="edit" initial={row} />
    </div>
  )
}
