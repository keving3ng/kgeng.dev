import { useCallback, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import TerminalPrompt from '../components/TerminalPrompt'
import { useRecipes } from '../hooks/useRecipes'
import { useTerminalNav, useGoBack } from '../hooks/useTerminalNav'
import { usePromptRows } from '../hooks/usePromptRows'
import { staticRecipesAsList } from '../config/recipes'
import { paths, recipePath } from '../config/paths'

function Recipes() {
  const navigate = useNavigate()
  const { recipes: notionRecipes, loading, error } = useRecipes()
  const [activeTag, setActiveTag] = useState<string>('all')
  const [query, setQuery] = useState('')

  const recipes = useMemo(
    () => [...staticRecipesAsList(), ...notionRecipes],
    [notionRecipes],
  )

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
      if (recipe.hasContent) navigate(recipePath(recipe.id))
      else if (recipe.url) window.open(recipe.url, '_blank', 'noopener,noreferrer')
    },
    [filteredRecipes, navigate],
  )

  const goBack = useGoBack(paths.picks)

  const { selected } = useTerminalNav({
    filters: tagOptions,
    activeFilter: activeTag,
    onFilterChange: setActiveTag,
    itemCount: filteredRecipes.length,
    onActivate: activateRecipe,
    onBack: goBack,
    query,
  })

  const promptRows = usePromptRows()

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
                const primaryTag = recipe.tags[0]?.toLowerCase() ?? 'recipe'

                return (
                  <li
                    key={recipe.id}
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
                      {primaryTag}
                    </span>
                    <span className="min-w-0 break-words flex items-baseline gap-2">
                      {recipe.hasContent ? (
                        <Link
                          to={recipePath(recipe.id)}
                          className="text-content hover:text-content-secondary transition-colors"
                        >
                          {recipe.name.toLowerCase()}
                        </Link>
                      ) : recipe.url ? (
                        <a
                          href={recipe.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-content hover:text-content-secondary transition-colors"
                        >
                          {recipe.name.toLowerCase()} ↗
                        </a>
                      ) : (
                        <span className="text-content">{recipe.name.toLowerCase()}</span>
                      )}
                      {recipe.hasContent && recipe.url && (
                        <a
                          href={recipe.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-content-muted hover:text-content-secondary transition-colors"
                        >
                          ↗
                        </a>
                      )}
                    </span>
                    <span className="col-span-2 md:col-span-1 text-content-muted">
                      {recipe.notes ?? ''}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="shrink-0 mt-4 border-t border-border pt-3 space-y-2">
          <p className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-content-muted">
            <span>{recipes.length} recipes</span>
            <span className="hidden md:inline">←→ filter · ↑↓ select · ↵ open · esc back</span>
          </p>
          <TerminalPrompt rows={promptRows} />
        </div>
      </div>
    </div>
  )
}

export default Recipes
