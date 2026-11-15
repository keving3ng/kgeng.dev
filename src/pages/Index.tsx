import { useCallback, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import TerminalPrompt from '../components/TerminalPrompt'
import TerminalListSkeleton from '../components/TerminalListSkeleton'
import { usePosts } from '../hooks/usePosts'
import { useInitialMinLoading } from '../hooks/useInitialMinLoading'
import { useTerminalNav } from '../hooks/useTerminalNav'
import { ROW_TYPES, buildIndexRows, filterRows, formatShortDate, parseRowType, type IndexRow, type RowType } from '../config/indexRows'

const FILTER_OPTIONS: (RowType | null)[] = [null, ...ROW_TYPES]

function RowName({ row, selected }: { row: IndexRow; selected: boolean }) {
  const cls = selected
    ? 'text-surface hover:text-surface/80 transition-colors'
    : 'text-content hover:text-content-secondary transition-colors'
  if (!row.href) return <span className={selected ? 'text-surface' : 'text-content'}>{row.name}</span>
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
  const { posts, loading: postsLoading } = usePosts()
  const loading = useInitialMinLoading(postsLoading, 'index')

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
    itemCount: loading ? 0 : rows.length,
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
          {loading ? (
            <TerminalListSkeleton label="indexing…" variant="index" />
          ) : rows.length === 0 ? (
            <p className="text-sm text-content-muted">no matches.</p>
          ) : (
            <ul className="space-y-3 md:space-y-1">
              {rows.map((row, i) => {
                const isSelected = selected === i
                const formattedDate = formatShortDate(row.date)
                const prevDate = i > 0 ? formatShortDate(rows[i - 1].date) : null
                const showDate = formattedDate !== prevDate

                return (
                  <li
                    key={row.id}
                    ref={(el) => {
                      if (el && isSelected) el.scrollIntoView?.({ block: 'nearest' })
                    }}
                    aria-current={isSelected ? 'true' : undefined}
                    className={`grid grid-cols-[auto_1fr_5rem] md:grid-cols-[6rem_1fr_auto_5.5rem] gap-x-4 text-sm ${
                      isSelected ? 'bg-content text-surface' : ''
                    }`}
                  >
                    <span className={`font-medium whitespace-nowrap ${isSelected ? 'text-surface' : 'text-content'}`}>
                      {row.type}
                    </span>
                    <span className="min-w-0 break-words">
                      {isSelected && (
                        <span aria-hidden="true" className="text-surface/65 mr-1">
                          [
                        </span>
                      )}
                      <RowName row={row} selected={isSelected} />
                      {isSelected && (
                        <span aria-hidden="true" className="text-surface/65 ml-1">
                          ]
                        </span>
                      )}
                    </span>
                    <span
                      className={`order-3 col-span-3 md:order-none md:col-span-1 md:max-w-[42ch] md:truncate md:text-right ${
                        isSelected ? 'text-surface/80' : 'text-content-muted'
                      }`}
                      title={row.description || undefined}
                    >
                      {row.description}
                    </span>
                    <span
                      className={`order-2 md:order-none whitespace-nowrap text-right ${
                        isSelected ? 'text-surface/80' : 'text-content-muted'
                      }`}
                    >
                      {showDate ? formattedDate : ''}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="shrink-0 mt-4 border-t border-border pt-3 space-y-2">
          <p className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-content-muted">
            <span>{loading ? 'indexing…' : `${count('project')} projects · ${count('tool')} tools · ${count('post')} posts`}</span>
            <span className="hidden md:inline">←→ filter · ↑↓ select · ↵ open · esc clear</span>
          </p>

          <TerminalPrompt rows={allRows} />
        </div>
      </div>
    </div>
  )
}

export default Index
