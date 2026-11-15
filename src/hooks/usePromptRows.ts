import { useMemo } from 'react'
import { usePosts } from './usePosts'
import { buildIndexRows } from '../config/indexRows'

/** Build terminal command/autocomplete rows populated with published posts. */
export function usePromptRows() {
  const { posts } = usePosts()
  return useMemo(() => buildIndexRows(posts), [posts])
}
