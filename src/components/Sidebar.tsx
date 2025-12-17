interface SidebarProps {
  filters: string[]
  activeFilter: string | null
  onFilterChange: (filter: string | null) => void
  links: { label: string; url: string }[]
  tools: { label: string; url: string }[]
}

function Sidebar({ filters, activeFilter, onFilterChange, links, tools }: SidebarProps) {
  return (
    <aside className="w-48 border-r border-gray-200 dark:border-gray-800 shrink-0">
      <div className="p-6 space-y-6">
        {/* Filters */}
        <div>
          <div className="space-y-2">
            {filters.map((filter) => {
              const isActive = filter === 'All Posts'
                ? activeFilter === null
                : activeFilter === filter

              return (
                <button
                  key={filter}
                  onClick={() => onFilterChange(filter === 'All Posts' ? null : filter)}
                  className={`block w-full text-left text-sm py-1 transition-colors ${
                    isActive
                      ? 'text-gray-900 dark:text-gray-100 font-medium'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {filter.toLowerCase()}
                </button>
              )
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-800"></div>

        {/* Tools */}
        <div className="space-y-2">
          {tools.map((tool) => (
            <a
              key={tool.url}
              href={tool.url}
              className="block text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              {tool.label}
            </a>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-800"></div>

        {/* Links */}
        <div className="space-y-2">
          {links.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              {link.label.toLowerCase()} ↗
            </a>
          ))}
        </div>
      </div>
    </aside>
  )
}

export default Sidebar

