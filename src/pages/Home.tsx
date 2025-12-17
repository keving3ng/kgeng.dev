import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar, { MobileNav } from '../components/Sidebar'
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
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const { posts, loading, error } = usePosts()

  const handleFilterChange = (filter: string | null) => {
    // If viewing a single post, navigate back to home
    if (slug) {
      navigate('/')
    }
    setActiveFilter(filter === 'All Posts' ? null : filter)
  }

  return (
    <div>
      {/* Header */}
      <header className="mb-8 px-2 md:px-0">
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
          · side quester · kindmaxing and joybaiting
        </p>
      </header>

      {/* Mobile navigation */}
      <MobileNav
        filters={filters}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        links={links}
        tools={tools}
      />

      {/* Main content */}
      <div className="flex md:h-[75vh]">
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
            <Newsfeed items={posts} activeFilter={activeFilter} singleSlug={slug} />
          )}
        </main>
      </div>
    </div>
  )
}

export default Home
