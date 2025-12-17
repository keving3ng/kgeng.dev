import { useState } from 'react'

interface NewsfeedItem {
  id: string
  title: string
  content: string
  date: string
  category: string
}

interface NewsfeedProps {
  items: NewsfeedItem[]
  activeFilter: string | null
}

function Newsfeed({ items, activeFilter }: NewsfeedProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set(items.map((item) => item.id))
  )

  const toggleItem = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const filteredItems = activeFilter
    ? items.filter((item) => item.category === activeFilter)
    : items

  if (filteredItems.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500 dark:text-gray-400">
        No posts found.
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {filteredItems.map((item) => {
        const isExpanded = expandedItems.has(item.id)

        return (
          <article
            key={item.id}
            className="border-b border-gray-200 dark:border-gray-800 py-6 px-6"
          >
            <div className="max-w-2xl">
              <button
                onClick={() => toggleItem(item.id)}
                className="w-full text-left flex items-start gap-2 group"
              >
                <span className={`text-gray-400 dark:text-gray-500 mt-1 transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                  ›
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-medium group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                      {item.title}
                    </h2>
                    <span className="text-xs text-gray-400 dark:text-gray-500 lowercase">
                      {item.category}
                    </span>
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="ml-5 mt-3">
                  <div className="text-xs text-gray-400 dark:text-gray-500 mb-2">
                    {item.date}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {item.content}
                  </p>
                </div>
              )}
            </div>
          </article>
        )
      })}
    </div>
  )
}

export default Newsfeed

