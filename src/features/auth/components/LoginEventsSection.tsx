import { Badge } from '@/components/ui/badge'
import type { LoginEventView } from '../services/list-login-events'

const METHOD_LABEL: Record<LoginEventView['authMethod'], string> = {
  CREDENTIALS: 'Email + mot de passe',
  GOOGLE: 'Google',
  FACEBOOK: 'Facebook',
  MAGIC_LINK: 'Lien magique (email)',
  MOBILE_JWT: 'App mobile',
}

function formatRelative(date: Date): string {
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000)
  if (diffSec < 60) return 'à l\'instant'
  if (diffSec < 3600) return `il y a ${Math.floor(diffSec / 60)} min`
  if (diffSec < 86400) return `il y a ${Math.floor(diffSec / 3600)} h`
  if (diffSec < 604800) return `il y a ${Math.floor(diffSec / 86400)} j`
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function deviceLabel(e: LoginEventView): string {
  if (e.isMobileApp) return 'App mobile AryTrano'
  const parts: string[] = []
  if (e.browser) parts.push(e.browser)
  if (e.os) parts.push(`sur ${e.os}`)
  if (parts.length === 0) return 'Appareil inconnu'
  return parts.join(' ')
}

export function LoginEventsSection({ events }: { events: LoginEventView[] }) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aucune connexion enregistrée pour l&apos;instant.
      </p>
    )
  }

  return (
    <ol className="flex flex-col divide-y divide-border">
      {events.map((e, i) => (
        <li
          key={e.id}
          className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
        >
          <div className="flex flex-col gap-1">
            <span className="flex flex-wrap items-center gap-2 text-sm font-medium text-foreground">
              {deviceLabel(e)}
              {i === 0 && (
                <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
                  Plus récent
                </Badge>
              )}
            </span>
            <span className="text-xs text-muted-foreground">
              {METHOD_LABEL[e.authMethod]} · {formatRelative(e.occurredAt)}
            </span>
          </div>
          <span className="whitespace-nowrap text-xs text-muted-foreground">
            {new Intl.DateTimeFormat('fr-FR', {
              dateStyle: 'short',
              timeStyle: 'short',
            }).format(e.occurredAt)}
          </span>
        </li>
      ))}
    </ol>
  )
}
