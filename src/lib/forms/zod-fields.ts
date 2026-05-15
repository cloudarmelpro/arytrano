import 'server-only'
import { ZodError } from 'zod'

/**
 * Maps a ZodError to a `{ fieldName: [messages...] }` shape — the format
 * every Server Action in this project uses for its `state.fields`.
 * Path `[]` (root error) lands under the `_` key.
 */
export function zodIssuesToFields(error: ZodError): Record<string, string[]> {
  const fields: Record<string, string[]> = {}
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_'
    if (!fields[key]) fields[key] = []
    fields[key].push(issue.message)
  }
  return fields
}
