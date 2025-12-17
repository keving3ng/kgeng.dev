import PageHeader from '../components/PageHeader'

interface Project {
  name: string
  description: string
  url?: string
  note?: string
}

const projects: Project[] = [
  {
    name: 'matchamap',
    description: 'a community platform for matcha lovers.',
    url: 'https://matchamap.club',
    note: 'discover matcha spots, share reviews, and connect with fellow enthusiasts.',
  },
  {
    name: 'kgeng.dev',
    description: 'this site.',
    url: 'https://kgeng.dev',
    note: 'personal website and blog built with react, typescript, and cloudflare pages.',
  },
]

function Projects() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <PageHeader title="projects" subtitle="things i'm building." />

        <div className="space-y-6">
          {projects.map((project) => (
            <div
              key={project.name}
              className="border-l-2 border-gray-200 dark:border-gray-800 pl-4"
            >
              <div className="flex items-baseline gap-2">
                {project.url ? (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {project.name} ↗
                  </a>
                ) : (
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {project.name}
                  </span>
                )}
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  — {project.description}
                </span>
              </div>
              {project.note && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {project.note}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Projects
