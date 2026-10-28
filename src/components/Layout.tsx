import { ReactNode } from 'react'
import MobileSiteNav from './MobileSiteNav'

interface LayoutProps {
  children: ReactNode
}

function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen min-h-[100dvh] bg-surface flex justify-center pt-8 md:pt-24 pb-8 overflow-x-hidden w-full">
      <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 md:px-4">
        <MobileSiteNav />
        {children}
      </div>
    </div>
  )
}

export default Layout

