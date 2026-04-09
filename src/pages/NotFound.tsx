import { useState } from 'react'
import { Link } from 'react-router-dom'
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

const VARIANTS = [
           {
    caption: 'this url took a wrong turn at the last hyperlink.',
    art: `
     (\\(\\
    (- -)
    o_(")(")
`,
  },
  {
    caption: "even ghosts can't haunt what doesn't exist.",
    art: `
       .-.
      (o o)
      | O \\
      '---'
`,
  },
  {
    caption: 'the duck is as lost as this page. quack?',
    art: `
        __
    <( o )
     (   )>`,
  },
  {
    caption: '404: robot overlords confirm — nothing here.',
    art: `
       ┌───┐
      │o □ o│
       ╰─┬─╯
        ├┤`,
  },
  {
    caption: 'blob inspected the universe. your page was not in it.',
    art: `
      _____
     / o o \\
    |   ▽   |
     \\ ~~~ /
      -----`,
  },
  {
    caption: 'tiny wizard cast "summon page" — nat 1. still empty.',
    art: `
        *
       /|\\
      @(o-o)@
       /|\\`,
  },
] as const

function NotFound() {
  const [variant] = useState(
    () => VARIANTS[Math.floor(Math.random() * VARIANTS.length)]!,
  )

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
          <div className="max-w-lg mx-auto text-center md:text-left">
            <p className="text-xs font-medium tracking-wide text-content-muted mb-2">
              page not found
            </p>
            <h1 className="text-2xl font-medium text-content mb-6">
              nowhere to land
            </h1>
            <pre
              className="mb-6 font-mono text-sm leading-relaxed text-content-secondary whitespace-pre select-none overflow-x-auto"
              aria-hidden
            >
              {variant.art.trim()}
            </pre>
            <p className="text-content-secondary mb-8">
              {variant.caption}
            </p>
            <Link
              to={paths.home}
              className="inline-flex rounded-full border border-border bg-surface-secondary px-5 py-2.5 text-sm text-content-secondary transition-colors hover:border-content-muted/40 hover:text-content"
            >
              take me home
            </Link>
          </div>
        </main>
      </div>
    </div>
  )
}

export default NotFound
