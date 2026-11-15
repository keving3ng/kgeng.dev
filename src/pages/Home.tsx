import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar, { MobilePostFilters } from '../components/Sidebar'
import Newsfeed from '../components/Newsfeed'
import CVList from '../components/CVList'
import SiteHeader from '../components/SiteHeader'
import { usePosts } from '../hooks/usePosts'
import { usePostFilters } from '../hooks/usePostFilters'
import { socialLinks, tools, lists } from '../config/navigation'
import { paths } from '../config/paths'

function Home() {
  const location = useLocation()
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const { posts, loading, error } = usePosts()

  const isCV = location.pathname === paths.cv
  const filters = usePostFilters(posts)

  const handleFilterChange = (filter: string | null) => {
    setActiveFilter(filter === 'All Posts' ? null : filter)
  }

  return (
    <div>
      <SiteHeader />

      {/* Main content */}
      {isCV ? (
        <CVList />
      ) : (
        <div className="flex min-h-0 md:h-[75vh]">
          <Sidebar
            filters={filters}
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
            links={socialLinks}
            tools={tools}
            lists={lists}
          />
          <main className="min-h-0 flex-1 overflow-y-auto">
            <MobilePostFilters
              filters={filters}
              activeFilter={activeFilter}
              onFilterChange={handleFilterChange}
            />
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
      )}
    </div>
  )
}

export default Home
