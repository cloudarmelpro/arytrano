'use client'

import { useState } from 'react'
import { motion, AnimatePresence, MotionConfig } from 'motion/react'
import { Icon } from '@/components/shared/Icon'

type FaqItem = {
  question: string
  answer: string
}

/**
 * Owner-page FAQ accordion. Mirrors `LandingFaqAccordion` (motion-
 * driven height + plus-icon rotation, only one item open at a time)
 * but uses the no-border / `bg-muted/40 → bg-muted/70` styling that
 * matches the rest of /proprietaires.
 *
 * The outer `Faq` server component still emits the FAQPage JSON-LD
 * from the route so this client island is purely the interaction
 * layer — Google's rich results survive even without JS.
 */
export function ProprietairesFaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <MotionConfig reducedMotion="user">
    <ul className="flex flex-col gap-2">
      {items.map((it, i) => {
        const isOpen = openIndex === i
        return (
          <li key={i}>
            <motion.div
              animate={{
                backgroundColor: isOpen
                  ? 'oklch(0.97 0.006 256 / 0.7)'
                  : 'oklch(0.97 0.006 256 / 0.4)',
              }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              className="rounded-2xl p-5"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                aria-expanded={isOpen}
                aria-controls={`pro-faq-panel-${i}`}
                id={`pro-faq-trigger-${i}`}
                className="flex w-full cursor-pointer items-center justify-between gap-4 text-left"
              >
                <span className="text-[15.5px] font-semibold text-foreground">
                  {it.question}
                </span>
                <motion.span
                  aria-hidden
                  animate={{
                    rotate: isOpen ? 45 : 0,
                    backgroundColor: isOpen
                      ? 'oklch(0.524 0.241 277)'
                      : 'oklch(1 0 0)',
                    color: isOpen ? '#ffffff' : 'oklch(0.55 0.01 277)',
                  }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                >
                  <Icon name="plus" size={16} />
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.section
                    key="content"
                    id={`pro-faq-panel-${i}`}
                    role="region"
                    aria-labelledby={`pro-faq-trigger-${i}`}
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
                    <p className="mt-3 whitespace-pre-wrap text-[14.5px] leading-[1.6] text-foreground/70">
                      {it.answer}
                    </p>
                  </motion.section>
                )}
              </AnimatePresence>
            </motion.div>
          </li>
        )
      })}
    </ul>
    </MotionConfig>
  )
}
