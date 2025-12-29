import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Newsfeed from '../components/Newsfeed'
import ThemeToggle from '../components/ThemeToggle'
import { usePosts } from '../hooks/usePosts'
import { usePostFilters } from '../hooks/usePostFilters'
import { socialLinks, tools, lists } from '../config/navigation'

function Blog() {
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const { posts, loading, error } = usePosts()
  const filters = usePostFilters(posts)

  const handleFilterChange = (filter: string | null) => {
    setActiveFilter(filter === 'All Posts' ? null : filter)
  }

  return (
    <div>
      <div className="flex justify-end mb-4 px-2">
        <ThemeToggle />
      </div>
      <div className="flex">
      <Sidebar
        filters={filters}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        links={socialLinks}
        tools={tools}
        lists={lists}
      />
      <main className="flex-1">
        {loading ? (
          <div className="text-center py-16 text-content-muted">
            Loading posts...
          </div>
        ) : error ? (
          <div className="text-center py-16 text-error">
            {error}
          </div>
        ) : (
          <Newsfeed items={posts} activeFilter={activeFilter} />
        )}
      </main>
      </div>
    </div>
  )
}

export default Blog
