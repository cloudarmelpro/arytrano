import { z } from 'zod'

export const listLoginEventsQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(50).default(10),
})

export type ListLoginEventsQuery = z.infer<typeof listLoginEventsQuerySchema>
