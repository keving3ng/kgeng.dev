import { describe, it, expect, vi, afterEach } from 'vitest'
import { getPosts, getPost } from './posts'

describe('posts service', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches and returns posts list', async () => {
    const mockPosts = [
      { id: '1', title: 'hello', slug: 'hello', tags: ['dev'], date: '2025-01-01', published: true },
    ]
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(mockPosts), { status: 200 }),
    )

    const result = await getPosts()
    expect(fetchMock).toHaveBeenCalledWith('/api/posts')
    expect(result).toEqual(mockPosts)
  })

  it('throws when getPosts receives non-ok response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(null, { status: 500 }),
    )

    await expect(getPosts()).rejects.toThrow('Failed to fetch posts')
  })

  it('fetches a single post by slug', async () => {
    const mockPost = {
      id: '1',
      title: 'hello',
      slug: 'hello',
      tags: [],
      date: null,
      published: true,
      blocks: [],
    }
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(mockPost), { status: 200 }),
    )

    const result = await getPost('hello')
    expect(fetchMock).toHaveBeenCalledWith('/api/posts/hello')
    expect(result).toEqual(mockPost)
  })

  it('throws "Post not found" on 404 from getPost', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(null, { status: 404 }),
    )

    await expect(getPost('missing')).rejects.toThrow('Post not found')
  })

  it('throws "Failed to fetch post" on non-404 error from getPost', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(null, { status: 502 }),
    )

    await expect(getPost('broken')).rejects.toThrow('Failed to fetch post')
  })
})
