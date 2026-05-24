/**
 * Safely serialize a JSON-LD object for injection via
 * `<script type="application/ld+json" dangerouslySetInnerHTML>`.
 *
 * `JSON.stringify` does NOT escape `<`, so if any value contains
 * `</script>` the output will literally close the surrounding
 * `<script>` tag — that's a stored-XSS vector when user-controlled
 * strings (listing title, description, owner name) flow into JSON-LD.
 *
 * We escape:
 *  - `<` → `<` — breaks the closing tag match (always safe in JSON)
 *  - U+2028 / U+2029 — valid JSON, but break some JS parsers when emitted
 *    inside a `<script>` block (treated as line terminators)
 *
 * The U+2028 / U+2029 regexes are built via `new RegExp(...)` because
 * those characters ARE line terminators in source code and would break
 * a regex literal containing them.
 *
 * Reference: https://github.com/yahoo/serialize-javascript#user-content-security
 */
const LINE_SEP_RE = new RegExp('\\u2028', 'g')
const PARA_SEP_RE = new RegExp('\\u2029', 'g')

export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(LINE_SEP_RE, '\\u2028')
    .replace(PARA_SEP_RE, '\\u2029')
}
