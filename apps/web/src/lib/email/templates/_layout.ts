import 'server-only'

export type RenderedEmail = {
  subject: string
  html: string
  text: string
}

export type EmailHtmlParts = {
  salutation: string
  /** Pre-escaped HTML body. Caller is responsible for escaping user input. */
  body: string
  primaryCta: { label: string; href: string }
  secondaryCta?: { label: string; href: string }
}

/**
 * Shared HTML wrapper for AryTrano transactional emails. Inline styles
 * are mandatory — most email clients (Gmail, Yahoo, Outlook web) strip
 * `<style>` blocks. Brand colour `#4f46e5` mirrors the app's `--primary`.
 *
 * URLs are NOT auto-escaped — they're always server-built. If a future
 * template surfaces user-controlled URLs, route them through `encodeURI()`
 * at the call site.
 */
export function emailHtmlLayout(parts: EmailHtmlParts): string {
  const secondary = parts.secondaryCta
    ? `<p style="margin:8px 0 0;font-size:13px;color:#666"><a href="${parts.secondaryCta.href}" style="color:#666;text-decoration:underline">${parts.secondaryCta.label}</a></p>`
    : ''
  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8" /></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#1a1a1a;background:#f7f7f7;margin:0;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:32px">
    <p style="margin:0 0 16px;font-size:15px">${parts.salutation}</p>
    <p style="margin:0 0 24px;font-size:15px">${parts.body}</p>
    <p style="margin:0">
      <a href="${parts.primaryCta.href}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-weight:500">${parts.primaryCta.label}</a>
    </p>
    ${secondary}
    <hr style="margin:32px 0 16px;border:0;border-top:1px solid #eee" />
    <p style="margin:0;font-size:12px;color:#999">AryTrano — Logement étudiant à Madagascar</p>
  </div>
</body>
</html>`.trim()
}

export function emailTextLayout(parts: {
  salutation: string
  body: string
  cta: string
}): string {
  return `${parts.salutation}\n\n${parts.body}\n\n${parts.cta}\n\n— AryTrano\n`
}
