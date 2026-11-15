import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import TerminalPrompt from '../components/TerminalPrompt'
import { useGoBack, useTerminalNav } from '../hooks/useTerminalNav'
import { findProject } from '../config/projects'
import { buildIndexRows, formatShortDate } from '../config/indexRows'
import { paths } from '../config/paths'

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>()
  const project = findProject(slug)
  const goBack = useGoBack(paths.home)

  useTerminalNav({
    filters: ['project'],
    activeFilter: 'project',
    onFilterChange: () => {},
    itemCount: 0,
    onActivate: () => {},
    onBack: goBack,
  })

  const promptRows = useMemo(() => buildIndexRows([]), [])

  return (
    <div className="font-mono pb-12">
      <SiteHeader currentSegment={project?.name ?? slug} />

      <main className="px-2 md:px-0">
        {!project ? (
          <div className="space-y-4 text-sm">
            <p className="text-content-muted">cat: {slug}: no such project</p>
            <Link to={paths.home} className="inline-block text-content hover:text-content-secondary transition-colors">
              ← back to index
            </Link>
          </div>
        ) : (
          <article className="space-y-6">
            <header className="space-y-2 border-b border-border pb-4">
              <div className="flex items-start gap-4">
                {project.asciiIcon && (
                  <pre
                    aria-hidden="true"
                    className="text-xs leading-tight text-content-muted select-none shrink-0"
                  >
                    {project.asciiIcon}
                  </pre>
                )}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="text-xl font-medium text-content">{project.name}</h2>
                    {project.updatedAt && (
                      <span className="text-xs text-content-muted">
                        updated {formatShortDate(project.updatedAt)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-content-secondary">{project.description}</p>
                </div>
              </div>
              {(project.url || project.repo || (project.stack && project.stack.length > 0)) && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-content-muted">
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-content hover:text-content-secondary transition-colors"
                    >
                      visit ↗
                    </a>
                  )}
                  {project.repo && (
                    <a
                      href={project.repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-content hover:text-content-secondary transition-colors"
                    >
                      source ↗
                    </a>
                  )}
                  {project.stack?.map((tech) => (
                    <span key={tech}>#{tech}</span>
                  ))}
                </div>
              )}
            </header>

            {project.note && (
              <p className="text-sm text-content-secondary leading-relaxed">{project.note}</p>
            )}

            {project.body?.map((paragraph, i) => (
              <p key={i} className="text-sm text-content-secondary leading-relaxed">
                {paragraph}
              </p>
            ))}

            {project.highlights && project.highlights.length > 0 && (
              <section className="space-y-2">
                <h3 className="text-xs text-content-muted">highlights</h3>
                <ul className="space-y-1 text-sm text-content-secondary">
                  {project.highlights.map((item, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-content-muted">-</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </article>
        )}

        <div className="mt-8 border-t border-border pt-3 space-y-2">
          <p className="hidden md:block text-xs text-content-muted">esc back</p>
          <TerminalPrompt rows={promptRows} />
        </div>
      </main>
    </div>
  )
}
