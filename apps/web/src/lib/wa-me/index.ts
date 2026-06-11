import 'server-only'

/**
 * E-T28 T-RES-08 — `wa.me` deep-link builder.
 *
 * Decision 2026-06-10 : we ship 100% on `wa.me?text=` for v1. No Meta
 * Business API. The operator copies the rendered link from
 * `/admin/leads/:id` and pastes it into a browser ; WhatsApp Web
 * opens with the recipient pre-selected and the message body pre-
 * filled. Same flow on mobile if the operator uses WhatsApp on a
 * phone — `wa.me` redirects into the native app.
 *
 * Six templates cover the v1 funnel :
 *   newLead         — operator → owner, "you have a candidate"
 *   ownerReminder   — operator → owner, "still waiting"
 *   tenantFollowUp  — operator → tenant, "any news ?"
 *   noResponse      — operator → tenant, "we archived your lead"
 *   leaseLink       — operator → tenant, "pay the signature fee"
 *   leasePaid       — operator → owner, "tenant just paid"
 *
 * Templates take a `Locale` and return localized text. Operators
 * always pick the recipient's locale ; the runbook in T-RES-12
 * documents the convention.
 *
 * Safety :
 *   - All user-supplied strings (tenantName, listingTitle, etc.)
 *     are stripped of CRLF + tab + NUL + Unicode line/paragraph
 *     separators before interpolation (per memory
 *     `feedback_email_header_injection` — same vector applies to
 *     wa.me URL-encoding).
 *   - Output is capped at WA_MAX_TEXT_BYTES to stay below
 *     WhatsApp's silent-truncation threshold (1500 bytes after
 *     URL-encoding, conservative).
 *   - Phone numbers are normalized to digits-only (no `+`) — `wa.me`
 *     expects that shape per https://faq.whatsapp.com/5913398998672934
 */

import type { Locale } from '@/lib/i18n/config'

/** WhatsApp truncates URL-encoded text bodies somewhere above 4 KB.
 *  We cap at ~1500 raw chars so the encoded form stays comfortably
 *  below the threshold even with multi-byte UTF-8 chars (MG accented
 *  vowels). Operators can always send a second message. */
const WA_MAX_TEXT_BYTES = 1500

/** Strip control characters that would break out of the URL-encoded
 *  text body or paste as visible garbage on the recipient side.
 *  Constructed via `new RegExp` so the source stays readable (no
 *  embedded control characters in the file). */
const UNSAFE_CHARS = new RegExp(
  '[\\r\\n\\t\\u0000\\u2028\\u2029]+',
  'g',
)

function sanitize(input: string): string {
  return input.replace(UNSAFE_CHARS, ' ').trim()
}

function clampText(text: string): string {
  if (text.length <= WA_MAX_TEXT_BYTES) return text
  return text.slice(0, WA_MAX_TEXT_BYTES - 1) + '…'
}

/** Normalize an E.164 phone to digits-only (no leading `+`).
 *  `wa.me/261341234567` works ; `wa.me/+261341234567` redirects but
 *  the `+` confuses some Android intent handlers. */
function normalizePhoneForWaMe(phoneE164: string): string {
  const trimmed = phoneE164.trim()
  return trimmed.startsWith('+') ? trimmed.slice(1) : trimmed
}

export type WaMeLink = {
  /** Ready-to-open URL : `https://wa.me/<digits>?text=<urlencoded>`. */
  url: string
  /** Raw text body (un-encoded) — for display in the admin queue. */
  text: string
}

function buildLink(phoneE164: string, text: string): WaMeLink {
  const clamped = clampText(text)
  const digits = normalizePhoneForWaMe(phoneE164)
  const url = `https://wa.me/${digits}?text=${encodeURIComponent(clamped)}`
  return { url, text: clamped }
}

// ============================================================
// Template bodies — bilingual FR-MG / MG. Native MG copywriter pass
// in T-RES-11; the strings below are operator-vetted FR + first-cut MG.
// ============================================================

type TemplateInput = {
  recipientPhoneE164: string
  recipientName: string
  operatorName: string
  locale: Locale
}
type ListingContext = { listingTitle: string; listingUrl: string }
type LeaseContext = { leaseUrl: string; signatureFeeMGA?: number }

