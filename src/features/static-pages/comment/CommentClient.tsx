'use client'

import { useState } from 'react'
import { useT } from '@/lib/i18n/client'
import { Icon } from '@/components/shared/Icon'
import type { MessageKey } from '@/lib/i18n/messages'

type Audience = 'student' | 'owner'

type FlowStep = {
  n: string
  title: MessageKey
  desc: MessageKey
  example: MessageKey
  time: MessageKey
}

const STUDENT_FLOW: FlowStep[] = [
  {
    n: '01',
    title: 'comment.studentFlow.s1.title',
    desc: 'comment.studentFlow.s1.desc',
    example: 'comment.studentFlow.s1.example',
    time: 'comment.studentFlow.s1.time',
  },
  {
    n: '02',
    title: 'comment.studentFlow.s2.title',
    desc: 'comment.studentFlow.s2.desc',
    example: 'comment.studentFlow.s2.example',
    time: 'comment.studentFlow.s2.time',
  },
  {
    n: '03',
    title: 'comment.studentFlow.s3.title',
    desc: 'comment.studentFlow.s3.desc',
    example: 'comment.studentFlow.s3.example',
    time: 'comment.studentFlow.s3.time',
  },
  {
    n: '04',
    title: 'comment.studentFlow.s4.title',
    desc: 'comment.studentFlow.s4.desc',
    example: 'comment.studentFlow.s4.example',
    time: 'comment.studentFlow.s4.time',
  },
  {
    n: '05',
    title: 'comment.studentFlow.s5.title',
    desc: 'comment.studentFlow.s5.desc',
    example: 'comment.studentFlow.s5.example',
    time: 'comment.studentFlow.s5.time',
  },
]

const OWNER_FLOW: FlowStep[] = [
  {
    n: '01',
    title: 'comment.ownerFlow.s1.title',
    desc: 'comment.ownerFlow.s1.desc',
    example: 'comment.ownerFlow.s1.example',
    time: 'comment.ownerFlow.s1.time',
  },
  {
    n: '02',
    title: 'comment.ownerFlow.s2.title',
    desc: 'comment.ownerFlow.s2.desc',
    example: 'comment.ownerFlow.s2.example',
    time: 'comment.ownerFlow.s2.time',
  },
  {
    n: '03',
    title: 'comment.ownerFlow.s3.title',
    desc: 'comment.ownerFlow.s3.desc',
    example: 'comment.ownerFlow.s3.example',
    time: 'comment.ownerFlow.s3.time',
  },
  {
    n: '04',
    title: 'comment.ownerFlow.s4.title',
    desc: 'comment.ownerFlow.s4.desc',
    example: 'comment.ownerFlow.s4.example',
    time: 'comment.ownerFlow.s4.time',
  },
  {
    n: '05',
    title: 'comment.ownerFlow.s5.title',
    desc: 'comment.ownerFlow.s5.desc',
    example: 'comment.ownerFlow.s5.example',
    time: 'comment.ownerFlow.s5.time',
  },
]

export function CommentClient() {
  const t = useT()
  const [audience, setAudience] = useState<Audience>('student')
  const steps = audience === 'student' ? STUDENT_FLOW : OWNER_FLOW

  return (
    <>
      <section className="bg-background pb-12 text-center lg:pb-14">
        <div className="mx-auto max-w-[920px] px-6 lg:px-10">
          <div
            role="tablist"
            aria-label={t('comment.eyebrow')}
            className="inline-flex rounded-xl p-1"
          >
            <button
              type="button"
              role="tab"
              id="comment-tab-student"
              aria-selected={audience === 'student'}
              aria-controls="comment-panel"
              onClick={() => setAudience('student')}
              className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg px-4 text-[13.5px] font-semibold transition ${audience === 'student'
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground/70 hover:text-foreground'
                }`}
            >
              {t('comment.audience.student')}
            </button>
            <button
              type="button"
              role="tab"
              id="comment-tab-owner"
              aria-selected={audience === 'owner'}
              aria-controls="comment-panel"
              onClick={() => setAudience('owner')}
              className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg px-4 text-[13.5px] font-semibold transition ${audience === 'owner'
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground/70 hover:text-foreground'
                }`}
            >
              {t('comment.audience.owner')}
            </button>
          </div>
        </div>
      </section>

      <section
        role="tabpanel"
        id="comment-panel"
        aria-labelledby={
          audience === 'student' ? 'comment-tab-student' : 'comment-tab-owner'
        }
        className="bg-background py-12 lg:py-16"
      >
        <div className="mx-auto max-w-[1100px] px-6 lg:px-10">
          <ol className="relative">
            {/* Vertical line connecting the bubbles. The bubble's
                opaque `bg-secondary` masks the line inside each
                bubble — no need for ring-background tricks. */}
            <span
              aria-hidden
              className="absolute inset-y-0 left-[21px] w-px bg-border lg:left-1/2 lg:-translate-x-1/2"
            />
            {steps.map((s, i) => {
              const isLeft = i % 2 === 0
              return (
                <li
                  key={s.n}
                  className="relative grid grid-cols-[44px_minmax(0,1fr)] gap-x-5 pb-14 last:pb-0 lg:grid-cols-[minmax(0,1fr)_64px_minmax(0,1fr)] lg:gap-x-10"
                >
                  {/* Number bubble — col-1 on mobile, col-2 (center) on lg.
                      `bg-secondary` is opaque so the vertical line is
                      hidden inside the bubble (line drawn behind via
                      z-index). */}
                  <div className="col-start-1 row-start-1 flex justify-center lg:col-start-2">
                    <span className="relative z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-secondary font-mono text-[12px] font-bold text-primary">
                      {s.n}
                    </span>
                  </div>
                  {/* Step content — col-2 on mobile, alternates col-1/col-3 on lg. */}
                  <article
                    className={`col-start-2 row-start-1 ${
                      isLeft ? 'lg:col-start-1' : 'lg:col-start-3'
                    }`}
                  >
                    <div
                      className={`mb-2 flex flex-wrap items-center gap-3 ${
                        isLeft ? 'lg:flex-row-reverse' : ''
                      }`}
                    >
                      <h2
                        className={`m-0 flex-1 text-[22px] font-bold leading-[1.2] tracking-[-0.015em] text-foreground ${
                          isLeft ? 'lg:text-right' : ''
                        }`}
                      >
                        {t(s.title)}
                      </h2>
                      <span className="rounded-full bg-muted/60 px-2.5 py-1 font-mono text-[12px] font-semibold text-muted-foreground">
                        {t(s.time)}
                      </span>
                    </div>
                    <p
                      className={`mb-3.5 text-[15.5px] leading-[1.6] text-foreground/70 ${
                        isLeft ? 'lg:text-right' : ''
                      }`}
                    >
                      {t(s.desc)}
                    </p>
                    <div
                      className={`rounded-lg bg-muted/40 px-4 py-3 text-[13.5px] leading-[1.55] text-foreground/70 ${
                        isLeft ? 'lg:text-right' : ''
                      }`}
                    >
                      {t(s.example)}
                    </div>
                  </article>
                </li>
              )
            })}
          </ol>
        </div>
      </section>

    </>
  )
}

