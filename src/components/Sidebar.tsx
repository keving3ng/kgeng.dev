import { useState } from 'react'
import { Link } from 'react-router-dom'

interface SidebarProps {
  filters: string[]
  activeFilter: string | null
  onFilterChange: (filter: string | null) => void
  links: { label: string; url: string }[]
  tools: { label: string; url: string }[]
  lists?: { label: string; url: string }[]
}

// Mobile bottom sheet
export function MobileNav({
  filters,
  activeFilter,
  onFilterChange,
  links,
  tools,
  lists = [],
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleFilterClick = (filter: string) => {
    onFilterChange(filter === 'All Posts' ? null : filter)
    setIsOpen(false)
  }

  const activeLabel = activeFilter?.toLowerCase() || 'all posts'

  return (
    <div className="md:hidden px-2">
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="text-sm text-gray-500 dark:text-gray-400 mb-4"
      >
        filter: <span className="text-gray-900 dark:text-gray-100">{activeLabel}</span> ↓
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Bottom sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 rounded-t-2xl z-50 transition-transform duration-300 ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="p-6 pb-8 max-h-[70vh] overflow-y-auto">
          {/* Handle */}
          <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-6" />

          {/* Filters */}
          <div className="space-y-2 mb-6">
            {filters.map((filter) => {
              const isActive =
                filter === 'All Posts' ? activeFilter === null : activeFilter === filter

              return (
                <button
                  key={filter}
                  onClick={() => handleFilterClick(filter)}
                  className={`block w-full text-left text-sm py-2 transition-colors ${
                    isActive
                      ? 'text-gray-900 dark:text-gray-100 font-medium'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {filter.toLowerCase()}
                </button>
              )
            })}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-800 my-4" />

          {/* Lists */}
          {lists.length > 0 && (
            <>
              <div className="space-y-2 mb-4">
                {lists.map((list) => (
                  <Link
                    key={list.url}
                    to={list.url}
                    onClick={() => setIsOpen(false)}
                    className="block text-sm text-gray-500 dark:text-gray-400 py-1"
                  >
                    {list.label}
                  </Link>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 dark:border-gray-800 my-4" />
            </>
          )}

          {/* Links */}
          <div className="space-y-2 mb-4">
            {links.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-gray-500 dark:text-gray-400 py-1"
              >
                {link.label.toLowerCase()} ↗
              </a>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-800 my-4" />

          {/* Tools */}
          <div className="space-y-2">
            {tools.map((tool) => (
              <Link
                key={tool.url}
                to={tool.url}
                onClick={() => setIsOpen(false)}
                className="block text-sm text-gray-500 dark:text-gray-400 py-1"
              >
                {tool.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Desktop sidebar
function Sidebar({ filters, activeFilter, onFilterChange, links, tools, lists = [] }: SidebarProps) {
  return (
    <aside className="hidden md:block w-48 border-r border-gray-200 dark:border-gray-800 shrink-0">
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

        {/* Lists */}
        {lists.length > 0 && (
          <>
            <div className="space-y-2">
              {lists.map((list) => (
                <Link
                  key={list.url}
                  to={list.url}
                  className="block text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  {list.label}
                </Link>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-800"></div>
          </>
        )}

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

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-800"></div>

        {/* Tools */}
        <div className="space-y-2">
          {tools.map((tool) => (
            <Link
              key={tool.url}
              to={tool.url}
              className="block text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              {tool.label}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  )
}

export default Sidebar

