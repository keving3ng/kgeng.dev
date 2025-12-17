export interface Recipe {
  id: string
  name: string
  url: string | null
  notes: string | null
  tags: string[]
}

const API_BASE = '/api'

export async function getRecipes(): Promise<Recipe[]> {
  const response = await fetch(`${API_BASE}/recipes`)
  if (!response.ok) {
    throw new Error('Failed to fetch recipes')
  }
  return response.json()
}
