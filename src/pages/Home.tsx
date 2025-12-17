import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Newsfeed from '../components/Newsfeed'

// Mock data - will be replaced with real content later
const mockPosts = [
  {
    id: '1',
    title: 'Welcome to my blog',
    content: 'This is a minimal, continuous scrolling newsfeed-style blog. Posts will appear here in a clean, readable format.',
    date: '2024-01-15',
    category: 'General',
  },
  {
    id: '2',
    title: 'Building with React and TypeScript',
    content: 'Exploring modern web development with React, TypeScript, and Vite. The developer experience has never been better.',
    date: '2024-01-14',
    category: 'Tech',
  },
  {
    id: '3',
    title: 'Minimal Design Principles',
    content: 'Less is more. Focusing on content and readability over flashy design elements.',
    date: '2024-01-13',
    category: 'Design',
  },
]

const filters = ['All Posts', 'Code', 'Bake', 'Eat', 'Travel', 'Pottery']
const links = [
  { label: 'GitHub', url: 'https://github.com/keving3ng' },
  { label: 'Twitter', url: 'https://twitter.com/keving3ng' },
  { label: 'LinkedIn', url: 'https://linkedin.com/in/keving3ng' },
]

const tools = [
  { label: 'splits', url: '/tools/splits' },
]

function Home() {
  const [activeFilter, setActiveFilter] = useState<string | null>('All')

  const handleFilterChange = (filter: string | null) => {
    setActiveFilter(filter === 'All' ? null : filter)
  }

  return (
    <div>
      {/* Header */}
      <header className="mt-4 mb-8">
        <h1 className="text-2xl font-medium text-gray-900 dark:text-gray-100">kevin geng</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          frontend @ <a href="https://faire.com" target="_blank" rel="noopener noreferrer" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">faire</a> · hobbyist · traveler
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
          <Newsfeed items={mockPosts} activeFilter={activeFilter} />
        </main>
      </div>
    </div>
  )
}

export default Home
