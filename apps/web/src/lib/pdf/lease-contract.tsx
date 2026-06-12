import 'server-only'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'

/**
 * E-T27.1 — lease contract PDF template.
 *
 * This is a v1 template — operator-vetted French legal language
 * inspired by typical Madagascar residential lease forms. A qualified
 * Madagascar real-estate lawyer should review before launch. Until
 * then the PDF carries an explicit "draft template" footer disclaimer.
 *
 * Styling : intentionally simple — single column, monospaced numbers
 * for amounts, generous spacing for legibility on a phone screen.
 * Avoid web fonts that may not render across viewers — fall back to
 * `Helvetica` (built into @react-pdf/renderer).
 */

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.45,
    color: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 12,
    borderBottom: '1pt solid #CBD5E1',
    marginBottom: 18,
  },
  brand: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#4338CA',
  },
  brandSub: { fontSize: 8, color: '#64748B', marginTop: 2 },
  refBlock: { alignItems: 'flex-end' },
  refLabel: {
    fontSize: 7,
    color: '#64748B',
    letterSpacing: 1.2,
  },
  refValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
  },
  title: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 9,
    textAlign: 'center',
    color: '#64748B',
    marginBottom: 18,
  },
  sectionHeading: {
    marginTop: 14,
    marginBottom: 6,
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: '#1E293B',
  },
  partyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  partyCard: {
    width: '47%',
    padding: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
  },
  partyLabel: {
    fontSize: 7,
    color: '#64748B',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  partyName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    marginBottom: 2,
  },
  partyContact: { fontSize: 9, color: '#475569' },
  termsTable: {
    borderTop: '1pt solid #E2E8F0',
    marginTop: 4,
  },
  termsRow: {
    flexDirection: 'row',
    borderBottom: '1pt solid #E2E8F0',
    paddingVertical: 6,
  },
  termsLabel: {
    width: '40%',
    fontSize: 9,
    color: '#475569',
  },
  termsValue: {
    width: '60%',
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
  },
  para: { marginBottom: 6, textAlign: 'justify' },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
  },
  signatureBox: {
    width: '46%',
    borderTop: '1pt solid #0F172A',
    paddingTop: 6,
  },
  signatureLabel: { fontSize: 8, color: '#64748B', marginBottom: 2 },
  signatureName: { fontFamily: 'Helvetica-Bold', fontSize: 10 },
  signatureDate: { fontSize: 8, color: '#475569', marginTop: 2 },
  footer: {
    position: 'absolute',
    bottom: 28,
    left: 48,
    right: 48,
    paddingTop: 6,
    borderTop: '1pt solid #E2E8F0',
    fontSize: 7,
    color: '#94A3B8',
    textAlign: 'center',
  },
})

export type LeaseContractInput = {
  leaseId: string
  /** Last 6 chars of cuid — visible reference shown on the header. */
  refShort: string
  owner: {
    name: string
    email: string
    phone: string | null
  }
  tenant: {
    name: string
    email: string
    phone: string | null
  }
  listing: {
    title: string
    address: string // "<Neighborhood>, <City>"
  }
  monthlyRentMGA: number
  cautionMGA: number
  platformFeeMGA: number
  durationMonths: number
  startDate: Date
  ownerSignedAt: Date | null
  tenantSignedAt: Date | null
  /** When the PDF was rendered — printed in the footer. */
  generatedAt: Date
}

function formatMga(n: number): string {
  return new Intl.NumberFormat('fr-FR').format(n) + ' Ar'
}

function formatDate(d: Date | null): string {
  if (!d) return '—'
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(d)
}

