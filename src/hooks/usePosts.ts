import { useState, useEffect, useCallback } from 'react'
import type { Post, PostWithContent } from '../types/post'
import { getPosts, getPost } from '../services/posts'

const DEV_REFRESH_INTERVAL = 30000 // 30 seconds

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPosts = useCallback(() => {
    getPosts()
      .then(setPosts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchPosts()

    // Auto-refresh in development only
    if (import.meta.env.DEV) {
      const interval = setInterval(fetchPosts, DEV_REFRESH_INTERVAL)
      return () => clearInterval(interval)
    }
  }, [fetchPosts])

  return { posts, loading, error }
}

export function usePost(slug: string | null) {
  const [post, setPost] = useState<PostWithContent | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) {
      setPost(null)
      return
    }

    setLoading(true)
    setError(null)

    getPost(slug)
      .then(setPost)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [slug])

  return { post, loading, error }
}
