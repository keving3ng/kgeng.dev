import { useState, useMemo, useEffect } from 'react'
import PageHeader from '../components/PageHeader'
import { useRecipes } from '../hooks/useRecipes'
import { getRecipe, type RecipeWithContent } from '../services/recipes'
import NotionRenderer from '../components/NotionRenderer'

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
    return <div className="text-content-muted text-sm">Loading...</div>
  }

  if (error) {
    return <div className="text-error text-sm">{error}</div>
  }

  if (!recipe || !recipe.blocks || recipe.blocks.length === 0) {
    return (
      <div className="text-content-muted text-sm italic">No content</div>
    )
  }

  return <NotionRenderer blocks={recipe.blocks} />
}

function Recipes() {
  const { recipes, loading, error } = useRecipes()
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const toggleItem = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // Get unique tags from all recipes
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    recipes.forEach((recipe) => {
      recipe.tags.forEach((tag) => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }, [recipes])

  // Sort and filter recipes
  const filteredRecipes = useMemo(() => {
    const sorted = [...recipes].sort((a, b) => a.name.localeCompare(b.name))
    if (!activeTag) return sorted
    return sorted.filter((recipe) => recipe.tags.includes(activeTag))
  }, [recipes, activeTag])

  return (
    <div className="min-h-screen bg-surface py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <PageHeader title="recipes" subtitle="a collection of recipes i've saved." />

        {/* Tag filters */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setActiveTag(null)}
              className={`text-sm px-3 py-1 rounded-full transition-colors ${
                activeTag === null
                  ? 'bg-content text-surface'
                  : 'bg-surface-secondary text-content-secondary hover:bg-border'
              }`}
            >
              all
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`text-sm px-3 py-1 rounded-full transition-colors ${
                  activeTag === tag
                    ? 'bg-content text-surface'
                    : 'bg-surface-secondary text-content-secondary hover:bg-border'
                }`}
              >
                {tag.toLowerCase()}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <p className="text-sm text-content-muted">
            loading recipes...
          </p>
        ) : error ? (
          <p className="text-sm text-error">{error}</p>
        ) : filteredRecipes.length === 0 ? (
          <p className="text-sm text-content-muted italic">
            {activeTag ? `no recipes tagged "${activeTag}"` : 'no recipes yet...'}
          </p>
        ) : (
          <div className="space-y-4">
            {filteredRecipes.map((recipe) => {
              const isExpanded = expandedItems.has(recipe.id)
              const hasToggle = recipe.hasContent

              return (
                <div
                  key={recipe.id}
                  className="border-l-2 border-border pl-4 py-1"
                >
                  <div className="flex items-start gap-2">
                    {hasToggle ? (
                      <button
                        onClick={() => toggleItem(recipe.id)}
                        className="flex items-start gap-2 group text-left"
                      >
                        <span
                          className={`text-content-muted transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                        >
                          ›
                        </span>
                        <span className="text-sm font-medium text-content group-hover:text-content-secondary transition-colors">
                          {recipe.name}
                        </span>
                      </button>
                    ) : (
                      <span className="text-sm font-medium text-content">
                        {recipe.name}
                      </span>
                    )}
                    {recipe.url && (
                      <a
                        href={recipe.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-content-muted hover:text-content-secondary transition-colors text-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        ↗
                      </a>
                    )}
                  </div>
                  {recipe.notes && (
                    <p className={`text-sm text-content-muted mt-0.5 ${hasToggle ? 'ml-5' : ''}`}>
                      {recipe.notes}
                    </p>
                  )}
                  {recipe.tags.length > 0 && (
                    <div className={`flex flex-wrap gap-1 mt-1 ${hasToggle ? 'ml-5' : ''}`}>
                      {recipe.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs text-content-muted"
                        >
                          #{tag.toLowerCase()}
                        </span>
                      ))}
                    </div>
                  )}
                  {hasToggle && isExpanded && (
                    <div className="ml-5 mt-3">
                      <RecipeContent id={recipe.id} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Recipes
