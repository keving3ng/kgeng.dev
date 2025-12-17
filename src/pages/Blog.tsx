import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Newsfeed from '../components/Newsfeed'
import { usePosts } from '../hooks/usePosts'

const filters = ['All Posts', 'Code', 'Bake', 'Eat', 'Travel', 'Pottery']
const links = [
  { label: 'GitHub', url: 'https://github.com/keving3ng' },
  { label: 'Twitter', url: 'https://twitter.com/keving3ng' },
  { label: 'LinkedIn', url: 'https://linkedin.com/in/keving3ng' },
]
const tools = [{ label: 'splits', url: '/tools/splits' }]

function Blog() {
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const { posts, loading, error } = usePosts()

  const handleFilterChange = (filter: string | null) => {
    setActiveFilter(filter === 'All Posts' ? null : filter)
  }

  return (
    <div className="flex">
      <Sidebar
        filters={filters}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        links={links}
        tools={tools}
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
