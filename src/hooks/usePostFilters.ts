import { useMemo } from 'react'
import { Post } from '../types/post'

/**
 * Derive filter options from post tags.
 * Returns array with "All Posts" first, followed by unique tags sorted alphabetically.
 */
export function usePostFilters(posts: Post[]): string[] {
  return useMemo(() => {
    const tagSet = new Set<string>()
    posts.forEach((post) => {
      post.tags.forEach((tag) => tagSet.add(tag))
    })
    return ['All Posts', ...Array.from(tagSet).sort()]
  }, [posts])
}
