/**
 * AryTrano logo mark — a stylized house silhouette with a steep apex
 * (echoing both the letter "A" of AryTrano AND the tall pitched roof
 * of a traditional Malagasy `trano gasy`), plus a small chimney for
 * character. Solid `currentColor` fill so the wrapper controls tone:
 * white on indigo for the brand pill, indigo on white on light
 * surfaces, etc.
 *
 * Drawn at 24×24 viewBox — scales pixel-perfect from a 16px favicon
 * to a 200px hero without any raster artefacts.
 */
export function LogoMark({
  size = 18,
  className,
}: {
  size?: number
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      {/* House silhouette — steep roof apex + walls with subtle eaves */}
      <path d="M 12 2 L 22.5 12.5 V 14 H 20 V 22 H 4 V 14 H 1.5 V 12.5 Z" />
      {/* Chimney on the right slope — adds character + reads as "house" */}
      <rect x="16.5" y="5.5" width="2" height="4" />
    </svg>
  )
}
