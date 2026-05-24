import type { ReactNode } from 'react'
import { Header } from '@/components/shared/Header'
import { Footer } from '@/components/shared/Footer'

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main id="main" className="flex-1">{children}</main>
      <Footer />
    </>
  )
}
