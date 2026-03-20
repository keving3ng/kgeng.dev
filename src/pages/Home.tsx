import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import Sidebar, { MobileNav } from '../components/Sidebar'
import Newsfeed from '../components/Newsfeed'
import CVList from '../components/CVList'
import ThemeToggle from '../components/ThemeToggle'
import { usePosts } from '../hooks/usePosts'
import { usePostFilters } from '../hooks/usePostFilters'
import { socialLinks, tools, lists } from '../config/navigation'

const DISPLAY_NAME = 'kevin geng'
const DISPLAY_CHARS = DISPLAY_NAME.split('')

function Home() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [activeCharIndex, setActiveCharIndex] = useState<number>(-1)
  const timeoutsRef = useRef<Array<ReturnType<typeof setTimeout>>>([])
  const { posts, loading, error } = usePosts()

  const isCV = location.pathname === '/cv'
  const filters = usePostFilters(posts)

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (media?.matches) return

    const STEP_MS = 280
    const WAVE_EVERY_MS = 11000

    const clearWaveTimeouts = () => {
      for (const t of timeoutsRef.current) clearTimeout(t)
      timeoutsRef.current = []
    }

    const runWave = () => {
      clearWaveTimeouts()
      setActiveCharIndex(-1)

      let i = 0
      const tick = () => {
        setActiveCharIndex(i)
        i += 1
        if (i < DISPLAY_CHARS.length) {
          timeoutsRef.current.push(setTimeout(tick, STEP_MS))
        } else {
          timeoutsRef.current.push(setTimeout(() => setActiveCharIndex(-1), STEP_MS))
        }
      }

      // small reset gap so index 0 always retriggers
      timeoutsRef.current.push(setTimeout(tick, 50))
    }

    runWave()
    const interval = setInterval(runWave, WAVE_EVERY_MS)

    return () => {
      clearInterval(interval)
      clearWaveTimeouts()
    }
  }, [])

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
            <span aria-label={DISPLAY_NAME}>
              {DISPLAY_CHARS.map((char, i) => (
                <span
                  key={i}
                  aria-hidden="true"
                  className="name-ripple-char"
                  style={
                    activeCharIndex === i
                      ? { animation: 'name-pop 280ms cubic-bezier(0.2, 0.8, 0.2, 1)' }
                      : undefined
                  }
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </span>
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
          <div className="flex gap-4 mt-3 text-sm">
            <Link
              to="/"
              className={`transition-colors ${
                !isCV
                  ? 'text-content font-medium'
                  : 'text-content-muted hover:text-content-secondary'
              }`}
            >
              blog
            </Link>
            <Link
              to="/cv"
              className={`transition-colors ${
                isCV
                  ? 'text-content font-medium'
                  : 'text-content-muted hover:text-content-secondary'
              }`}
            >
              cv
            </Link>
          </div>
        </div>
        <ThemeToggle />
      </header>

      {/* Mobile navigation - only show for blog */}
      {!isCV && (
        <MobileNav
          filters={filters}
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          links={socialLinks}
          tools={tools}
          lists={lists}
        />
      )}

      {/* Main content */}
      {isCV ? (
        <CVList />
      ) : (
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
              <div className="text-center py-16 text-error">
                {error}
              </div>
            ) : (
              <Newsfeed items={posts} activeFilter={activeFilter} singleSlug={slug} />
            )}
          </main>
        </div>
      )}
    </div>
  )
}

export default Home
