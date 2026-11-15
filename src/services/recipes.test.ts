import { describe, it, expect, vi, afterEach } from 'vitest'
import { getRecipes, getRecipe } from './recipes'

describe('recipes service', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches and returns recipes list', async () => {
    const mockRecipes = [
      { id: 'r1', name: 'pasta', url: null, notes: 'quick', tags: ['dinner'], hasContent: true },
    ]
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(mockRecipes), { status: 200 }),
    )

    const result = await getRecipes()
    expect(fetchMock).toHaveBeenCalledWith('/api/recipes')
    expect(result).toEqual(mockRecipes)
  })

  it('throws when getRecipes receives non-ok response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(null, { status: 500 }),
    )

    await expect(getRecipes()).rejects.toThrow('Failed to fetch recipes')
  })

  it('fetches a single recipe by id', async () => {
    const mockRecipe = {
      id: 'r1',
      name: 'pasta',
      url: null,
      notes: null,
      tags: [],
      hasContent: true,
      blocks: [],
    }
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(mockRecipe), { status: 200 }),
    )

    const result = await getRecipe('r1')
    expect(fetchMock).toHaveBeenCalledWith('/api/recipes/r1')
    expect(result).toEqual(mockRecipe)
  })

  it('throws when getRecipe receives non-ok response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(null, { status: 404 }),
    )

    await expect(getRecipe('missing')).rejects.toThrow('Failed to fetch recipe')
  })
})
