/**
 * Format an Ariary amount. Accepts string (Decimal from Prisma) or number.
 * Example: 250000 → "250 000 Ar"
 */
export function formatAriary(amount: string | number): string {
  const value = typeof amount === 'string' ? Number(amount) : amount
  if (!Number.isFinite(value)) return '— Ar'
  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
    useGrouping: true,
  }).format(value) + ' Ar'
}
