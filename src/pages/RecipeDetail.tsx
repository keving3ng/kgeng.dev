import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import TerminalPrompt from '../components/TerminalPrompt'
import NotionRenderer from '../components/NotionRenderer'
import { useGoBack, useTerminalNav } from '../hooks/useTerminalNav'
import { usePromptRows } from '../hooks/usePromptRows'
import { findStaticRecipe } from '../config/recipes'
import { getRecipe, type RecipeWithContent } from '../services/recipes'
import { paths } from '../config/paths'

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>()
  const staticRecipe = findStaticRecipe(id)

  const [notionRecipe, setNotionRecipe] = useState<RecipeWithContent | null>(null)
  const [loading, setLoading] = useState(!staticRecipe)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (staticRecipe || !id) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    getRecipe(id)
      .then(setNotionRecipe)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id, staticRecipe])

  const goBack = useGoBack(paths.recipes)

  useTerminalNav({
    filters: ['recipe'],
    activeFilter: 'recipe',
    onFilterChange: () => {},
    itemCount: 0,
    onActivate: () => {},
    onBack: goBack,
  })

  const promptRows = usePromptRows()
  const title = staticRecipe?.name ?? notionRecipe?.name
  const notes = staticRecipe?.notes ?? notionRecipe?.notes
  const url = staticRecipe?.url ?? notionRecipe?.url
  const tags = staticRecipe?.tags ?? notionRecipe?.tags ?? []

  return (
    <div className="font-mono pb-12">
      <SiteHeader currentSegment={title?.toLowerCase()} />

      <main className="px-2 md:px-0">
        {loading ? (
          <p className="text-sm text-content-muted">loading recipe...</p>
        ) : error ? (
          <div className="space-y-4 text-sm">
            <p className="text-error">{error}</p>
            <Link to={paths.recipes} className="inline-block text-content hover:text-content-secondary transition-colors">
              ← back to recipes
            </Link>
          </div>
        ) : !staticRecipe && !notionRecipe ? (
          <p className="text-sm text-content-muted">recipe not found.</p>
        ) : (
          <article className="space-y-6">
            <header className="space-y-2 border-b border-border pb-4">
              <h2 className="text-xl font-medium text-content">{title?.toLowerCase()}</h2>
              {notes && <p className="text-sm text-content-secondary">{notes}</p>}
              {(url || tags.length > 0) && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-content-muted">
                  {url && (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-content hover:text-content-secondary transition-colors"
                    >
                      source ↗
                    </a>
                  )}
                  {tags.map((tag) => (
                    <span key={tag}>#{tag.toLowerCase()}</span>
                  ))}
                </div>
              )}
            </header>

            {staticRecipe ? (
              <div className="space-y-6 text-sm text-content-secondary leading-relaxed">
                {staticRecipe.body?.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
                {staticRecipe.ingredients && staticRecipe.ingredients.length > 0 && (
                  <section className="space-y-2">
                    <h3 className="text-xs text-content-muted">ingredients</h3>
                    <ul className="space-y-1">
                      {staticRecipe.ingredients.map((item, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-content-muted">-</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
                {staticRecipe.steps && staticRecipe.steps.length > 0 && (
                  <section className="space-y-2">
                    <h3 className="text-xs text-content-muted">steps</h3>
                    <ol className="space-y-2">
                      {staticRecipe.steps.map((step, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="text-content-muted shrink-0">{i + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </section>
                )}
              </div>
            ) : notionRecipe && notionRecipe.blocks.length > 0 ? (
              <NotionRenderer blocks={notionRecipe.blocks} />
            ) : (
              <p className="text-sm text-content-muted italic">no recipe body yet.</p>
            )}
          </article>
        )}

        <div className="mt-8 border-t border-border pt-3 space-y-2">
          <p className="hidden md:block text-xs text-content-muted">esc back</p>
          <TerminalPrompt rows={promptRows} />
        </div>
      </main>
    </div>
  )
}
