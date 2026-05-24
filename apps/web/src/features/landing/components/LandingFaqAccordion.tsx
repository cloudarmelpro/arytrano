'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Icon } from '@/components/shared/Icon'

type FaqItem = {
  question: string
  answer: string
}

/**
 * Interactive FAQ accordion. Lives in its own Client Component so the
 * outer `LandingFaq` (which generates the FAQPage JSON-LD) can stay
 * RSC and feed Google's rich-results regardless of client-side JS.
 *
 * Exclusive behavior: only one item open at a time — opening one
 * closes any sibling. Motion animates both the body height (smooth
 * easing) and the plus-icon rotation.
 */
export function LandingFaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="flex flex-col gap-2">
      {items.map((it, i) => {
        const isOpen = openIndex === i
        return (
          <div
            key={i}
            className={`rounded-2xl border bg-background p-5 transition-colors duration-300 ${
              isOpen
                ? 'border-primary/60 bg-muted/30'
                : 'border-border hover:border-primary/40'
            }`}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
              aria-controls={`faq-panel-${i}`}
              id={`faq-trigger-${i}`}
              className="flex w-full cursor-pointer items-start gap-5 text-left"
            >
              <span className="shrink-0 font-mono text-[12px] font-semibold tracking-[0.06em] text-primary">
                Q{String(i + 1).padStart(2, '0')}
              </span>
              <span className="flex-1 text-[16px] font-semibold leading-[1.4] text-foreground">
                {it.question}
              </span>
              <motion.span
                aria-hidden
                animate={{
                  rotate: isOpen ? 45 : 0,
                  backgroundColor: isOpen
                    ? 'oklch(0.524 0.241 277)'
                    : 'oklch(0.97 0.006 277)',
                  color: isOpen ? '#ffffff' : 'oklch(0.55 0.01 277)',
                }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
              >
                <Icon name="plus" size={16} />
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.section
                  key="content"
                  id={`faq-panel-${i}`}
                  role="region"
                  aria-labelledby={`faq-trigger-${i}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: 'auto',
                    opacity: 1,
                    transition: {
                      height: { duration: 0.55, ease: [0.4, 0, 0.2, 1] },
                      opacity: { duration: 0.4, delay: 0.1 },
                    },
                  }}
                  exit={{
                    height: 0,
                    opacity: 0,
                    transition: {
                      height: { duration: 0.45, ease: [0.4, 0, 0.2, 1] },
                      opacity: { duration: 0.2 },
                    },
                  }}
                  className="overflow-hidden"
                >
                  <p className="mt-3 whitespace-pre-wrap pl-12 text-[14px] leading-[1.6] text-foreground/70">
                    {it.answer}
                  </p>
                </motion.section>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
