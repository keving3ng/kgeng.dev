import { useState, useMemo } from 'react'
import PageHeader from '../components/PageHeader'
import { useRecipes } from '../hooks/useRecipes'

function Recipes() {
  const { recipes, loading, error } = useRecipes()
  const [activeTag, setActiveTag] = useState<string | null>(null)

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
          <p className="text-sm text-red-500">{error}</p>
        ) : filteredRecipes.length === 0 ? (
          <p className="text-sm text-content-muted italic">
            {activeTag ? `no recipes tagged "${activeTag}"` : 'no recipes yet...'}
          </p>
        ) : (
          <div className="space-y-4">
            {filteredRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="border-l-2 border-border pl-4 py-1"
              >
                {recipe.url ? (
                  <a
                    href={recipe.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-content hover:text-content-secondary transition-colors"
                  >
                    {recipe.name} ↗
                  </a>
                ) : (
                  <span className="text-sm font-medium text-content">
                    {recipe.name}
                  </span>
                )}
                {recipe.notes && (
                  <p className="text-sm text-content-muted mt-0.5">
                    {recipe.notes}
                  </p>
                )}
                {recipe.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Recipes
