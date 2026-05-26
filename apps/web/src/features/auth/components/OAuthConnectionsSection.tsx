import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'
import { linkProviderAction } from '../actions/link-oauth'
import { UnlinkOAuthButton } from './UnlinkOAuthButton'
import { OAUTH_ICONS } from './oauth-icons'

export type OAuthConnectionsProps = {
  googleEnabled: boolean
  facebookEnabled: boolean
  linked: Array<{ provider: string; providerAccountId: string }>
  canUnlink: boolean
}

const PROVIDERS: Array<{ id: 'google' | 'facebook'; label: string }> = [
  { id: 'google', label: 'Google' },
  { id: 'facebook', label: 'Facebook' },
]

export async function OAuthConnectionsSection({
  googleEnabled,
  facebookEnabled,
  linked,
  canUnlink,
}: OAuthConnectionsProps) {
  // A11Y-M5 audit fix — translate the "Lié / Non lié" status labels
  // and the "Lier" action label instead of hardcoded French.
  const t = getT(await getLocale())
  return (
    <ul className="flex flex-col divide-y divide-border">
      {PROVIDERS.map((p) => {
        const enabled = p.id === 'google' ? googleEnabled : facebookEnabled
        if (!enabled) return null
        const isLinked = linked.some((l) => l.provider === p.id)
        return (
          <li
            key={p.id}
            className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
          >
            <div className="flex items-center gap-3">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-background"
                aria-hidden
              >
                {OAUTH_ICONS[p.id]}
              </span>
              <span className="text-sm font-medium">{p.label}</span>
              <Badge
                variant={isLinked ? 'secondary' : 'outline'}
                className="text-[10px] uppercase tracking-wider"
              >
                {isLinked ? t('oauth.linked') : t('oauth.unlinked')}
              </Badge>
            </div>
            {isLinked ? (
              <UnlinkOAuthButton provider={p.id} canUnlink={canUnlink} />
            ) : (
              <form action={linkProviderAction.bind(null, p.id)}>
                <Button type="submit" size="sm">
                  {t('oauth.link')}
                </Button>
              </form>
            )}
          </li>
        )
      })}
    </ul>
  )
}
