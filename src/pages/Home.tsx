import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar, { MobileNav } from '../components/Sidebar'
import Newsfeed from '../components/Newsfeed'
import ThemeToggle from '../components/ThemeToggle'
import { usePosts } from '../hooks/usePosts'
import { socialLinks, tools, lists } from '../config/navigation'

function Home() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
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
    // If viewing a single post, navigate back to home
    if (slug) {
      navigate('/')
    }
    setActiveFilter(filter === 'All Posts' ? null : filter)
  }

  return (
    <div>
      {/* Header */}
      <header className="mb-8 px-2 md:px-0 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-medium text-content">
            kevin geng
          </h1>
          <p className="text-sm text-content-muted mt-1">
            frontend @{' '}
            <a
              href="https://faire.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-content-secondary hover:text-content transition-colors"
            >
              faire
            </a>{' '}
            · side quester · kindmaxing and joybaiting
          </p>
        </div>
        <ThemeToggle />
      </header>

      {/* Mobile navigation */}
      <MobileNav
        filters={filters}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        links={socialLinks}
        tools={tools}
        lists={lists}
      />

      {/* Main content */}
      <div className="flex md:h-[75vh]">
        <Sidebar
          filters={filters}
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          links={socialLinks}
          tools={tools}
          lists={lists}
        />
        <main className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="text-center py-16 text-content-muted">
              Loading posts...
            </div>
          ) : error ? (
            <div className="text-center py-16 text-red-500">
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
