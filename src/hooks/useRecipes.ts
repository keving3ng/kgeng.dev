import { useState, useEffect, useCallback } from 'react'
import type { Recipe } from '../services/recipes'
import { getRecipes } from '../services/recipes'
import { DEV_REFRESH_INTERVAL } from '../config/constants'

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRecipes = useCallback(() => {
    getRecipes()
      .then(setRecipes)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchRecipes()

    // Auto-refresh in development only
    if (import.meta.env.DEV) {
      const interval = setInterval(fetchRecipes, DEV_REFRESH_INTERVAL)
      return () => clearInterval(interval)
    }
  }, [fetchRecipes])

  return { recipes, loading, error }
}
