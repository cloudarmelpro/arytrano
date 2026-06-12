import { z } from 'zod'

const cuid = z.string().regex(/^c[a-z0-9]{20,40}$/, 'Identifiant invalide')

export const openDisputeSchema = z.object({
  leaseId: cuid,
  initialClaim: z
    .string()
    .trim()
    .min(20, 'Au moins 20 caractères — décrire le litige.')
    .max(3000, '3000 caractères maximum.'),
  amountAtStakeMGA: z.coerce
    .number()
    .int()
    .nonnegative()
    .max(100_000_000),
})
export type OpenDisputeInput = z.infer<typeof openDisputeSchema>

export const postDisputeMessageSchema = z.object({
  disputeId: cuid,
  body: z.string().trim().min(2).max(3000),
})
export type PostDisputeMessageInput = z.infer<typeof postDisputeMessageSchema>

export const claimDisputeSchema = z.object({ disputeId: cuid })
export type ClaimDisputeInput = z.infer<typeof claimDisputeSchema>

export const resolveDisputeSchema = z.object({
  disputeId: cuid,
  verdict: z
    .string()
    .trim()
    .min(20, 'La motivation doit faire au moins 20 caractères.')
    .max(5000),
  resolution: z.enum(['RESOLVED_OWNER', 'RESOLVED_TENANT', 'RESOLVED_SPLIT']),
})
export type ResolveDisputeInput = z.infer<typeof resolveDisputeSchema>
