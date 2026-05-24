import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Header } from '@/components/shared/Header'
import { Footer } from '@/components/shared/Footer'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main id="main" className="flex-1 bg-background">
        <div className="mx-auto max-w-[480px] px-6 py-16 lg:py-20">
          {children}
        </div>
      </main>
      <Footer />
    </>
  )
}
