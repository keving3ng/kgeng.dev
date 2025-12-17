import { Link } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

interface PageHeaderProps {
  title: string
  subtitle?: string
  showBackLink?: boolean
}

export default function PageHeader({ title, subtitle, showBackLink = true }: PageHeaderProps) {
  return (
    <header className="mb-8">
      <div className="flex justify-between items-start">
        <div>
          {showBackLink && (
            <Link
              to="/"
              className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-4 transition-colors"
            >
              ← back
            </Link>
          )}
          <h1 className="text-2xl font-medium text-gray-900 dark:text-gray-100">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        <ThemeToggle />
      </div>
    </header>
  )
}
