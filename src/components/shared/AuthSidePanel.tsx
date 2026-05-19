import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'
import { Icon, type IconName } from './Icon'
import type { MessageKey } from '@/lib/i18n/messages'

const VALUES: Array<{
  icon: IconName
  title: MessageKey
  sub: MessageKey
}> = [
  {
    icon: 'shield',
    title: 'auth.panel.value1.title',
    sub: 'auth.panel.value1.sub',
  },
  {
    icon: 'whatsapp',
    title: 'auth.panel.value2.title',
    sub: 'auth.panel.value2.sub',
  },
  {
    icon: 'check',
    title: 'auth.panel.value3.title',
    sub: 'auth.panel.value3.sub',
  },
]

export async function AuthSidePanel() {
  const locale = await getLocale()
  const t = getT(locale)
  return (
    <aside className="relative hidden overflow-hidden rounded-3xl bg-primary p-8 text-white lg:block lg:p-10">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[20%] -top-[20%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,oklch(0.62_0.22_290_/_0.6)_0%,transparent_60%)]"
      />
      <div className="relative">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-white/90">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          {t('auth.panel.eyebrow')}
        </span>
        <h2 className="mt-5 font-serif text-[clamp(28px,2.6vw,40px)] font-normal leading-[1.1] tracking-[-0.02em]">
          {t('auth.panel.title')}
        </h2>

        <ul className="mt-7 flex flex-col gap-4">
          {VALUES.map((v) => (
            <li key={v.title} className="flex items-start gap-3">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
                <Icon name={v.icon} size={16} />
              </span>
              <div>
                <div className="text-[14.5px] font-semibold text-white">
                  {t(v.title)}
                </div>
                <div className="mt-0.5 text-[13px] font-medium text-white/75">
                  {t(v.sub)}
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-8 overflow-hidden rounded-2xl border border-white/15 bg-white/[0.07] backdrop-blur-sm">
          <div className="relative h-32 bg-[repeating-linear-gradient(135deg,oklch(0.62_0.18_290)_0_14px,oklch(0.58_0.18_290)_14px_28px)]">
            <span className="absolute left-3 top-3 inline-flex h-6 items-center gap-1 rounded-full bg-emerald-50/95 px-2.5 text-[11.5px] font-semibold text-emerald-700">
              <Icon name="shield" size={11} /> {t('auth.panel.teaser.badge')}
            </span>
          </div>
          <div className="p-4">
            <div className="text-[14px] font-semibold text-white">
              {t('auth.panel.teaser.title')}
            </div>
            <div className="mt-1 inline-flex items-center gap-1 text-[12px] font-medium text-white/75">
              <Icon name="pin" size={12} /> {t('auth.panel.teaser.location')}
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[15px] font-bold text-white">
                {t('auth.panel.teaser.price')}
                <span className="ml-0.5 text-[11.5px] font-medium text-white/70">
                  /mois
                </span>
              </span>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white text-primary">
                <Icon name="whatsapp" size={14} />
              </span>
            </div>
          </div>
        </div>

        <p className="mt-7 text-[12.5px] font-medium text-white/70">
          {t('auth.panel.proof')}
        </p>
      </div>
    </aside>
  )
}
