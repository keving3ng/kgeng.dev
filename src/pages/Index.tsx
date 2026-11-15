import { useCallback, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import TerminalPrompt from '../components/TerminalPrompt'
import { usePosts } from '../hooks/usePosts'
import { useTerminalNav } from '../hooks/useTerminalNav'
import { ROW_TYPES, buildIndexRows, filterRows, formatShortDate, parseRowType, type IndexRow, type RowType } from '../config/indexRows'

const FILTER_OPTIONS: (RowType | null)[] = [null, ...ROW_TYPES]

function RowName({ row }: { row: IndexRow }) {
  const cls = 'text-content hover:text-content-secondary transition-colors'
  if (!row.href) return <span className="text-content">{row.name}</span>
  if (row.external) {
    return (
      <a href={row.href} target="_blank" rel="noopener noreferrer" className={cls}>
        {row.name} ↗
      </a>
    )
  }
  return (
    <Link to={row.href} className={cls}>
      {row.name}
    </Link>
  )
}

function Index() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const type = parseRowType(searchParams.get('type'))
  const [query, setQuery] = useState('')
  const { posts } = usePosts()

  const allRows = useMemo(() => buildIndexRows(posts), [posts])
  const rows = useMemo(() => filterRows(allRows, type, query), [allRows, type, query])

  const setType = useCallback(
    (next: RowType | null) => {
      if (next) setSearchParams({ type: next })
      else setSearchParams({})
    },
    [setSearchParams],
  )

  const openRow = useCallback(
    (index: number) => {
      const row = rows[index]
      if (!row?.href) return
      if (row.external) window.open(row.href, '_blank', 'noopener,noreferrer')
      else navigate(row.href)
    },
    [rows, navigate],
  )

  const { selected } = useTerminalNav({
    filters: FILTER_OPTIONS,
    activeFilter: type,
    onFilterChange: setType,
    itemCount: rows.length,
    onActivate: openRow,
    query,
  })

  const count = (t: string) => allRows.filter((r) => r.type === t).length

  return (
    <div className="font-mono flex flex-col md:h-[calc(100dvh-4rem)]">
      <SiteHeader />

      <div className="px-2 md:px-0 flex-1 min-h-0 flex flex-col">
        <div className="shrink-0 mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm">
          <div className="flex flex-wrap items-center gap-x-1" role="group" aria-label="filter by type">
            <span className="text-content-muted mr-2">filter:</span>
            {FILTER_OPTIONS.map((t) => {
              const isSelected = type === t
              return (
                <button
                  key={t ?? 'all'}
                  type="button"
                  onClick={() => setType(t)}
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
                    {t ?? 'all'}
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
              placeholder="filter rows…"
              aria-label="search the index"
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
                  className={`grid grid-cols-[auto_1fr_auto] md:grid-cols-[6rem_14rem_1fr_auto] gap-x-4 text-sm ${
                    selected === i ? 'bg-surface-secondary' : ''
                  }`}
                >
                  <span className="text-content font-medium whitespace-nowrap">
                    <span aria-hidden="true" className="hidden md:inline text-content-muted font-normal">
                      {selected === i ? '> ' : '  '}
                    </span>
                    {row.type}
                  </span>
                  <span className="min-w-0 break-words">
                    <RowName row={row} />
                  </span>
                  <span className="order-3 col-span-3 md:order-none md:col-span-1 text-content-muted">
                    {row.description}
                  </span>
                  <span className="order-2 md:order-none text-content-muted whitespace-nowrap md:text-right">
                    {formatShortDate(row.date)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="shrink-0 mt-4 border-t border-border pt-3 space-y-2">
          <p className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-content-muted">
            <span>{count('project')} projects · {count('tool')} tools · {count('post')} posts</span>
            <span className="hidden md:inline">←→ filter · ↑↓ select · ↵ open · esc clear</span>
          </p>

          <TerminalPrompt rows={allRows} />
        </div>
      </div>
    </div>
  )
}

export default Index
