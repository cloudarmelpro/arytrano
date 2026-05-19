'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useT } from '@/lib/i18n/client'
import { Icon, type IconName } from '@/components/shared/Icon'
import type { MessageKey } from '@/lib/i18n/messages'

type Audience = 'student' | 'owner'

type FlowStep = {
  n: string
  icon: IconName
  title: MessageKey
  desc: MessageKey
  example: MessageKey
  time: MessageKey
}

const STUDENT_FLOW: FlowStep[] = [
  {
    n: '01',
    icon: 'search',
    title: 'comment.studentFlow.s1.title',
    desc: 'comment.studentFlow.s1.desc',
    example: 'comment.studentFlow.s1.example',
    time: 'comment.studentFlow.s1.time',
  },
  {
    n: '02',
    icon: 'shield',
    title: 'comment.studentFlow.s2.title',
    desc: 'comment.studentFlow.s2.desc',
    example: 'comment.studentFlow.s2.example',
    time: 'comment.studentFlow.s2.time',
  },
  {
    n: '03',
    icon: 'whatsapp',
    title: 'comment.studentFlow.s3.title',
    desc: 'comment.studentFlow.s3.desc',
    example: 'comment.studentFlow.s3.example',
    time: 'comment.studentFlow.s3.time',
  },
  {
    n: '04',
    icon: 'pin',
    title: 'comment.studentFlow.s4.title',
    desc: 'comment.studentFlow.s4.desc',
    example: 'comment.studentFlow.s4.example',
    time: 'comment.studentFlow.s4.time',
  },
  {
    n: '05',
    icon: 'check',
    title: 'comment.studentFlow.s5.title',
    desc: 'comment.studentFlow.s5.desc',
    example: 'comment.studentFlow.s5.example',
    time: 'comment.studentFlow.s5.time',
  },
]

const OWNER_FLOW: FlowStep[] = [
  {
    n: '01',
    icon: 'plus',
    title: 'comment.ownerFlow.s1.title',
    desc: 'comment.ownerFlow.s1.desc',
    example: 'comment.ownerFlow.s1.example',
    time: 'comment.ownerFlow.s1.time',
  },
  {
    n: '02',
    icon: 'shield',
    title: 'comment.ownerFlow.s2.title',
    desc: 'comment.ownerFlow.s2.desc',
    example: 'comment.ownerFlow.s2.example',
    time: 'comment.ownerFlow.s2.time',
  },
  {
    n: '03',
    icon: 'house',
    title: 'comment.ownerFlow.s3.title',
    desc: 'comment.ownerFlow.s3.desc',
    example: 'comment.ownerFlow.s3.example',
    time: 'comment.ownerFlow.s3.time',
  },
  {
    n: '04',
    icon: 'eye',
    title: 'comment.ownerFlow.s4.title',
    desc: 'comment.ownerFlow.s4.desc',
    example: 'comment.ownerFlow.s4.example',
    time: 'comment.ownerFlow.s4.time',
  },
  {
    n: '05',
    icon: 'whatsapp',
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
            className="inline-flex rounded-full border border-border bg-muted/40 p-1"
          >
            <button
              type="button"
              role="tab"
              id="comment-tab-student"
              aria-selected={audience === 'student'}
              aria-controls="comment-panel"
              onClick={() => setAudience('student')}
              className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-full px-4 text-[13.5px] font-semibold transition ${
                audience === 'student'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground/70 hover:text-foreground'
              }`}
            >
              <Icon name="house" size={15} /> {t('comment.audience.student')}
            </button>
            <button
              type="button"
              role="tab"
              id="comment-tab-owner"
              aria-selected={audience === 'owner'}
              aria-controls="comment-panel"
              onClick={() => setAudience('owner')}
              className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-full px-4 text-[13.5px] font-semibold transition ${
                audience === 'owner'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground/70 hover:text-foreground'
              }`}
            >
              <Icon name="check" size={15} /> {t('comment.audience.owner')}
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
        <ol className="mx-auto flex max-w-[1280px] flex-col gap-8 px-6 lg:px-10">
          {steps.map((s, i) => (
            <li key={s.n}>
              <article className="grid grid-cols-[60px_1fr] gap-6 max-sm:grid-cols-[44px_1fr] max-sm:gap-4">
                <div className="flex flex-col items-center">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 font-mono text-[12px] font-bold text-primary">
                    {s.n}
                  </span>
                  {i < steps.length - 1 && (
                    <span aria-hidden className="mt-2 w-px flex-1 bg-border" />
                  )}
                </div>
                <div className="pb-8">
                  <div className="mb-2 flex flex-wrap items-center gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] bg-primary/10 text-primary">
                      <Icon name={s.icon} size={18} />
                    </span>
                    <h2 className="m-0 flex-1 text-[22px] font-bold leading-[1.2] tracking-[-0.015em] text-foreground">
                      {t(s.title)}
                    </h2>
                    <span className="rounded-full bg-muted/60 px-2.5 py-1 font-mono text-[12px] font-semibold text-muted-foreground">
                      {t(s.time)}
                    </span>
                  </div>
                  <p className="mb-3.5 text-[15.5px] leading-[1.6] text-foreground/70">
                    {t(s.desc)}
                  </p>
                  <div className="rounded-r-lg border-l-[3px] border-primary bg-muted/40 px-4 py-3 text-[13.5px] leading-[1.55] text-foreground/70">
                    <span className="font-bold text-foreground">→ </span>
                    {t(s.example)}
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ol>
      </section>

      <FinalCta audience={audience} />
    </>
  )
}

function FinalCta({ audience }: { audience: Audience }) {
  const t = useT()
  const titleKey =
    audience === 'student' ? 'comment.finalCta.student.title' : 'comment.finalCta.owner.title'
  const leadKey =
    audience === 'student' ? 'comment.finalCta.student.lead' : 'comment.finalCta.owner.lead'
  const ctaKey =
    audience === 'student' ? 'comment.finalCta.student.cta' : 'comment.finalCta.owner.cta'
  const href = audience === 'student' ? '/annonces' : '/proprietaires'
  return (
    <section className="bg-background pb-16 lg:pb-20">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="rounded-[28px] bg-[oklch(0.16_0.025_281)] px-8 py-14 text-center text-white sm:px-12 lg:py-16">
          <h2 className="m-0 font-serif text-[clamp(28px,3.4vw,44px)] font-normal leading-[1.05] tracking-[-0.025em]">
            {t(titleKey)}
          </h2>
          <p className="mx-auto mb-6 mt-3 max-w-[560px] text-[15.5px] leading-[1.55] text-white/80">
            {t(leadKey)}
          </p>
          <Link
            href={href}
            className="inline-flex h-13 items-center gap-2 rounded-xl bg-white px-6 text-[15px] font-semibold text-primary transition hover:bg-[oklch(0.97_0.012_90)]"
          >
            {t(ctaKey)} <Icon name="arrow-right" size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}