export function LeaseContractDocument(input: LeaseContractInput) {
  const endDate = new Date(input.startDate)
  endDate.setMonth(endDate.getMonth() + input.durationMonths)

  return (
    <Document
      title={`Bail AryTrano ${input.refShort}`}
      author="AryTrano"
      subject={`Contrat de bail — ${input.listing.title}`}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>AryTrano</Text>
            <Text style={styles.brandSub}>arytrano.com — concierge logement étudiant</Text>
          </View>
          <View style={styles.refBlock}>
            <Text style={styles.refLabel}>RÉFÉRENCE BAIL</Text>
            <Text style={styles.refValue}>#{input.refShort.toUpperCase()}</Text>
          </View>
        </View>

        <Text style={styles.title}>Contrat de location à usage d’habitation</Text>
        <Text style={styles.subtitle}>
          {input.listing.title} — {input.listing.address}
        </Text>

        <Text style={styles.sectionHeading}>Parties au contrat</Text>
        <View style={styles.partyRow}>
          <View style={styles.partyCard}>
            <Text style={styles.partyLabel}>Bailleur (propriétaire)</Text>
            <Text style={styles.partyName}>{input.owner.name}</Text>
            <Text style={styles.partyContact}>{input.owner.email}</Text>
            {input.owner.phone ? (
              <Text style={styles.partyContact}>{input.owner.phone}</Text>
            ) : null}
          </View>
          <View style={styles.partyCard}>
            <Text style={styles.partyLabel}>Preneur (locataire)</Text>
            <Text style={styles.partyName}>{input.tenant.name}</Text>
            <Text style={styles.partyContact}>{input.tenant.email}</Text>
            {input.tenant.phone ? (
              <Text style={styles.partyContact}>{input.tenant.phone}</Text>
            ) : null}
          </View>
        </View>

        <Text style={styles.sectionHeading}>Objet du contrat</Text>
        <Text style={styles.para}>
          Le bailleur loue au preneur, qui accepte, le logement décrit ci-après
          pour un usage exclusif d’habitation à titre principal. Le preneur
          déclare l’avoir visité et accepter les lieux dans leur état actuel,
          sous réserve de l’état des lieux d’entrée joint en annexe (E-T27.2).
        </Text>

        <Text style={styles.sectionHeading}>Désignation du logement</Text>
        <View style={styles.termsTable}>
          <View style={styles.termsRow}>
            <Text style={styles.termsLabel}>Intitulé de l’annonce</Text>
            <Text style={styles.termsValue}>{input.listing.title}</Text>
          </View>
          <View style={styles.termsRow}>
            <Text style={styles.termsLabel}>Adresse approximative</Text>
            <Text style={styles.termsValue}>{input.listing.address}</Text>
          </View>
        </View>

        <Text style={styles.sectionHeading}>Conditions financières</Text>
        <View style={styles.termsTable}>
          <View style={styles.termsRow}>
            <Text style={styles.termsLabel}>Loyer mensuel</Text>
            <Text style={styles.termsValue}>{formatMga(input.monthlyRentMGA)}</Text>
          </View>
          <View style={styles.termsRow}>
            <Text style={styles.termsLabel}>Caution versée</Text>
            <Text style={styles.termsValue}>
              {input.cautionMGA > 0 ? formatMga(input.cautionMGA) : '0 Ar'}
            </Text>
          </View>
          <View style={styles.termsRow}>
            <Text style={styles.termsLabel}>Frais AryTrano (à charge locataire)</Text>
            <Text style={styles.termsValue}>{formatMga(input.platformFeeMGA)}</Text>
          </View>
        </View>
        <Text style={styles.para}>
          Le loyer et la caution sont versés directement par le preneur au
          bailleur selon les modalités convenues entre les parties hors
          plateforme AryTrano. AryTrano ne perçoit que les frais
          d’accompagnement listés ci-dessus, déjà réglés via la plateforme.
        </Text>

        <Text style={styles.sectionHeading}>Durée du bail</Text>
        <View style={styles.termsTable}>
          <View style={styles.termsRow}>
            <Text style={styles.termsLabel}>Date d’entrée dans les lieux</Text>
            <Text style={styles.termsValue}>{formatDate(input.startDate)}</Text>
          </View>
          <View style={styles.termsRow}>
            <Text style={styles.termsLabel}>Durée</Text>
            <Text style={styles.termsValue}>
              {input.durationMonths} mois
            </Text>
          </View>
          <View style={styles.termsRow}>
            <Text style={styles.termsLabel}>Fin du bail prévue</Text>
            <Text style={styles.termsValue}>{formatDate(endDate)}</Text>
          </View>
        </View>

        <Text style={styles.sectionHeading}>Obligations principales</Text>
        <Text style={styles.para}>
          1. Le preneur s’engage à régler le loyer aux échéances convenues,
          à user paisiblement du logement, et à le restituer en bon état
          en fin de bail, sous réserve de l’état des lieux de sortie.
        </Text>
        <Text style={styles.para}>
          2. Le bailleur s’engage à délivrer le logement en bon état d’usage,
          à assurer la jouissance paisible des lieux, et à effectuer les
          réparations autres que locatives nécessaires au maintien du
          logement en bon état.
        </Text>
        <Text style={styles.para}>
          3. En cas de litige sur la restitution de la caution, les parties
          peuvent saisir le service d’arbitrage AryTrano (E-T27.3) qui rend
          un avis sous 7 jours ouvrés, sans préjudice du recours
          juridictionnel ordinaire.
        </Text>

        <Text style={styles.sectionHeading}>Résiliation</Text>
        <Text style={styles.para}>
          Le preneur peut résilier le bail à tout moment moyennant un
          préavis d’un mois adressé au bailleur. Le bailleur peut résilier
          dans les conditions prévues par la loi malgache applicable, avec
          un préavis minimal de trois mois sauf cas de manquement grave.
        </Text>

        <View style={styles.signatureRow}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>SIGNATURE BAILLEUR</Text>
            <Text style={styles.signatureName}>{input.owner.name}</Text>
            <Text style={styles.signatureDate}>
              Signé électroniquement le {formatDate(input.ownerSignedAt)}
            </Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>SIGNATURE PRENEUR</Text>
            <Text style={styles.signatureName}>{input.tenant.name}</Text>
            <Text style={styles.signatureDate}>
              Signé électroniquement le {formatDate(input.tenantSignedAt)}
            </Text>
          </View>
        </View>

        <Text fixed style={styles.footer}>
          Document généré automatiquement par AryTrano le {formatDate(input.generatedAt)} —
          template juridique v1 (en cours de validation juriste MG). Réf : #{input.refShort.toUpperCase()}.
        </Text>
      </Page>
    </Document>
  )
}

// Re-export the Font registry for downstream wiring if needed.
export { Font }
