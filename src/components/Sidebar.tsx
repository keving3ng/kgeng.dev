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
        className="text-sm text-content-muted mb-4"
      >
        filter: <span className="text-content">{activeLabel}</span> ↓
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Bottom sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-surface-secondary border-t border-border rounded-t-2xl z-50 transition-transform duration-300 ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="p-6 pb-8 max-h-[70vh] overflow-y-auto">
          {/* Handle */}
          <div className="w-10 h-1 bg-content-muted/50 rounded-full mx-auto mb-6" />

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
                      ? 'text-content font-medium'
                      : 'text-content-muted'
                  }`}
                >
                  {filter.toLowerCase()}
                </button>
              )
            })}
          </div>

          {/* Divider */}
          <div className="border-t border-border my-4" />

          {/* Lists */}
          {lists.length > 0 && (
            <>
              <div className="space-y-2 mb-4">
                {lists.map((list) => (
                  <Link
                    key={list.url}
                    to={list.url}
                    onClick={() => setIsOpen(false)}
                    className="block text-sm text-content-muted py-1"
                  >
                    {list.label}
                  </Link>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t border-border my-4" />
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
                className="block text-sm text-content-muted py-1"
              >
                {link.label.toLowerCase()} ↗
              </a>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-border my-4" />

          {/* Tools */}
          <div className="space-y-2">
            {tools.map((tool) => (
              <Link
                key={tool.url}
                to={tool.url}
                onClick={() => setIsOpen(false)}
                className="block text-sm text-content-muted py-1"
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
    <aside className="hidden md:block w-48 border-r border-border shrink-0">
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
                      ? 'text-content font-medium'
                      : 'text-content-muted hover:text-content-secondary'
                  }`}
                >
                  {filter.toLowerCase()}
                </button>
              )
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border"></div>

        {/* Lists */}
        {lists.length > 0 && (
          <>
            <div className="space-y-2">
              {lists.map((list) => (
                <Link
                  key={list.url}
                  to={list.url}
                  className="block text-sm text-content-muted hover:text-content-secondary transition-colors"
                >
                  {list.label}
                </Link>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-border"></div>
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
              className="block text-sm text-content-muted hover:text-content-secondary transition-colors"
            >
              {link.label.toLowerCase()} ↗
            </a>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-border"></div>

        {/* Tools */}
        <div className="space-y-2">
          {tools.map((tool) => (
            <Link
              key={tool.url}
              to={tool.url}
              className="block text-sm text-content-muted hover:text-content-secondary transition-colors"
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

