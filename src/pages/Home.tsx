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

function Home() {
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const { posts, loading, error } = usePosts()

  const handleFilterChange = (filter: string | null) => {
    setActiveFilter(filter === 'All Posts' ? null : filter)
  }

  return (
    <div>
      {/* Header */}
      <header className="mt-4 mb-8">
        <h1 className="text-2xl font-medium text-gray-900 dark:text-gray-100">
          kevin geng
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          frontend @{' '}
          <a
            href="https://faire.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            faire
          </a>{' '}
          · hobbyist · traveler
        </p>
      </header>

      {/* Main content */}
      <div className="flex h-[75vh]">
        <Sidebar
          filters={filters}
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          links={links}
          tools={tools}
        />
        <main className="flex-1 overflow-y-auto">
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
    </div>
  )
}

export default Home
