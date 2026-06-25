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
 * closes any sibling. Motion animates body height + the plus icon
 * rotation. Timings shortened (0.55s → 0.32s) for a snappier feel.
 *
 * Visual DNA aligned with the Students / HowItWorks cards :
 * ring-1 ring-border/60 + soft shadow (no hard border), brand
 * primary chip for the Q-number, primary indigo accent on open.
 */
export function LandingFaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="flex flex-col gap-3">
      {items.map((it, i) => {
        const isOpen = openIndex === i
        return (
          <div
            key={i}
            className={`rounded-2xl bg-white p-5 transition-all duration-300 ${
              isOpen
                ? 'shadow-[0_2px_4px_rgba(16,18,40,0.05),0_16px_36px_-18px_rgba(25,25,112,0.22)] ring-1 ring-primary/30'
                : 'shadow-[0_1px_2px_rgba(16,18,40,0.04),0_8px_24px_-16px_rgba(16,18,40,0.08)] ring-1 ring-border/60 hover:ring-primary/25'
            }`}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
              aria-controls={`faq-panel-${i}`}
              id={`faq-trigger-${i}`}
              className="flex w-full cursor-pointer items-center gap-4 text-left"
            >
              {/* Q-number chip — brand primary, flips bold on open */}
              <span
                className={`inline-flex h-8 shrink-0 items-center justify-center rounded-lg px-2.5 font-mono text-[11.5px] font-bold tracking-[0.04em] ring-1 transition-colors duration-300 ${
                  isOpen
                    ? 'bg-primary text-primary-foreground ring-primary'
                    : 'bg-primary/[0.08] text-primary ring-primary/0'
                }`}
              >
                Q{String(i + 1).padStart(2, '0')}
              </span>

              <span
                className={`flex-1 text-[15.5px] font-semibold leading-[1.4] tracking-[-0.005em] transition-colors duration-300 ${
                  isOpen ? 'text-foreground' : 'text-foreground/85'
                }`}
              >
                {it.question}
              </span>

              {/* + → × via 45° rotate. Tightened animation timing for
                  a snappier UX (was 0.5s — felt sluggish). */}
              <motion.span
                aria-hidden
                animate={{
                  rotate: isOpen ? 45 : 0,
                  backgroundColor: isOpen
                    ? 'oklch(0.524 0.241 277)'
                    : 'oklch(0.97 0.006 277)',
                  color: isOpen ? '#ffffff' : 'oklch(0.45 0.01 277)',
                }}
                transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
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
                      height: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
                      opacity: { duration: 0.25, delay: 0.05 },
                    },
                  }}
                  exit={{
                    height: 0,
                    opacity: 0,
                    transition: {
                      height: { duration: 0.28, ease: [0.4, 0, 0.2, 1] },
                      opacity: { duration: 0.15 },
                    },
                  }}
                  className="overflow-hidden"
                >
                  {/* Soft divider + indented answer aligned under the
                      question (offset = chip width + gap so it reads
                      like a margin note). */}
                  <div className="ml-[60px] mt-4 border-t border-border/60 pt-4">
                    <p className="whitespace-pre-wrap text-[14px] leading-[1.65] text-foreground/70">
                      {it.answer}
                    </p>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
