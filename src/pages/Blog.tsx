import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Newsfeed from '../components/Newsfeed'

// Mock data - will be replaced with real content later
const mockPosts = [
  {
    id: '1',
    title: 'Blog Post Example',
    content: 'This is an example blog post in the newsfeed format.',
    date: '2024-01-15',
    category: 'General',
  },
]

const filters = ['All', 'General', 'Tech', 'Design']
const links = [
  { label: 'GitHub', url: 'https://github.com' },
  { label: 'Twitter', url: 'https://twitter.com' },
  { label: 'LinkedIn', url: 'https://linkedin.com' },
]

function Blog() {
  const [activeFilter, setActiveFilter] = useState<string | null>('All')

  const handleFilterChange = (filter: string | null) => {
    setActiveFilter(filter === 'All' ? null : filter)
  }

  return (
    <div className="flex">
      <Sidebar
        filters={filters}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        links={links}
      />
      <main className="flex-1">
        <Newsfeed items={mockPosts} activeFilter={activeFilter} />
      </main>
    </div>
  )
}

export default Blog

