import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/features/auth'
import { getCinStatus } from '@/features/auth/services/submit-cin'
import { CinUploadForm } from '@/features/auth/components/CinUploadForm'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'

export async function generateMetadata(): Promise<Metadata> {
  const t = getT(await getLocale())
  return { title: t('verifyOwner.title') }
}

export default async function VerifyOwnerPage() {
  const session = await auth()
  if (!session?.user) redirect('/sign-in')
  // Reserved for owners + admins — students don't need this.
  if (session.user.role === 'STUDENT') redirect('/dashboard')

  const [status, locale] = await Promise.all([
    getCinStatus(session.user.id),
    getLocale(),
  ])
  const t = getT(locale)

  // Serialize Date instances → ISO strings for the Client Component.
  const banner =
    status.state === 'pending'
      ? { state: status.state, submittedAt: status.submittedAt.toISOString() }
      : status.state === 'verified'
        ? { state: status.state, verifiedAt: status.verifiedAt.toISOString() }
        : status.state === 'rejected'
          ? {
              state: status.state,
              rejectedAt: status.rejectedAt.toISOString(),
              reason: status.reason,
            }
          : { state: 'none' as const }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
          {t('verifyOwner.title')}
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          {t('verifyOwner.lead')}
        </p>
      </header>

      <CinUploadForm status={banner} />

      <p className="max-w-2xl rounded-md bg-muted/40 p-4 text-xs text-muted-foreground">
        {t('verifyOwner.legal.notice')}
      </p>
    </div>
  )
}
