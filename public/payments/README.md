# Payment provider logos

Official wordmark SVGs used by the footer's "Paiements acceptés" row.

- `Mvola.svg` — M-Vola (Telma)
- `Orange.svg` — Orange Money
- `Airtel.svg` — Airtel Money

Rendered at 24px height inside a white pill (`src/components/shared/Footer.tsx`,
`PaymentsRow`). To swap a logo, replace the file at the same path; the footer
picks up the new bytes on the next build / cache bust.

Bank transfer and cash use icon-only pills (no third-party trademark)
so no asset is needed for those.
