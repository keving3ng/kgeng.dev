import type { Recipe } from '../services/recipes'

export interface StaticRecipe {
  slug: string
  name: string
  url?: string
  notes?: string
  tags: string[]
  ingredients?: string[]
  steps?: string[]
  body?: string[]
}

/**
 * Optional hand-written / static recipes.
 * Recipes from Notion with body blocks also open as rich terminal pages;
 * Notion recipes without body content open their external link directly.
 */
export const staticRecipes: StaticRecipe[] = []

export function findStaticRecipe(idOrSlug: string | undefined): StaticRecipe | undefined {
  if (!idOrSlug) return undefined
  return staticRecipes.find((r) => r.slug === idOrSlug)
}

export function staticRecipesAsList(): Recipe[] {
  return staticRecipes.map((r) => ({
    id: r.slug,
    name: r.name,
    url: r.url ?? null,
    notes: r.notes ?? null,
    tags: r.tags,
    hasContent: true,
  }))
}
