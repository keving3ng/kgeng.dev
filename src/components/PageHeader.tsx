import { Link } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import { paths } from '../config/paths'

interface PageHeaderProps {
  title: string
  subtitle?: string
  showBackLink?: boolean
  /** Defaults to home; use for nested hubs (e.g. games). */
  backTo?: string
  backLabel?: string
}

export default function PageHeader({
  title,
  subtitle,
  showBackLink = true,
  backTo = paths.home,
  backLabel = '← back',
}: PageHeaderProps) {
  return (
    <header className="mb-8">
      <div className="flex justify-between items-start">
        <div>
          {showBackLink && (
            <Link
              to={backTo}
              className="inline-flex items-center text-sm text-content-muted hover:text-content-secondary mb-4 transition-colors"
            >
              {backLabel}
            </Link>
          )}
          <h1 className="text-2xl font-medium text-content">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-content-muted mt-1">
              {subtitle}
            </p>
          )}
        </div>
        <ThemeToggle />
      </div>
    </header>
  )
}
