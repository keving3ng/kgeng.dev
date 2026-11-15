import { useState } from 'react'
import { Link } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import TerminalPrompt from '../components/TerminalPrompt'
import { useGoBack, useTerminalNav } from '../hooks/useTerminalNav'
import { usePromptRows } from '../hooks/usePromptRows'
import { paths } from '../config/paths'

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
  const goBack = useGoBack(paths.home)

  useTerminalNav({
    filters: ['404'],
    activeFilter: '404',
    onFilterChange: () => {},
    itemCount: 0,
    onActivate: () => {},
    onBack: goBack,
  })

  const promptRows = usePromptRows()

  return (
    <div className="font-mono flex flex-col md:h-[calc(100dvh-4rem)]">
      <SiteHeader />

      <div className="px-2 md:px-0 flex-1 min-h-0 flex flex-col justify-between">
        <main className="py-4">
          <p className="text-xs tracking-wide text-content-muted mb-2">
            page not found
          </p>
          <h1 className="text-xl font-medium text-content mb-6">
            nowhere to land
          </h1>
          <pre
            className="mb-6 font-mono text-sm leading-relaxed text-content-secondary whitespace-pre select-none overflow-x-auto"
            aria-hidden
          >
            {variant.art.trim()}
          </pre>
          <p className="text-sm text-content-secondary mb-6">
            {variant.caption}
          </p>
          <Link
            to={paths.home}
            className="inline-block text-sm text-content hover:text-content-secondary transition-colors"
          >
            ← take me home
          </Link>
        </main>

        <div className="shrink-0 mt-4 border-t border-border pt-3 space-y-2">
          <p className="hidden md:block text-xs text-content-muted">
            esc back
          </p>
          <TerminalPrompt rows={promptRows} />
        </div>
      </div>
    </div>
  )
}

export default NotFound
