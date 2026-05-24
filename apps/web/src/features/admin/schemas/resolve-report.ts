import { z } from 'zod'

export const resolveReportSchema = z.object({
  reportId: z.string().regex(/^[a-z0-9]{20,40}$/, 'ID invalide'),
  decision: z.enum(['RESOLVED', 'DISMISSED']),
  adminNote: z
    .string()
    .trim()
    .min(5, 'Note trop courte (5 caractères min.)')
    .max(500, 'Note trop longue (500 caractères max.)')
    // No TAB / vertical-tab — defence against control-char abuse in email
    // headers / templates (CR/LF are stripped centrally in lib/email).
    .regex(/^[^\t\v\f]+$/m, 'Caractères de contrôle non autorisés'),
})

export type ResolveReportInput = z.infer<typeof resolveReportSchema>
