import Sidebar from '../components/Sidebar'

const filters = ['All', 'General', 'Tech', 'Design']
const links = [
  { label: 'GitHub', url: 'https://github.com' },
  { label: 'Twitter', url: 'https://twitter.com' },
  { label: 'LinkedIn', url: 'https://linkedin.com' },
]

function About() {
  return (
    <div className="flex">
      <Sidebar
        filters={filters}
        activeFilter={null}
        onFilterChange={() => {}}
        links={links}
      />
      <main className="flex-1 p-8">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-medium mb-6">About</h1>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            About page content coming soon...
          </p>
        </div>
      </main>
    </div>
  )
}

export default About