function fr_mg_newLeadOwner(
  i: TemplateInput & ListingContext & { tenantName: string },
): string {
  return [
    `Bonjour ${sanitize(i.recipientName)},`,
    ``,
    `Je suis ${sanitize(i.operatorName)} de l'équipe AryTrano.`,
    `Un(e) étudiant(e), ${sanitize(i.tenantName)}, est intéressé(e) par votre annonce « ${sanitize(i.listingTitle)} ».`,
    ``,
    `Pouvez-vous me confirmer si le logement est toujours disponible ? Je m'occupe ensuite des prochaines étapes (visite virtuelle, signature, paiement) — vous n'avez qu'à valider.`,
    ``,
    `Lien de votre annonce : ${i.listingUrl}`,
    ``,
    `Merci !`,
  ].join('\n')
}

function mg_newLeadOwner(
  i: TemplateInput & ListingContext & { tenantName: string },
): string {
  return [
    `Salama ${sanitize(i.recipientName)},`,
    ``,
    `Izaho ${sanitize(i.operatorName)} avy amin'ny ekipa AryTrano.`,
    `Misy mpianatra iray, ${sanitize(i.tenantName)}, liana amin'ny filazana « ${sanitize(i.listingTitle)} » nataonao.`,
    ``,
    `Mbola misy ve ny trano ? Hanao izay rehetra ilaina avy eo aho (fitsidihana an-tserasera, sonia, fandoavam-bola) — tianao ihany no manamarina.`,
    ``,
    `Ny rohy ho an'ny filazanao : ${i.listingUrl}`,
    ``,
    `Misaotra !`,
  ].join('\n')
}

export function buildNewLeadOwnerLink(
  input: TemplateInput & ListingContext & { tenantName: string },
): WaMeLink {
  const text =
    input.locale === 'mg' ? mg_newLeadOwner(input) : fr_mg_newLeadOwner(input)
  return buildLink(input.recipientPhoneE164, text)
}

function fr_mg_ownerReminder(
  i: TemplateInput & ListingContext,
): string {
  return [
    `Bonjour ${sanitize(i.recipientName)},`,
    ``,
    `${sanitize(i.operatorName)} de AryTrano — je reviens vers vous au sujet de l'annonce « ${sanitize(i.listingTitle)} ».`,
    ``,
    `Un(e) candidat(e) attend votre retour. Pouvez-vous me dire si vous souhaitez poursuivre ?`,
    ``,
    `Annonce : ${i.listingUrl}`,
    ``,
    `Merci pour votre réponse rapide.`,
  ].join('\n')
}

function mg_ownerReminder(i: TemplateInput & ListingContext): string {
  return [
    `Salama ${sanitize(i.recipientName)},`,
    ``,
    `${sanitize(i.operatorName)} avy amin'ny AryTrano — manontany momba ny filazana « ${sanitize(i.listingTitle)} ».`,
    ``,
    `Misy kandida miandry valiny aminao. Mbola te-handroso ve ianao ?`,
    ``,
    `Filazana : ${i.listingUrl}`,
    ``,
    `Misaotra amin'ny valiny haingana.`,
  ].join('\n')
}

export function buildOwnerReminderLink(
  input: TemplateInput & ListingContext,
): WaMeLink {
  const text =
    input.locale === 'mg' ? mg_ownerReminder(input) : fr_mg_ownerReminder(input)
  return buildLink(input.recipientPhoneE164, text)
}

function fr_mg_tenantFollowUp(
  i: TemplateInput & ListingContext,
): string {
  return [
    `Bonjour ${sanitize(i.recipientName)},`,
    ``,
    `Je suis ${sanitize(i.operatorName)} de AryTrano.`,
    `Vous nous avez contacté(e) au sujet de « ${sanitize(i.listingTitle)} ». Vous êtes toujours intéressé(e) ?`,
    ``,
    `Annonce : ${i.listingUrl}`,
    ``,
    `À bientôt !`,
  ].join('\n')
}

function mg_tenantFollowUp(i: TemplateInput & ListingContext): string {
  return [
    `Salama ${sanitize(i.recipientName)},`,
    ``,
    `Izaho ${sanitize(i.operatorName)} avy amin'ny AryTrano.`,
    `Nifandray taminay ianao momba ny « ${sanitize(i.listingTitle)} ». Mbola liana ve ianao ?`,
    ``,
    `Filazana : ${i.listingUrl}`,
    ``,
    `Mandra-pihaona !`,
  ].join('\n')
}

export function buildTenantFollowUpLink(
  input: TemplateInput & ListingContext,
): WaMeLink {
  const text =
    input.locale === 'mg'
      ? mg_tenantFollowUp(input)
      : fr_mg_tenantFollowUp(input)
  return buildLink(input.recipientPhoneE164, text)
}

