import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
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
    <div className="min-h-screen bg-white dark:bg-gray-950 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back button */}
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-6 transition-colors"
        >
          ← back
        </Link>

        <h1 className="text-2xl font-medium mb-2 text-gray-900 dark:text-gray-100">
          recipes
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          a collection of recipes i've saved.
        </p>

        {/* Tag filters */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setActiveTag(null)}
              className={`text-sm px-3 py-1 rounded-full transition-colors ${
                activeTag === null
                  ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
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
                    ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {tag.toLowerCase()}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">
            loading recipes...
          </p>
        ) : error ? (
          <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
        ) : filteredRecipes.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 italic">
            {activeTag ? `no recipes tagged "${activeTag}"` : 'no recipes yet...'}
          </p>
        ) : (
          <div className="space-y-4">
            {filteredRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="border-l-2 border-gray-200 dark:border-gray-800 pl-4 py-1"
              >
                {recipe.url ? (
                  <a
                    href={recipe.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {recipe.name} ↗
                  </a>
                ) : (
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {recipe.name}
                  </span>
                )}
                {recipe.notes && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {recipe.notes}
                  </p>
                )}
                {recipe.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {recipe.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs text-gray-400 dark:text-gray-500"
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
