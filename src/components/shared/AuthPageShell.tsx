import type { ReactNode } from 'react'
import Link from 'next/link'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'
import type { MessageKey } from '@/lib/i18n/messages'
import { Icon } from './Icon'

type Variant = 'signin' | 'signup' | 'forgot'

const COPY: Record<Variant, { eyebrow: MessageKey; h1: MessageKey; sub: MessageKey }> = {
  signin: {
    eyebrow: 'auth.eyebrow.signin',
    h1: 'auth.h1.signin',
    sub: 'auth.sub.signin',
  },
  signup: {
    eyebrow: 'auth.eyebrow.signup',
    h1: 'auth.h1.signup',
    sub: 'auth.sub.signup',
  },
  forgot: {
    eyebrow: 'auth.eyebrow.forgot',
    h1: 'auth.h1.forgot',
    sub: 'auth.sub.forgot',
  },
}

export async function AuthPageShell({
  variant,
  children,
  footer,
}: {
  variant: Variant
  children: ReactNode
  footer?: ReactNode
}) {
  const locale = await getLocale()
  const t = getT(locale)
  const copy = COPY[variant]

  return (
    <div className="flex flex-col">
      <Link
        href="/"
        className="mb-10 inline-flex w-fit items-center gap-2 text-[13px] font-medium text-muted-foreground transition hover:text-foreground"
      >
        <span aria-hidden className="inline-block -scale-x-100">
          <Icon name="arrow-right" size={14} />
        </span>
        {t('auth.back.home')}
      </Link>

      <header className="mb-9 flex flex-col">
        <span className="text-[12px] font-semibold uppercase tracking-[0.18em] text-primary">
          {t(copy.eyebrow)}
        </span>
        <h1 className="mt-4 font-serif text-[clamp(32px,3.8vw,48px)] font-normal leading-[1.05] tracking-[-0.02em] text-foreground text-balance">
          {t(copy.h1)}
        </h1>
        <p className="mt-4 max-w-[420px] text-[15.5px] leading-[1.55] text-foreground/70">
          {t(copy.sub)}
        </p>
      </header>

      <div className="flex flex-col gap-7">{children}</div>

      {footer && (
        <p className="mt-7 text-[14px] font-medium text-foreground/70">{footer}</p>
      )}
    </div>
  )
}

export function AuthAltLink({
  prompt,
  linkLabel,
  href,
}: {
  prompt: string
  linkLabel: string
  href: string
}) {
  return (
    <>
      {prompt}{' '}
      <Link
        href={href}
        className="font-semibold text-primary underline decoration-[1.5px] underline-offset-4 transition hover:opacity-80"
      >
        {linkLabel}
      </Link>
    </>
  )
}
