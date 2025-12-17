import { useState, useMemo } from 'react'
import Sidebar from '../components/Sidebar'
import Newsfeed from '../components/Newsfeed'
import { usePosts } from '../hooks/usePosts'
import { socialLinks, tools, lists } from '../config/navigation'

function Blog() {
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const { posts, loading, error } = usePosts()

  // Derive filters from post tags
  const filters = useMemo(() => {
    const tagSet = new Set<string>()
    posts.forEach((post) => {
      post.tags.forEach((tag) => tagSet.add(tag))
    })
    return ['All Posts', ...Array.from(tagSet).sort()]
  }, [posts])

  const handleFilterChange = (filter: string | null) => {
    setActiveFilter(filter === 'All Posts' ? null : filter)
  }

  return (
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
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            Loading posts...
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-500 dark:text-red-400">
            {error}
          </div>
        ) : (
          <Newsfeed items={posts} activeFilter={activeFilter} />
        )}
      </main>
    </div>
  )
}

export default Blog
