import Link from 'next/link'
import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm'

export const metadata = { title: 'Nouveau mot de passe' }

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  if (!token) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-3xl text-primary">Lien invalide</h1>
        <p className="text-sm text-muted-foreground">
          Aucun token de réinitialisation trouvé dans l&apos;URL.
        </p>
        <Link href="/forgot-password" className="font-medium text-primary underline">
          Demander un nouveau lien
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-stretch gap-8">
      <header className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-4xl text-primary">Définir un nouveau mot de passe</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Le lien est valable encore 1 heure. Choisissez un mot de passe que vous n&apos;utilisez nulle part ailleurs.
        </p>
      </header>

      <ResetPasswordForm token={token} />
    </div>
  )
}
