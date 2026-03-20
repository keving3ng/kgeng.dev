import Sidebar from '../components/Sidebar'
import ThemeToggle from '../components/ThemeToggle'
import { socialLinks } from '../config/navigation'
import { paths } from '../config/paths'

const tools = [
  { label: 'splits', url: paths.tools.splits },
  { label: 'recipeer', url: paths.tools.recipeer },
]

const lists = [
  { label: 'picks', url: paths.picks },
  { label: 'recipes', url: paths.recipes },
]

function About() {
  return (
    <div>
      <div className="flex justify-end mb-4 px-2">
        <ThemeToggle />
      </div>
      <div className="flex">
        <Sidebar
          filters={[]}
          activeFilter={null}
          onFilterChange={() => {}}
          links={socialLinks}
          tools={tools}
          lists={lists}
        />
        <main className="flex-1 p-8">
          <div className="max-w-2xl">
            <h1 className="text-2xl font-medium mb-6">About</h1>
            <p className="text-content-secondary leading-relaxed">
              About page content coming soon...
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}

export default About

