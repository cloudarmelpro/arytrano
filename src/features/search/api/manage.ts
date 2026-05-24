import 'server-only'
import { z } from 'zod'
import { ok, withErrorHandling } from '@/lib/api/response'
import { requireBearer } from '@/lib/api/bearer'
import { errors } from '@/lib/api/errors'
import { assertCuidShape } from '@/lib/api/id-regex'
import {
  deleteSavedSearch,
  toggleSavedSearchAlerts,
} from '../services/saved-search'

/**
 * PATCH /api/v1/users/me/saved-searches/:id
 * Body : `{ alertsOn: boolean }`
 *
 * Toggle whether the saved search is wired to the alert cron. The
 * service returns `false` when the row doesn't exist OR belongs to
 * another user — both surface as 404 here (anti-leak : we don't
 * disclose which ids exist).
 */
export function makePatchHandler() {
  return withErrorHandling(
    async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
      const payload = await requireBearer(req)
      const { id } = await ctx.params
      assertCuidShape(id, 'Saved search not found')

      const body = (await req.json().catch(() => ({}))) as unknown
      const parsed = z
        .object({ alertsOn: z.boolean() })
        .safeParse(body)
      if (!parsed.success) {
        throw errors.validation('Invalid request')
      }

      const updated = await toggleSavedSearchAlerts(
        payload.sub,
        id,
        parsed.data.alertsOn,
      )
      if (!updated) throw errors.notFound('Saved search not found')
      return ok({ alertsOn: parsed.data.alertsOn })
    },
  )
}

/**
 * DELETE /api/v1/users/me/saved-searches/:id
 *
 * Hard-delete (no soft-delete column on SavedSearch). Same anti-leak
 * 404 shape as PATCH when the id isn't owned by the bearer.
 */
export function makeDeleteHandler() {
  return withErrorHandling(
    async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
      const payload = await requireBearer(req)
      const { id } = await ctx.params
      assertCuidShape(id, 'Saved search not found')

      const deleted = await deleteSavedSearch(payload.sub, id)
      if (!deleted) throw errors.notFound('Saved search not found')
      return ok({ deleted: true })
    },
  )
}
