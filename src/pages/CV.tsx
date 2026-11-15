import SiteHeader from '../components/SiteHeader'
import TerminalPrompt from '../components/TerminalPrompt'
import { contact, education, experiences, skills } from '../config/cv'
import { paths } from '../config/paths'
import { usePromptRows } from '../hooks/usePromptRows'
import { useGoBack, useTerminalNav } from '../hooks/useTerminalNav'

export default function CV() {
  const goBack = useGoBack(paths.about)

  useTerminalNav({
    filters: ['cv'],
    activeFilter: 'cv',
    onFilterChange: () => {},
    itemCount: 0,
    onActivate: () => {},
    onBack: goBack,
  })

  const promptRows = usePromptRows()

  return (
    <div className="font-mono pb-12">
      <SiteHeader />

      <main className="px-2 md:px-0 space-y-6 text-sm">
        <section className="space-y-2">
          <h2 className="text-xs text-content-muted">experience</h2>
          <div className="border-t border-border">
            {experiences.map((exp) => (
              <div
                key={`${exp.company}-${exp.startDate}`}
                className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-border py-2.5"
              >
                <div className="min-w-0">
                  <span className="font-medium text-content">{exp.company.toLowerCase()}</span>
                  <span className="text-content-muted"> — </span>
                  <span className="text-content-secondary">{exp.role.toLowerCase()}</span>
                </div>
                <span className="text-xs text-content-muted shrink-0">
                  {exp.startDate.toLowerCase()}
                  {exp.current ? ' - present' : exp.endDate ? ` - ${exp.endDate.toLowerCase()}` : ''}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-xs text-content-muted">education</h2>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-y border-border py-2.5">
            <div className="min-w-0">
              <span className="font-medium text-content">{education.school.toLowerCase()}</span>
              <span className="text-content-muted"> — </span>
              <span className="text-content-secondary">{education.degree.toLowerCase()}</span>
            </div>
            <span className="text-xs text-content-muted shrink-0">
              {education.startYear} - {education.endYear}
            </span>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-xs text-content-muted">skills</h2>
          <div className="space-y-1.5 border-t border-border pt-2.5">
            {Object.entries(skills).map(([category, items]) => (
              <div key={category} className="flex flex-wrap gap-2">
                <span className="w-20 shrink-0 text-content-muted">{category}</span>
                <span className="text-content-secondary">{items.join(', ').toLowerCase()}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-xs text-content-muted">contact</h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-2.5">
            <a
              href={`mailto:${contact.email}`}
              className="text-content-secondary hover:text-content transition-colors"
            >
              {contact.email}
            </a>
            <a
              href={contact.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-content-secondary hover:text-content transition-colors"
            >
              github ↗
            </a>
            <a
              href={contact.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-content-secondary hover:text-content transition-colors"
            >
              linkedin ↗
            </a>
          </div>
        </section>

        <div className="mt-8 border-t border-border pt-3 space-y-2">
          <p className="hidden md:block text-xs text-content-muted">esc back</p>
          <TerminalPrompt rows={promptRows} />
        </div>
      </main>
    </div>
  )
}
