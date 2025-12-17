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

const filters = ['All Posts', 'Code', 'Bake', 'Eat', 'Travel', 'Pottery']
const links = [
  { label: 'GitHub', url: 'https://github.com/keving3ng' },
  { label: 'Twitter', url: 'https://twitter.com/keving3ng' },
  { label: 'LinkedIn', url: 'https://linkedin.com/in/keving3ng' },
]
const tools = [
  { label: 'splits', url: '/tools/splits' },
]

function Blog() {
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

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
        <Newsfeed items={mockPosts} activeFilter={activeFilter} />
      </main>
    </div>
  )
}

export default Blog

