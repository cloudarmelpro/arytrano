import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth, ProfileForm } from '@/features/auth'
import { getProfile } from '@/features/auth/server'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'

export async function generateMetadata(): Promise<Metadata> {
  const t = getT(await getLocale())
  return { title: t('dashboard.profile.title') }
}

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user) redirect('/sign-in')
  const [profile, locale] = await Promise.all([
    getProfile(session.user.id),
    getLocale(),
  ])
  const t = getT(locale)

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
            {t('dashboard.profile.title')}
          </h1>
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-primary">
            {t(`role.${profile.role}` as const)}
          </span>
        </div>
        <p className="max-w-2xl text-sm text-muted-foreground">
          {t('dashboard.profile.lead')}
        </p>
      </header>

      <ProfileForm
        defaultValues={{
          email: profile.email,
          name: profile.name,
          phone: profile.phone,
          locale: profile.locale,
          image: profile.image,
        }}
      />
    </div>
  )
}
