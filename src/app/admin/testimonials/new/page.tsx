import type { Metadata } from 'next'
import Link from 'next/link'
import { TestimonialForm } from '@/features/admin-testimonials'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'

export const metadata: Metadata = {
  title: 'Nouveau témoignage · Admin AryTrano',
  robots: { index: false, follow: false },
}

export default async function NewTestimonialPage() {
  const t = getT(await getLocale())
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
          {t('admin.testimonials.new.title')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('admin.testimonials.new.lead')}
        </p>
      </header>

      <TestimonialForm mode="create" />
    </div>
  )
}
