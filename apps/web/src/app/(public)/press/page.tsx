import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { env } from '@/lib/env'
import { ogDefaults } from '@/lib/seo/og-defaults'

export const metadata: Metadata = {
  title: 'Press kit',
  description:
    'Logos, captures, fiche presse et contact dédié pour les journalistes couvrant AryTrano — la plateforme de logement étudiant à Madagascar.',
  alternates: { canonical: '/press' },
  openGraph: {
    ...ogDefaults,
    title: 'Press kit',
    description:
      'Tout ce qu’il faut pour parler d’AryTrano : logos haute résolution, fiche presse, captures, contact direct.',
    type: 'website',
    url: '/press',
  },
}

const PHONE = `+${env.NEXT_PUBLIC_ARYTRANO_PHONE}`
const CONTACT_EMAIL = 'press@arytrano.com'

const FACTS = [
  { label: 'Lancement', value: '2026 — Fianarantsoa, Madagascar' },
  { label: 'Modèle', value: 'Marketplace + concierge gratuit pour les étudiants' },
  { label: 'Cible', value: 'Étudiants, universités, propriétaires bailleurs' },
  { label: 'Langues', value: 'Français · Malagasy' },
  { label: 'Paiement', value: 'GoalPay (Mobile Money MVola, Orange Money, Airtel Money)' },
  { label: 'Statut', value: 'Plateforme indépendante — pas une agence immobilière' },
]

const ASSETS = [
  {
    label: 'Logo SVG (vectoriel)',
    href: '/images/press/arytrano-logo.svg',
    size: 'SVG',
  },
  {
    label: 'Logo PNG (1024px)',
    href: '/images/press/arytrano-logo-1024.png',
    size: 'PNG',
  },
  {
    label: 'OpenGraph (1200×630)',
    href: '/images/arytrano.webp',
    size: 'WEBP',
  },
]

export default function PressPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <header className="flex flex-col gap-3">
        <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
          Press kit
        </span>
        <h1 className="text-[clamp(36px,4.4vw,56px)] font-normal leading-[1.05] tracking-[-0.022em] text-foreground">
          Parlez d’AryTrano
        </h1>
        <p className="max-w-2xl text-[16px] leading-[1.6] text-foreground/75">
          Ressources prêtes à l’emploi pour les journalistes et créateurs de
          contenu qui couvrent le logement étudiant à Madagascar. Si vous
          préparez un sujet, écrivez-nous — on revient sous 48h ouvrées.
        </p>
      </header>

      <section className="mt-12 flex flex-col gap-4">
        <h2 className="text-[18px] font-semibold text-foreground">En bref</h2>
        <dl className="grid gap-x-8 gap-y-3 rounded-lg border border-border bg-muted/30 p-5 sm:grid-cols-2">
          {FACTS.map((f) => (
            <div key={f.label}>
              <dt className="text-[11px] uppercase tracking-wide text-foreground/55">
                {f.label}
              </dt>
              <dd className="mt-0.5 text-[14px] text-foreground/85">{f.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-12 flex flex-col gap-4">
        <h2 className="text-[18px] font-semibold text-foreground">Pitch en 50 mots</h2>
        <p className="rounded-lg border border-border bg-background p-5 text-[15px] leading-[1.65] text-foreground/80">
          AryTrano connecte les étudiants de Madagascar à des logements
          vérifiés via un concierge humain et des outils numériques. Première
          ville couverte : Fianarantsoa, avec Antananarivo, Toamasina,
          Mahajanga et Toliara dans la feuille de route. Plateforme
          bilingue français/malagasy, paiements Mobile Money.
        </p>
      </section>

      <section className="mt-12 flex flex-col gap-4">
        <h2 className="text-[18px] font-semibold text-foreground">
          Logos &amp; visuels
        </h2>
        <p className="text-sm text-muted-foreground">
          Téléchargement direct — utilisez la version vectorielle dès que
          possible pour les supports imprimés. Pas de retouche du logo svp
          (proportions, couleurs, espace minimum).
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {ASSETS.map((a) => (
            <a
              key={a.href}
              href={a.href}
              download
              className="flex flex-col items-center gap-2 rounded-lg border border-border bg-background p-4 transition hover:border-primary hover:bg-primary/5"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </span>
              <div className="flex flex-col items-center text-center">
                <span className="text-sm font-medium text-foreground">{a.label}</span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {a.size}
                </span>
              </div>
            </a>
          ))}
        </div>
        {/* Brand preview — confirms the logo file actually renders. */}
        <figure className="mt-4 flex items-center gap-4 rounded-lg border border-border bg-background p-5">
          <Image
            src="/images/arytrano.png"
            alt="Aperçu du logo AryTrano"
            width={96}
            height={96}
            className="h-16 w-16 rounded-lg object-contain"
          />
          <figcaption className="text-xs text-muted-foreground">
            Espace minimum autour du logo = hauteur du A. Ne pas changer la
            couleur ni ajouter un effet (ombre, gradient).
          </figcaption>
        </figure>
      </section>

      <section className="mt-12 flex flex-col gap-4">
        <h2 className="text-[18px] font-semibold text-foreground">Contact presse</h2>
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-5 text-sm">
          <p>
            Email&nbsp;:{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">
              {CONTACT_EMAIL}
            </a>
          </p>
          <p>
            Téléphone / WhatsApp&nbsp;:{' '}
            <a href={`tel:${PHONE}`} className="text-primary hover:underline">
              {PHONE}
            </a>
          </p>
          <p className="text-foreground/65">
            Délai de réponse moyen&nbsp;: 48h ouvrées. Pour les sujets liés
            aux sources étudiants ou propriétaires, mentionnez-le dans
            l’email — on facilite la mise en relation après accord.
          </p>
        </div>
      </section>

      <section className="mt-12 flex flex-col gap-3">
        <h2 className="text-[18px] font-semibold text-foreground">Pour aller plus loin</h2>
        <ul className="flex flex-col gap-2 text-sm text-foreground/80">
          <li>
            ·{' '}
            <Link href="/comment-ca-marche" className="text-primary hover:underline">
              Comment ça marche
            </Link>{' '}
            — flow étudiant pas-à-pas
          </li>
          <li>
            ·{' '}
            <Link href="/proprietaires" className="text-primary hover:underline">
              Page propriétaires
            </Link>{' '}
            — proposition de valeur côté bailleur
          </li>
          <li>
            ·{' '}
            <Link href="/legal/mentions" className="text-primary hover:underline">
              Mentions légales
            </Link>{' '}
            — éditeur, hébergeur, contact
          </li>
        </ul>
      </section>
    </div>
  )
}
