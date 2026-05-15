import { BrandWordmark } from './BrandWordmark'

function StoreButton({ label, soon }: { label: string; soon: string }) {
  return (
    <button
      type="button"
      className="flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-left text-primary-foreground transition hover:opacity-90"
      aria-label={`${label} — ${soon}`}
    >
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z" />
      </svg>
      <span className="flex flex-col leading-tight">
        <span className="text-[10px] uppercase tracking-wider opacity-70">{soon}</span>
        <span className="text-sm font-semibold">{label}</span>
      </span>
    </button>
  )
}

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <BrandWordmark />
          <p className="max-w-sm text-sm text-muted-foreground">
            Trouve ou propose un logement étudiant à Fianarantsoa, en toute confiance.
          </p>
        </div>

        <div className="flex gap-3">
          <StoreButton label="iOS · v0.5" soon="Bientôt sur" />
          <StoreButton label="Android · v0.5" soon="Bientôt sur" />
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted-foreground sm:px-6">
          © {year} AryTrano · Fianarantsoa
        </div>
      </div>
    </footer>
  )
}
