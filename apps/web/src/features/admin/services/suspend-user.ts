import 'server-only'
import { prisma } from '@/lib/db'
import { errors } from '@/lib/api/errors'
import { sendTransactionalEmail } from '@/lib/email/send-transactional'

/**
 * ADM-03 — flip a User row to SUSPENDED with an audit trail. The
 * existing session revocation is handled by the auth callback's
 * live status check (jwt callback re-reads status on every request).
 */
export async function suspendUser(input: {
  userId: string
  reason: string
  adminId: string
}): Promise<void> {
  if (input.reason.trim().length < 4) {
    throw errors.validation('Motif requis (4 caractères min)')
  }
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { id: true, status: true, email: true, name: true },
  })
  if (!user) throw errors.notFound('Utilisateur introuvable')
  if (user.status !== 'ACTIVE') {
    throw errors.conflict(`Compte ${user.status} — pas d’action possible.`)
  }

  await prisma.user.update({
    where: { id: input.userId },
    data: {
      status: 'SUSPENDED',
      suspendedReason: input.reason.trim().slice(0, 500),
      suspendedAt: new Date(),
      suspendedBy: input.adminId,
    },
  })

  // Best-effort email so the user knows what happened.
  try {
    await sendTransactionalEmail({
      recipientId: user.id,
      recipientEmail: user.email,
      eventType: 'account-suspended',
      subject: 'Ton compte AryTrano a été suspendu',
      html: `<!doctype html><html lang="fr"><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111;">
  <div style="max-width:520px;margin:24px auto;padding:24px;border:1px solid #eee;border-radius:8px;">
    <h1 style="font-size:18px;margin:0 0 12px;">Ton compte a été suspendu</h1>
    <p style="color:#333;font-size:14.5px;line-height:1.55;">
      Un administrateur a suspendu ton compte AryTrano pour la raison
      suivante :
    </p>
    <blockquote style="border-left:3px solid #e00;padding:8px 12px;background:#fff3f2;color:#7a0000;font-style:italic;margin:12px 0;">
      ${escapeHtml(input.reason)}
    </blockquote>
    <p style="color:#333;font-size:14.5px;line-height:1.55;">
      Si tu penses que c’est une erreur, réponds à cet email pour
      contester. La réactivation est manuelle.
    </p>
  </div>
</body></html>`,
      text: `Ton compte AryTrano a été suspendu.\n\nRaison : ${input.reason}\n\nSi tu penses que c'est une erreur, réponds à cet email.`,
    })
  } catch {
    /* swallow */
  }
}

/**
 * ADM-03 — reverse the suspension. Clears the reason so a re-suspension
 * captures a fresh one.
 */
export async function reinstateUser(input: {
  userId: string
  adminId: string
}): Promise<void> {
  const result = await prisma.user.updateMany({
    where: { id: input.userId, status: 'SUSPENDED' },
    data: {
      status: 'ACTIVE',
      suspendedReason: null,
      suspendedAt: null,
      suspendedBy: null,
    },
  })
  if (result.count === 0) {
    throw errors.notFound('Aucun compte suspendu à réactiver.')
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[c]!)
}
