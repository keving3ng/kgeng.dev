import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import TerminalPrompt from '../components/TerminalPrompt'
import { useGoBack, useTerminalNav } from '../hooks/useTerminalNav'
import { buildIndexRows } from '../config/indexRows'
import { paths } from '../config/paths'

function About() {
  const goBack = useGoBack(paths.home)

  useTerminalNav({
    filters: ['about'],
    activeFilter: 'about',
    onFilterChange: () => {},
    itemCount: 0,
    onActivate: () => {},
    onBack: goBack,
  })

  const promptRows = useMemo(() => buildIndexRows([]), [])

  return (
    <div className="font-mono flex flex-col md:h-[calc(100dvh-4rem)]">
      <SiteHeader />

      <div className="px-2 md:px-0 flex-1 min-h-0 flex flex-col justify-between">
        <div className="space-y-4 text-sm">
          <p className="text-content-secondary leading-relaxed">
            about page content coming soon...
          </p>
          <p>
            <Link to={paths.cv} className="text-content hover:text-content-secondary transition-colors">
              cv →
            </Link>
          </p>
        </div>

        <div className="shrink-0 mt-4 border-t border-border pt-3 space-y-2">
          <p className="hidden md:block text-xs text-content-muted">
            esc back
          </p>
          <TerminalPrompt rows={promptRows} />
        </div>
      </div>
    </div>
  )
}

export default About
