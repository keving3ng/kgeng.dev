import { useCallback, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import TerminalPrompt from '../components/TerminalPrompt'
import { useTerminalNav, useGoBack } from '../hooks/useTerminalNav'
import { buildIndexRows } from '../config/indexRows'
import { paths } from '../config/paths'

interface Pick {
  title: string
  author?: string
  url?: string
  note?: string
}

interface Category {
  name: string
  items: Pick[]
  link?: { label: string; url: string; note?: string }
}

interface PickRow {
  id: string
  category: string
  title: string
  detail: string
  href?: string
  external?: boolean
}

const categories: Category[] = [
  {
    name: 'books',
    items: [
      { title: 'Atomic Habits', author: 'James Clear', note: 'obviously' },
    ],
  },
  {
    name: 'games',
    items: [
      { title: 'Old School RuneScape', note: 'click box number go up' },
      { title: 'Super Smash Brothers Melee', note: 'old game best game' },
      { title: 'Titanfall 2', note: 'chills' },
      { title: 'Witcher 3', note: 'played 80 hours during reading week in third year' },
      { title: 'Skyrim', note: 'i never really played single player games before this and it changed my life' },
    ],
  },
  {
    name: 'sports',
    items: [
      { title: 'Ottawa Senators 2017 Playoffs', note: 'goats of my childhood' },
      { title: 'Toronto Raptors 2019 Playoffs', note: 'i can replay so many moments in my mind' },
    ],
  },
  {
    name: 'places',
    items: [
      { title: 'Martin Goodman Trail', note: 'my strava has never seen another place' },
    ],
  },
  {
    name: 'articles',
    items: [
      {
        title: 'An Existential Guide to Making Friends',
        url: 'https://theshadowedarchive.substack.com/p/an-existential-guide-to-making-friends',
        author: 'The Shadowed Archive',
        note: 'perspective shifting and brought great success',
      },
    ],
  },
  { name: 'videos', items: [] },
  {
    name: 'movies',
    link: { label: 'letterboxd', url: 'https://letterboxd.com/kegk3g/', note: 'yuh' },
    items: [],
  },
  { name: 'podcasts', items: [] },
]

function Picks() {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [query, setQuery] = useState('')

  const allRows = useMemo<PickRow[]>(() => {
    const rows: PickRow[] = [
      {
        id: 'recipes',
        category: 'recipes',
        title: 'saved recipes',
        detail: "a collection of recipes i've saved.",
        href: paths.recipes,
      },
    ]
    for (const cat of categories) {
      if (cat.link) {
        rows.push({
          id: `${cat.name}:${cat.link.label}`,
          category: cat.name,
          title: cat.link.label,
          detail: cat.link.note ?? `${cat.name} log`,
          href: cat.link.url,
          external: true,
        })
      }
      for (const item of cat.items) {
        const detail = [item.author, item.note].filter(Boolean).join(' — ')
        rows.push({
          id: `${cat.name}:${item.title}`,
          category: cat.name,
          title: item.title.toLowerCase(),
          detail,
          href: item.url,
          external: Boolean(item.url),
        })
      }
    }
    return rows
  }, [])

  const filterOptions = useMemo(() => {
    const cats = Array.from(new Set(allRows.map((r) => r.category)))
    return ['all', ...cats]
  }, [allRows])

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allRows.filter(
      (r) =>
        (activeCategory === 'all' || r.category === activeCategory) &&
        (q === '' || `${r.category} ${r.title} ${r.detail}`.toLowerCase().includes(q)),
    )
  }, [allRows, activeCategory, query])

  const openRow = useCallback(
    (index: number) => {
      const row = rows[index]
      if (!row?.href) return
      if (row.external) window.open(row.href, '_blank', 'noopener,noreferrer')
      else navigate(row.href)
    },
    [rows, navigate],
  )

  const goBack = useGoBack(paths.home)

  const { selected } = useTerminalNav({
    filters: filterOptions,
    activeFilter: activeCategory,
    onFilterChange: setActiveCategory,
    itemCount: rows.length,
    onActivate: openRow,
    onBack: goBack,
    query,
  })

  const promptRows = useMemo(() => buildIndexRows([]), [])

  return (
    <div className="font-mono flex flex-col md:h-[calc(100dvh-4rem)]">
      <SiteHeader />

      <div className="px-2 md:px-0 flex-1 min-h-0 flex flex-col">
        <div className="shrink-0 mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm">
          <div className="flex flex-wrap items-center gap-x-1" role="group" aria-label="filter picks by category">
            <span className="text-content-muted mr-2">filter:</span>
            {filterOptions.map((cat) => {
              const isSelected = activeCategory === cat
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  aria-pressed={isSelected}
                  className="min-h-[44px] inline-flex items-center px-1 transition-colors"
                >
                  <span
                    className={`px-1.5 py-0.5 rounded-sm transition-colors ${
                      isSelected
                        ? 'bg-content text-surface font-medium'
                        : 'text-content-muted hover:text-content-secondary'
                    }`}
                  >
                    {cat}
                  </span>
                </button>
              )
            })}
          </div>

          <label className="flex items-center gap-2 text-sm min-w-0 flex-1 md:flex-initial md:w-56">
            <span className="text-content-muted shrink-0">grep:</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="filter picks…"
              aria-label="search picks"
              className="w-full min-h-[44px] bg-transparent border-b border-border text-content placeholder:text-content-muted/60 outline-none focus:border-content-muted"
            />
          </label>
        </div>

        <div className="md:flex-1 md:min-h-0 md:overflow-y-auto md:pr-1">
          {rows.length === 0 ? (
            <p className="text-sm text-content-muted">no matches.</p>
          ) : (
            <ul className="space-y-3 md:space-y-1">
              {rows.map((row, i) => (
                <li
                  key={row.id}
                  ref={(el) => {
                    if (el && selected === i) el.scrollIntoView?.({ block: 'nearest' })
                  }}
                  aria-current={selected === i ? 'true' : undefined}
                  className={`grid grid-cols-[auto_1fr] md:grid-cols-[7rem_16rem_1fr] gap-x-4 text-sm ${
                    selected === i ? 'bg-surface-secondary' : ''
                  }`}
                >
                  <span className="text-content font-medium whitespace-nowrap">
                    <span aria-hidden="true" className="hidden md:inline text-content-muted font-normal">
                      {selected === i ? '> ' : '  '}
                    </span>
                    {row.category}
                  </span>
                  <span className="min-w-0 break-words">
                    {row.href ? (
                      row.external ? (
                        <a
                          href={row.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-content hover:text-content-secondary transition-colors"
                        >
                          {row.title} ↗
                        </a>
                      ) : (
                        <Link to={row.href} className="text-content hover:text-content-secondary transition-colors">
                          {row.title}
                        </Link>
                      )
                    ) : (
                      <span className="text-content">{row.title}</span>
                    )}
                  </span>
                  <span className="col-span-2 md:col-span-1 text-content-muted">
                    {row.detail}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="shrink-0 mt-4 border-t border-border pt-3 space-y-2">
          <p className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-content-muted">
            <span>{allRows.length} picks</span>
            <span className="hidden md:inline">←→ filter · ↑↓ select · ↵ open · esc back</span>
          </p>
          <TerminalPrompt rows={promptRows} />
        </div>
      </div>
    </div>
  )
}

export default Picks
