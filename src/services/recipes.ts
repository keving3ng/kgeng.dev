import type { NotionBlock } from '../types/post'

export interface Recipe {
  id: string
  name: string
  url: string | null
  notes: string | null
  tags: string[]
  hasContent: boolean
}

export interface RecipeWithContent extends Recipe {
  blocks: NotionBlock[]
}

const API_BASE = '/api'

export async function getRecipes(): Promise<Recipe[]> {
  const response = await fetch(`${API_BASE}/recipes`)
  if (!response.ok) {
    throw new Error('Failed to fetch recipes')
  }
  return response.json()
}

export async function getRecipe(id: string): Promise<RecipeWithContent> {
  const response = await fetch(`${API_BASE}/recipes/${id}`)
  if (!response.ok) {
    throw new Error('Failed to fetch recipe')
  }
  return response.json()
}
