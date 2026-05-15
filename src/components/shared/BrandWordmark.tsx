import Link from 'next/link'
import { LogoMark } from './LogoMark'

/**
 * Brand wordmark for AryTrano — icon pill + bicolor type.
 *
 * Typography choice: "Ary" in neutral foreground + "Trano" in indigo.
 * "Trano" means "house" in Malagasy, so emphasising it visually
 * communicates the platform's purpose (housing) at first glance —
 * and pairs the typography with the indigo icon pill on the left.
 */
export function BrandWordmark({
  size = 'md',
  href = '/',
}: {
  size?: 'sm' | 'md' | 'lg'
  href?: string
}) {
  const boxSize =
    size === 'sm' ? 'h-7 w-7' : size === 'lg' ? 'h-10 w-10' : 'h-8 w-8'
  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 22 : 18
  const text = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-xl'
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2"
      aria-label="AryTrano — Accueil"
    >
      <span
        className={`${boxSize} inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground`}
      >
        <LogoMark size={iconSize} />
      </span>
      <span className={`${text} font-bold tracking-tight leading-none`}>
        <span className="text-foreground">Ary</span>
        <span className="text-primary">Trano</span>
      </span>
    </Link>
  )
}
