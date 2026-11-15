import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import TerminalPrompt from '../components/TerminalPrompt'
import NotionRenderer from '../components/NotionRenderer'
import { useRecipes } from '../hooks/useRecipes'
import { useTerminalNav } from '../hooks/useTerminalNav'
import { getRecipe, type RecipeWithContent } from '../services/recipes'
import { buildIndexRows } from '../config/indexRows'
import { paths } from '../config/paths'

function RecipeContent({ id }: { id: string }) {
  const [recipe, setRecipe] = useState<RecipeWithContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getRecipe(id)
      .then(setRecipe)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <div className="text-content-muted text-sm">loading...</div>
  }

  if (error) {
    return <div className="text-error text-sm">{error}</div>
  }

  if (!recipe || !recipe.blocks || recipe.blocks.length === 0) {
    return <div className="text-content-muted text-sm italic">no content</div>
  }

  return <NotionRenderer blocks={recipe.blocks} />
}

function Recipes() {
  const navigate = useNavigate()
  const { recipes, loading, error } = useRecipes()
  const [activeTag, setActiveTag] = useState<string>('all')
  const [query, setQuery] = useState('')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const toggleItem = useCallback((id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const tagOptions = useMemo(() => {
    const tagSet = new Set<string>()
    recipes.forEach((r) => r.tags.forEach((tag) => tagSet.add(tag.toLowerCase())))
    return ['all', ...Array.from(tagSet).sort()]
  }, [recipes])

  const filteredRecipes = useMemo(() => {
    const q = query.trim().toLowerCase()
    return [...recipes]
      .sort((a, b) => a.name.localeCompare(b.name))
      .filter((r) => {
        const matchesTag =
          activeTag === 'all' || r.tags.some((t) => t.toLowerCase() === activeTag)
        const matchesQuery =
          q === '' || `${r.name} ${r.notes ?? ''} ${r.tags.join(' ')}`.toLowerCase().includes(q)
        return matchesTag && matchesQuery
      })
  }, [recipes, activeTag, query])

  const activateRecipe = useCallback(
    (index: number) => {
      const recipe = filteredRecipes[index]
      if (!recipe) return
      if (recipe.hasContent) toggleItem(recipe.id)
      else if (recipe.url) window.open(recipe.url, '_blank', 'noopener,noreferrer')
    },
    [filteredRecipes, toggleItem],
  )

  const goBack = useCallback(() => navigate(paths.picks), [navigate])

  const { selected } = useTerminalNav({
    filters: tagOptions,
    activeFilter: activeTag,
    onFilterChange: setActiveTag,
    itemCount: filteredRecipes.length,
    onActivate: activateRecipe,
    onBack: goBack,
    query,
  })

  const promptRows = useMemo(() => buildIndexRows([]), [])

  return (
    <div className="font-mono flex flex-col md:h-[calc(100dvh-4rem)]">
      <SiteHeader />

      <div className="px-2 md:px-0 flex-1 min-h-0 flex flex-col">
        <div className="shrink-0 mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm">
          <div className="flex flex-wrap items-center gap-x-1" role="group" aria-label="filter recipes by tag">
            <span className="text-content-muted mr-2">filter:</span>
            {tagOptions.map((tag) => {
              const isSelected = activeTag === tag
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setActiveTag(tag)}
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
                    {tag}
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
              placeholder="filter recipes…"
              aria-label="search recipes"
              className="w-full min-h-[44px] bg-transparent border-b border-border text-content placeholder:text-content-muted/60 outline-none focus:border-content-muted"
            />
          </label>
        </div>

        <div className="md:flex-1 md:min-h-0 md:overflow-y-auto md:pr-1">
          {loading ? (
            <p className="text-sm text-content-muted">loading recipes...</p>
          ) : error ? (
            <p className="text-sm text-error">{error}</p>
          ) : filteredRecipes.length === 0 ? (
            <p className="text-sm text-content-muted">no matches.</p>
          ) : (
            <ul className="space-y-3 md:space-y-1">
              {filteredRecipes.map((recipe, i) => {
                const isExpanded = expandedItems.has(recipe.id)
                const hasToggle = recipe.hasContent
                const primaryTag = recipe.tags[0]?.toLowerCase() ?? 'recipe'

                return (
                  <li
                    key={recipe.id}
                    ref={(el) => {
                      if (el && selected === i) el.scrollIntoView?.({ block: 'nearest' })
                    }}
                    aria-current={selected === i ? 'true' : undefined}
                    className={`text-sm ${selected === i ? 'bg-surface-secondary' : ''}`}
                  >
                    <div className="grid grid-cols-[auto_1fr] md:grid-cols-[7rem_16rem_1fr] gap-x-4">
                      <span className="text-content font-medium whitespace-nowrap">
                        <span aria-hidden="true" className="hidden md:inline text-content-muted font-normal">
                          {selected === i ? '> ' : '  '}
                        </span>
                        {primaryTag}
                      </span>
                      <span className="min-w-0 break-words flex items-baseline gap-2">
                        {hasToggle ? (
                          <button
                            type="button"
                            onClick={() => toggleItem(recipe.id)}
                            className="text-left text-content hover:text-content-secondary transition-colors"
                          >
                            <span className="text-content-muted mr-1">{isExpanded ? '▾' : '›'}</span>
                            {recipe.name.toLowerCase()}
                          </button>
                        ) : (
                          <span className="text-content">{recipe.name.toLowerCase()}</span>
                        )}
                        {recipe.url && (
                          <a
                            href={recipe.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-content-muted hover:text-content-secondary transition-colors"
                          >
                            ↗
                          </a>
                        )}
                      </span>
                      <span className="col-span-2 md:col-span-1 text-content-muted">
                        {recipe.notes ?? ''}
                      </span>
                    </div>

                    {hasToggle && isExpanded && (
                      <div className="mt-2 mb-3 pl-4 md:pl-[7rem] border-l-2 border-border">
                        <RecipeContent id={recipe.id} />
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="shrink-0 mt-4 border-t border-border pt-3 space-y-2">
          <p className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-content-muted">
            <span>{recipes.length} recipes</span>
            <span className="hidden md:inline">←→ filter · ↑↓ select · ↵ toggle · esc back</span>
          </p>
          <TerminalPrompt rows={promptRows} />
        </div>
      </div>
    </div>
  )
}

export default Recipes