function fr_mg_noResponse(i: TemplateInput & ListingContext): string {
  return [
    `Bonjour ${sanitize(i.recipientName)},`,
    ``,
    `${sanitize(i.operatorName)} de AryTrano. Sans nouvelles de votre part, nous avons archivé votre demande pour « ${sanitize(i.listingTitle)} ».`,
    ``,
    `N'hésitez pas à revenir vers nous si la recherche se poursuit. Catalogue : https://arytrano.com/annonces`,
    ``,
    `Bonne continuation !`,
  ].join('\n')
}

function mg_noResponse(i: TemplateInput & ListingContext): string {
  return [
    `Salama ${sanitize(i.recipientName)},`,
    ``,
    `${sanitize(i.operatorName)} avy amin'ny AryTrano. Tsy nahazo valiny taminao izahay, ka noraketinay ny fangatahanao momba ny « ${sanitize(i.listingTitle)} ».`,
    ``,
    `Aza misalasala miverina aminay raha mbola mitady ianao. Karazana : https://arytrano.com/annonces`,
    ``,
    `Soa fianatra !`,
  ].join('\n')
}

export function buildNoResponseLink(
  input: TemplateInput & ListingContext,
): WaMeLink {
  const text =
    input.locale === 'mg' ? mg_noResponse(input) : fr_mg_noResponse(input)
  return buildLink(input.recipientPhoneE164, text)
}

function fr_mg_leaseLink(
  i: TemplateInput & ListingContext & LeaseContext,
): string {
  return [
    `Bonjour ${sanitize(i.recipientName)},`,
    ``,
    `Excellente nouvelle : le propriétaire a accepté pour « ${sanitize(i.listingTitle)} ».`,
    `${sanitize(i.operatorName)} de AryTrano — voici votre bail à signer :`,
    ``,
    i.leaseUrl,
    ``,
    `Frais d'accompagnement AryTrano à régler maintenant pour valider le bail.`,
    ``,
    `À tout de suite !`,
  ].join('\n')
}

function mg_leaseLink(
  i: TemplateInput & ListingContext & LeaseContext,
): string {
  return [
    `Salama ${sanitize(i.recipientName)},`,
    ``,
    `Vaovao mahafaly : nanaiky ny tompon-trano momba ny « ${sanitize(i.listingTitle)} ».`,
    `${sanitize(i.operatorName)} avy amin'ny AryTrano — ity ny fifanaraham-pakaramana hosoniavinao :`,
    ``,
    i.leaseUrl,
    ``,
    `Aloavy ny saran'ny AryTrano izao mba hanamarina ny fifanaraham-pakaramana.`,
    ``,
    `Mifampihaona faingana !`,
  ].join('\n')
}

export function buildLeaseLinkLink(
  input: TemplateInput & ListingContext & LeaseContext,
): WaMeLink {
  const text =
    input.locale === 'mg' ? mg_leaseLink(input) : fr_mg_leaseLink(input)
  return buildLink(input.recipientPhoneE164, text)
}

function fr_mg_leasePaid(
  i: TemplateInput & ListingContext & { tenantName: string },
): string {
  return [
    `Bonjour ${sanitize(i.recipientName)},`,
    ``,
    `${sanitize(i.operatorName)} de AryTrano — votre locataire ${sanitize(i.tenantName)} vient de signer pour « ${sanitize(i.listingTitle)} ».`,
    ``,
    `Le bail est officiellement actif. Convenez avec ${sanitize(i.tenantName)} de la date de remise des clés.`,
    ``,
    `Détails de l'annonce : ${i.listingUrl}`,
    ``,
    `Bonne suite !`,
  ].join('\n')
}

function mg_leasePaid(
  i: TemplateInput & ListingContext & { tenantName: string },
): string {
  return [
    `Salama ${sanitize(i.recipientName)},`,
    ``,
    `${sanitize(i.operatorName)} avy amin'ny AryTrano — vao avy nanao sonia ny mpanofa ${sanitize(i.tenantName)} ho an'ny « ${sanitize(i.listingTitle)} ».`,
    ``,
    `Ofisialy izao ny fifanaraham-pakaramana. Ifampiraharaho amin'i ${sanitize(i.tenantName)} ny daty hanaterana ny fanalahidy.`,
    ``,
    `Antsipiriany : ${i.listingUrl}`,
    ``,
    `Soa fitohizana !`,
  ].join('\n')
}

export function buildLeasePaidOwnerLink(
  input: TemplateInput & ListingContext & { tenantName: string },
): WaMeLink {
  const text =
    input.locale === 'mg' ? mg_leasePaid(input) : fr_mg_leasePaid(input)
  return buildLink(input.recipientPhoneE164, text)
}

/** Sanitization helper exposed for tests + downstream consumers
 *  that build their own templates. */
export { sanitize as sanitizeWaMeText }
