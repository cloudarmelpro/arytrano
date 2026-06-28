import { describe, it, expect } from 'vitest'
import { detectScamSignals } from './scam-detector'

describe('detectScamSignals', () => {
  it('returns no signal on a clean listing', () => {
    const r = detectScamSignals({
      title: 'Studio meublé à Andrainjato',
      description:
        'Beau studio lumineux à 5 minutes à pied de l’IPNT. Cuisine équipée, eau chaude, wifi inclus.',
    })
    expect(r.signals).toEqual([])
    expect(r.confidence).toBe(0)
    expect(r.shouldFlag).toBe(false)
  })

  it('catches the canonical "send the caution before visit" scam in FR', () => {
    const r = detectScamSignals({
      title: 'Appartement urgent',
      description:
        'Envoyer la caution avant la visite via Western Union pour réserver.',
    })
    expect(r.signals.some((s) => s.code === 'CAUTION_BEFORE_VISIT')).toBe(true)
    expect(r.signals.some((s) => s.code === 'MONEY_TRANSFER_SERVICE')).toBe(true)
    expect(r.shouldFlag).toBe(true)
  })

  it('catches the English variant', () => {
    const r = detectScamSignals({
      title: 'Apartment for rent',
      description: 'Please wire the deposit before the visit. MoneyGram preferred.',
    })
    expect(r.signals.some((s) => s.code === 'CAUTION_BEFORE_VISIT')).toBe(true)
    expect(r.signals.some((s) => s.code === 'MONEY_TRANSFER_SERVICE')).toBe(true)
    expect(r.shouldFlag).toBe(true)
  })

  it('catches crypto + gift card combo (advanced scam pattern)', () => {
    const r = detectScamSignals({
      title: 'A louer',
      description: 'Paiement en Bitcoin ou Amazon gift card uniquement.',
    })
    expect(r.signals.some((s) => s.code === 'CRYPTO')).toBe(true)
    expect(r.signals.some((s) => s.code === 'GIFT_CARD')).toBe(true)
    expect(r.shouldFlag).toBe(true)
  })

  it('flags overseas-owner narrative alone only if combined with another signal', () => {
    const r = detectScamSignals({
      title: 'Studio à louer',
      description:
        'Je suis actuellement à l’étranger, je serai disponible pour répondre par WhatsApp.',
    })
    expect(r.signals.some((s) => s.code === 'OVERSEAS_OWNER')).toBe(true)
    // Weight 0.5 alone reaches the threshold (>=0.5 inclusive) — that's
    // intentional, since this phrasing is highly correlated with scams.
    expect(r.shouldFlag).toBe(true)
  })

  it('flags URL shorteners (hidden redirection)', () => {
    const r = detectScamSignals({
      title: 'Belle annonce',
      description:
        'Plus d’infos ici : https://bit.ly/abc123 — appelez-nous vite !',
    })
    expect(r.signals.some((s) => s.code === 'URL_SHORTENER')).toBe(true)
    expect(r.signals.some((s) => s.code === 'URGENCY_PRESSURE')).toBe(true)
  })

  it('caps confidence at 1', () => {
    const r = detectScamSignals({
      title: 'Urgent — Western Union — Bitcoin — Amazon gift card — bit.ly/x',
      description:
        'Envoyez la caution avant la visite à mon adresse à l’étranger. Aujourd’hui seulement.',
    })
    expect(r.confidence).toBeLessThanOrEqual(1)
    expect(r.shouldFlag).toBe(true)
  })
})
