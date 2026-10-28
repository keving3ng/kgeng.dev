import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

interface PostFilterProps {
  filters: string[]
  activeFilter: string | null
  onFilterChange: (filter: string | null) => void
}

interface SidebarProps extends PostFilterProps {
  links: { label: string; url: string }[]
  tools: { label: string; url: string }[]
  lists?: { label: string; url: string }[]
}

// Article-only mobile menu
export function MobilePostFilters({
  filters,
  activeFilter,
  onFilterChange,
}: PostFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!isOpen) return

    const dismissOutside = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    const dismissOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setIsOpen(false)
      triggerRef.current?.focus()
    }

    document.addEventListener('pointerdown', dismissOutside)
    document.addEventListener('keydown', dismissOnEscape)
    return () => {
      document.removeEventListener('pointerdown', dismissOutside)
      document.removeEventListener('keydown', dismissOnEscape)
    }
  }, [isOpen])

  const handleFilterClick = (filter: string) => {
    onFilterChange(filter === 'All Posts' ? null : filter)
    setIsOpen(false)
    triggerRef.current?.focus()
  }

  const activeLabel = activeFilter?.toLowerCase() || 'all posts'

  return (
    <div className="md:hidden flex justify-end px-2 mb-2">
      <div ref={menuRef} className="relative">
        <button
          ref={triggerRef}
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-controls={menuId}
          className="min-h-10 px-2 text-xs text-content-muted hover:text-content-secondary transition-colors rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-content-muted"
        >
          filter: {activeLabel} <span aria-hidden="true">⌄</span>
        </button>
        {isOpen && (
          <div
            id={menuId}
            role="group"
            aria-label="article filters"
            className="absolute right-0 top-full z-30 mt-1 min-w-40 max-h-[60vh] overflow-y-auto rounded-lg border border-border bg-surface-secondary p-2 shadow-sm"
          >
            {filters.map((filter) => {
              const isActive =
                filter === 'All Posts' ? activeFilter === null : activeFilter === filter

              return (
                <button
                  key={filter}
                  onClick={() => handleFilterClick(filter)}
                  aria-pressed={isActive}
                  className={`block w-full text-left text-sm px-3 py-2 rounded transition-colors hover:bg-surface ${
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
        )}
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

