# Payment provider logos

Drop the official SVG/PNG logos here when you have them, with these exact filenames:

- `mvola.svg` — M-Vola (Telma)
- `orange-money.svg` — Orange Money
- `airtel-money.svg` — Airtel Money

The footer (`src/components/shared/Footer.tsx`) currently renders brand-colored
text pills as a fallback. To start using the real logos, update the rendering
in `PaymentsRow` to use `<img src={p.logo} alt={label} />` when `p.logo` is set,
keeping the colored pill as a graceful fallback only for missing files.

Recommended logo specs:
- Square or short rectangular shape, transparent background
- 24–32px display height in the footer
- SVG preferred (sharp at every density, tiny on the wire)
