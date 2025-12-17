import type { Post, PostWithContent } from '../types/post'

const API_BASE = '/api'

export async function getPosts(): Promise<Post[]> {
  const response = await fetch(`${API_BASE}/posts`)
  if (!response.ok) {
    throw new Error('Failed to fetch posts')
  }
  return response.json()
}

export async function getPost(slug: string): Promise<PostWithContent> {
  const response = await fetch(`${API_BASE}/posts/${slug}`)
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Post not found')
    }
    throw new Error('Failed to fetch post')
  }
  return response.json()
}
