import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import {
  auth,
  PasswordSection,
  OAuthConnectionsSection,
  DataExportSection,
  DeleteAccountSection,
  LoginEventsSection,
  NotificationsSection,
  TwoFactorSection,
  PendingDeletionBanner,
} from '@/features/auth'
import { prisma } from '@/lib/db'
import {
  listConnections,
  countAuthMethods,
  listLoginEvents,
  countActiveRecoveryCodes,
  isTotpEnabled,
} from '@/features/auth/server'
import { env } from '@/lib/env'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'

export async function generateMetadata(): Promise<Metadata> {
  const t = getT(await getLocale())
  return { title: t('settings.metaTitle') }
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect('/sign-in')

  const { reason } = await searchParams
  const userId = session.user.id
  const [connections, methods, loginEvents, locale, twofaEnabled, recoveryCount, userPrefs] =
    await Promise.all([
      listConnections(userId),
      countAuthMethods(userId),
      listLoginEvents(userId, 10),
      getLocale(),
      isTotpEnabled(userId),
      countActiveRecoveryCodes(userId),
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          contactNotificationsEnabled: true,
          role: true,
          deletionScheduledAt: true,
        },
      }),
    ])
  const t = getT(locale)
  const showNotificationsSection =
    userPrefs?.role === 'OWNER' || userPrefs?.role === 'ADMIN'

  const googleEnabled = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET)
  const facebookEnabled = Boolean(env.FACEBOOK_CLIENT_ID && env.FACEBOOK_CLIENT_SECRET)
  const canUnlink = methods > 1

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
          {t('settings.title')}
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">{t('settings.lead')}</p>
      </header>

      {userPrefs?.deletionScheduledAt && (
        <PendingDeletionBanner scheduledFor={userPrefs.deletionScheduledAt} />
      )}

      {reason === 'admin-2fa-required' && !twofaEnabled ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
        >
          <p className="font-semibold">
            La double authentification (2FA) est obligatoire pour accéder à l’admin.
          </p>
          <p className="mt-1 text-destructive/85">
            Active-la dans la section ci-dessous pour pouvoir revenir sur le panneau d’administration.
          </p>
        </div>
      ) : null}

      <Section
        title={t('settings.section.password.title')}
        description={t('settings.section.password.lead')}
      >
        <PasswordSection hasPassword={connections.hasPassword} />
      </Section>

      <Section
        title={t('settings.section.twofa.title')}
        description={t('settings.section.twofa.lead')}
      >
        <TwoFactorSection
          initialEnabled={twofaEnabled}
          activeRecoveryCodes={recoveryCount}
        />
      </Section>

      <Section
        title={t('settings.section.oauth.title')}
        description={t('settings.section.oauth.lead')}
      >
        {googleEnabled || facebookEnabled ? (
          <OAuthConnectionsSection
            googleEnabled={googleEnabled}
            facebookEnabled={facebookEnabled}
            linked={connections.oauth}
            canUnlink={canUnlink}
          />
        ) : (
          <p className="text-sm text-muted-foreground">{t('settings.oauthNotConfigured')}</p>
        )}
      </Section>

      {showNotificationsSection ? (
        <Section
          title={t('settings.section.notifications.title')}
          description={t('settings.section.notifications.lead')}
        >
          <NotificationsSection
            initialEnabled={userPrefs?.contactNotificationsEnabled ?? true}
          />
        </Section>
      ) : null}

      <Section
        title={t('settings.section.logins.title')}
        description={t('settings.section.logins.lead')}
      >
        <LoginEventsSection events={loginEvents} />
      </Section>

      <Section
        title={t('settings.section.data.title')}
        description={t('settings.section.data.lead')}
      >
        <DataExportSection />
      </Section>

      <Section
        title={t('settings.section.danger.title')}
        description={t('settings.section.danger.lead')}
        danger
      >
        <DeleteAccountSection />
      </Section>
    </div>
  )
}

/**
 * Borderless section — separated by spacing alone. The section title
 * is large enough (and bold) to anchor its content visually without
 * needing a card outline. `danger` flips the title to red.
 */
function Section({
  title,
  description,
  children,
  danger,
}: {
  title: string
  description?: string
  children: React.ReactNode
  danger?: boolean
}) {
  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h2
          className={`text-lg font-semibold ${
            danger ? 'text-destructive' : 'text-foreground'
          }`}
        >
          {title}
        </h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </header>
      {children}
    </section>
  )
}
