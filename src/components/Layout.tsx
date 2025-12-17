import { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
}

function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  )
}

export default Layout

