import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sécurité — divulgation responsable',
  description:
    'Comment signaler une vulnérabilité de sécurité sur AryTrano. Politique de divulgation responsable, scope, et SLA de réponse.',
  alternates: { canonical: '/security' },
}

/**
 * SEC-20 — public-facing responsible disclosure policy. Linked from
 * `.well-known/security.txt` and from the Footer.
 *
 * Keeps it short and actionable : a security researcher should
 * have a clear contact + scope + expectation in <60 seconds.
 */
export default function SecurityPolicyPage() {
  return (
    <main className="mx-auto max-w-[760px] px-6 py-16 lg:px-10 lg:py-20">
      <header className="mb-10">
        <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
          Sécurité
        </span>
        <h1 className="mt-3 text-[clamp(28px,3vw,40px)] font-normal leading-[1.05] tracking-[-0.025em] text-foreground">
          Divulgation responsable de vulnérabilités
        </h1>
        <p className="mt-3 text-[15px] leading-[1.6] text-foreground/70">
          Si tu as trouvé une faille de sécurité dans AryTrano, on veut
          la corriger vite — sans représailles pour toi.
        </p>
      </header>

      <section className="flex flex-col gap-8 text-[15px] leading-[1.7] text-foreground/85">
        <div>
          <h2 className="mb-2 text-[18px] font-bold text-foreground">
            Comment nous contacter
          </h2>
          <p>
            Envoie un email à{' '}
            <a
              href="mailto:security@arytrano.com"
              className="font-mono font-semibold text-primary underline-offset-2 hover:underline"
            >
              security@arytrano.com
            </a>
            . Si la vulnérabilité est sensible, chiffre ton message avec
            notre clé PGP (empreinte ci-dessous). On accuse réception sous
            48 heures ouvrées.
          </p>
        </div>

        <div>
          <h2 className="mb-2 text-[18px] font-bold text-foreground">
            Périmètre (scope)
          </h2>
          <p className="mb-2">Le programme couvre :</p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>arytrano.com et tous ses sous-domaines</li>
            <li>L&apos;application mobile AryTrano (iOS + Android)</li>
            <li>
              L&apos;API publique sous{' '}
              <code className="font-mono text-[13.5px]">/api/v1/</code>
            </li>
          </ul>
          <p className="mt-3 mb-2">Sont hors scope :</p>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>
              Phishing, ingénierie sociale, attaques physiques sur les
              bureaux
            </li>
            <li>DDoS volumétriques</li>
            <li>
              Issues sur des intégrations tierces (Cloudinary, Twilio,
              GoalPay) — à signaler à ces vendors directement
            </li>
            <li>
              Manques d&apos;en-têtes « best-practice » sans démonstration
              d&apos;impact réel
            </li>
          </ul>
        </div>

        <div>
          <h2 className="mb-2 text-[18px] font-bold text-foreground">
            Ce qu&apos;on attend de toi
          </h2>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>
              Donne-nous le temps de corriger avant publication (90 jours
              minimum).
            </li>
            <li>
              N&apos;exfiltre pas de données utilisateurs au-delà du
              minimum pour démontrer la faille.
            </li>
            <li>Ne dégrade pas le service (DDoS, brute force massif).</li>
            <li>
              Reste sur ton propre compte de test — pas d&apos;accès aux
              comptes des autres.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="mb-2 text-[18px] font-bold text-foreground">
            Ce qu&apos;on s&apos;engage à faire
          </h2>
          <ul className="ml-5 list-disc space-y-1.5">
            <li>Accusé de réception sous 48h ouvrées.</li>
            <li>Première analyse + niveau de sévérité sous 7 jours.</li>
            <li>Pas de poursuites tant que tu respectes ce périmètre.</li>
            <li>Crédit dans notre hall of fame (sur demande).</li>
            <li>
              Pour les findings critiques, on étudie un bug bounty
              monétaire au cas par cas.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="mb-2 text-[18px] font-bold text-foreground">
            Clé PGP
          </h2>
          <p>
            Clé publique disponible sur demande à{' '}
            <a
              href="mailto:security@arytrano.com"
              className="font-mono text-primary"
            >
              security@arytrano.com
            </a>
            . Empreinte SHA-256 publiée ici dès qu&apos;une clé sera
            générée.
          </p>
        </div>

        <p className="text-[13px] text-foreground/60">
          Cette politique évolue. Version 1.0 — 2026-06-28.
        </p>
      </section>
    </main>
  )
}
