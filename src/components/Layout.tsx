import { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
}

function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-surface flex justify-center pt-16 md:pt-24">
      <div className="w-full max-w-4xl mx-auto px-2 md:px-4">
        {children}
      </div>
    </div>
  )
}

export default Layout

