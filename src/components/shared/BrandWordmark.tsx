import Link from 'next/link'

/**
 * Brand wordmark for AryTrano — indigo `AT` square logo + bicolor type.
 *
 * Uses the canonical SVG mark at `/logo/arytrano-mark.svg` (indigo on
 * white background). For dark/indigo surfaces, use the light variant
 * `/logo/arytrano-mark-light.svg` directly.
 */
export function BrandWordmark({
  size = 'md',
  href = '/',
  variant = 'default',
}: {
  size?: 'sm' | 'md' | 'lg'
  href?: string
  /** `light` swaps to the white-bg variant for use on indigo / dark surfaces. */
  variant?: 'default' | 'light'
}) {
  const px = size === 'sm' ? 28 : size === 'lg' ? 40 : 32
  const text = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-xl'
  const src =
    variant === 'light'
      ? '/logo/arytrano-mark-light.svg'
      : '/logo/arytrano-mark.svg'
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2"
      aria-label="AryTrano — Accueil"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        width={px}
        height={px}
        style={{ width: px, height: px }}
      />
      <span className={`${text} font-bold tracking-tight leading-none`}>
        <span className="text-foreground">Ary</span>
        <span className="text-primary">Trano</span>
      </span>
    </Link>
  )
}
