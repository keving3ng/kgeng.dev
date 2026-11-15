import type { CmsPostSummary, Post, PostWithContent, SyncPostsResult } from '../types/post'

const API_BASE = '/api'

async function parseError(response: Response, fallback: string): Promise<never> {
  try {
    const data = (await response.json()) as { error?: string }
    if (data?.error) throw new Error(data.error)
  } catch (err) {
    if (err instanceof Error && err.message !== fallback && !err.message.includes('JSON')) {
      throw err
    }
  }
  throw new Error(fallback)
}

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

export async function getCmsPosts(token: string): Promise<CmsPostSummary[]> {
  const response = await fetch(`${API_BASE}/cms/posts`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) await parseError(response, 'failed to fetch cms posts')
  return response.json()
}

export async function syncPostsFromNotion(
  token: string,
  notionPageId?: string,
): Promise<SyncPostsResult> {
  const response = await fetch(`${API_BASE}/cms/posts/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(notionPageId ? { notionPageId } : {}),
  })
  if (!response.ok) await parseError(response, 'failed to sync posts from notion')
  return response.json()
}

export async function deleteCmsPost(token: string, id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/cms/posts?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) await parseError(response, 'failed to delete post')
}
