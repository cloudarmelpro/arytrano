'use client'

import { useActionState, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { useT } from '@/lib/i18n/client'
import { createTestimonialAction } from '../actions/create-testimonial'
import { updateTestimonialAction } from '../actions/update-testimonial'
import type {
  TestimonialAudience,
  CreateTestimonialInput,
} from '../schemas/testimonial'

type Mode = 'create' | 'edit'

type Props = {
  mode: Mode
  initial?: {
    id: string
    audience: TestimonialAudience
    body: string
    authorName: string
    authorMeta: string | null
    sortOrder: number
    publishedAt: Date | null
  }
}

type ActionResult = {
  ok: boolean
  fieldErrors?: Record<string, string[]>
  message?: string
}

const INITIAL_STATE: ActionResult = { ok: false }

/**
 * Single form used both for new + edit. The action is selected from
 * `mode` — `useActionState` wires field-level errors back into the
 * form when Zod validation fails server-side.
 *
 * Body has a live char counter (the visible cap is 500 — anything
 * longer renders awkwardly in the OwnerBlock testimonial card).
 *
 * Per memory `feedback_loading_states`, the fieldset wraps everything
 * with `disabled={pending}` so inputs go inert during submit.
 */
export function TestimonialForm({ mode, initial }: Props) {
  const t = useT()
  const boundAction =
    mode === 'create'
      ? createTestimonialAction
      : updateTestimonialAction.bind(null, initial!.id)

  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    boundAction,
    INITIAL_STATE,
  )

  // Controlled body for the live char counter only — useFormStatus
  // shares the form state for everything else.
  const [body, setBody] = useState(initial?.body ?? '')

  function fieldError(name: keyof CreateTestimonialInput): string | undefined {
    return state.fieldErrors?.[name]?.[0]
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <fieldset disabled={pending} className="contents">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="audience">
              {t('admin.testimonials.form.audience.label')}
            </FieldLabel>
            <Select
              name="audience"
              defaultValue={initial?.audience ?? 'OWNER'}
              items={[
                { value: 'OWNER', label: t('admin.testimonials.form.audience.owner') },
                { value: 'STUDENT', label: t('admin.testimonials.form.audience.student') },
              ]}
              disabled={pending}
            >
              <SelectTrigger id="audience" className="h-10 w-full max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OWNER">
                  {t('admin.testimonials.form.audience.owner')}
                </SelectItem>
                <SelectItem value="STUDENT">
                  {t('admin.testimonials.form.audience.student')}
                </SelectItem>
              </SelectContent>
            </Select>
            {fieldError('audience') ? (
              <FieldError>{fieldError('audience')}</FieldError>
            ) : null}
          </Field>

          <Field>
            <FieldLabel htmlFor="authorName">
              {t('admin.testimonials.form.authorName.label')}
            </FieldLabel>
            <Input
              id="authorName"
              name="authorName"
              type="text"
              required
              minLength={2}
              maxLength={80}
              defaultValue={initial?.authorName ?? ''}
              placeholder={t('admin.testimonials.form.authorName.placeholder')}
            />
            {fieldError('authorName') ? (
              <FieldError>{fieldError('authorName')}</FieldError>
            ) : null}
          </Field>

          <Field>
            <FieldLabel htmlFor="authorMeta">
              {t('admin.testimonials.form.authorMeta.label')}
            </FieldLabel>
            <Input
              id="authorMeta"
              name="authorMeta"
              type="text"
              maxLength={200}
              defaultValue={initial?.authorMeta ?? ''}
              placeholder={t('admin.testimonials.form.authorMeta.placeholder')}
            />
            <FieldDescription>
              {t('admin.testimonials.form.authorMeta.help')}
            </FieldDescription>
            {fieldError('authorMeta') ? (
              <FieldError>{fieldError('authorMeta')}</FieldError>
            ) : null}
          </Field>

          <Field>
            <FieldLabel htmlFor="body">
              {t('admin.testimonials.form.body.label')}
            </FieldLabel>
            <textarea
              id="body"
              name="body"
              required
              minLength={30}
              maxLength={500}
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={t('admin.testimonials.form.body.placeholder')}
              className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
              aria-describedby="body-count"
            />
            <FieldDescription id="body-count">
              {t('admin.testimonials.form.body.charCount', {
                count: body.length,
                max: 500,
              })}
            </FieldDescription>
            {fieldError('body') ? (
              <FieldError>{fieldError('body')}</FieldError>
            ) : null}
          </Field>

          <Field>
            <FieldLabel htmlFor="sortOrder">
              {t('admin.testimonials.form.sortOrder.label')}
            </FieldLabel>
            <Input
              id="sortOrder"
              name="sortOrder"
              type="number"
              min={0}
              max={9999}
              step={1}
              defaultValue={initial?.sortOrder ?? 0}
              className="max-w-xs"
            />
            <FieldDescription>
              {t('admin.testimonials.form.sortOrder.help')}
            </FieldDescription>
            {fieldError('sortOrder') ? (
              <FieldError>{fieldError('sortOrder')}</FieldError>
            ) : null}
          </Field>

          {mode === 'create' ? (
            <Field>
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-foreground">
                <input
                  type="checkbox"
                  name="publishImmediately"
                  className="h-4 w-4 rounded border-input"
                />
                {t('admin.testimonials.form.publishImmediately.label')}
              </label>
              <FieldDescription>
                {t('admin.testimonials.form.publishImmediately.help')}
              </FieldDescription>
            </Field>
          ) : null}
        </FieldGroup>

        {state.message ? (
          <p
            role="alert"
            className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {state.message}
          </p>
        ) : null}

        <div className="flex justify-end gap-2">
          <Button
            type="submit"
            disabled={pending}
            aria-busy={pending}
            className="min-w-32"
          >
            {pending
              ? t('admin.testimonials.form.submit.pending')
              : mode === 'create'
                ? t('admin.testimonials.form.submit.create')
                : t('admin.testimonials.form.submit.update')}
          </Button>
        </div>
      </fieldset>
    </form>
  )
}
