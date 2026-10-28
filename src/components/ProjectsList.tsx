import { projects } from '../config/projects'

export default function ProjectsList() {
  return (
    <div className="px-2 md:px-0 pb-16">
      <div className="space-y-6">
        {projects.map((project) => (
          <div
            key={project.name}
            className="border-l-2 border-border pl-4"
          >
            <div className="flex items-baseline gap-2">
              {project.url ? (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-content hover:text-content-secondary transition-colors"
                >
                  {project.name} ↗
                </a>
              ) : (
                <span className="text-sm font-medium text-content">
                  {project.name}
                </span>
              )}
              <span className="text-sm text-content-muted">
                — {project.description}
              </span>
            </div>
            {project.note && (
              <p className="text-sm text-content-muted mt-1">
                {project.note}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
