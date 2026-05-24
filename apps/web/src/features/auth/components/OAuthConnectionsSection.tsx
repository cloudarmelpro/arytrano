import { Badge } from '@/components/ui/badge'
import { linkProviderAction } from '../actions/link-oauth'
import { UnlinkOAuthButton } from './UnlinkOAuthButton'

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

export function OAuthConnectionsSection({
  googleEnabled,
  facebookEnabled,
  linked,
  canUnlink,
}: OAuthConnectionsProps) {
  return (
    <ul className="flex flex-col divide-y divide-border">
      {PROVIDERS.map((p) => {
        const enabled = p.id === 'google' ? googleEnabled : facebookEnabled
        if (!enabled) return null
        const isLinked = linked.some((l) => l.provider === p.id)
        return (
          <li key={p.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{p.label}</span>
              <Badge
                variant={isLinked ? 'secondary' : 'outline'}
                className="text-[10px] uppercase tracking-wider"
              >
                {isLinked ? 'Lié' : 'Non lié'}
              </Badge>
            </div>
            {isLinked ? (
              <UnlinkOAuthButton provider={p.id} canUnlink={canUnlink} />
            ) : (
              <form action={linkProviderAction.bind(null, p.id)}>
                <button
                  type="submit"
                  className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
                >
                  Lier
                </button>
              </form>
            )}
          </li>
        )
      })}
    </ul>
  )
}
