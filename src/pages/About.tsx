import Sidebar from '../components/Sidebar'

const filters = ['All Posts', 'Code', 'Bake', 'Eat', 'Travel', 'Pottery']
const links = [
  { label: 'GitHub', url: 'https://github.com/keving3ng' },
  { label: 'Twitter', url: 'https://twitter.com/keving3ng' },
  { label: 'LinkedIn', url: 'https://linkedin.com/in/keving3ng' },
]
const tools = [
  { label: 'splits', url: '/tools/splits' },
  { label: 'recipeer', url: '/tools/recipeer' },
]

const lists = [
  { label: 'picks', url: '/picks' },
  { label: 'recipes', url: '/recipes' },
]

function About() {
  return (
    <div className="flex">
      <Sidebar
        filters={filters}
        activeFilter={null}
        onFilterChange={() => {}}
        links={links}
        tools={tools}
        lists={lists}
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

