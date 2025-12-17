import { useState, useEffect } from 'react'
import type { Post, PostWithContent } from '../types/post'
import { getPost } from '../services/posts'
import NotionRenderer from './NotionRenderer'

interface NewsfeedProps {
  items: Post[]
  activeFilter: string | null
  singleSlug?: string
}

function PostContent({ slug }: { slug: string }) {
  const [post, setPost] = useState<PostWithContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getPost(slug)
      .then(setPost)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="text-content-muted text-sm">Loading...</div>
    )
  }

  if (error) {
    return (
      <div className="text-red-500 text-sm">{error}</div>
    )
  }

  if (!post || !post.blocks || post.blocks.length === 0) {
    return (
      <div className="text-content-muted text-sm italic">
        No content
      </div>
    )
  }

  return <NotionRenderer blocks={post.blocks} />
}

function CopyLinkButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    const url = `${window.location.origin}/post/${slug}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="text-content-muted/50 hover:text-content-muted transition-colors text-xs"
      title="Copy link"
    >
      {copied ? '✓' : '#'}
    </button>
  )
}

function Newsfeed({ items, activeFilter, singleSlug }: NewsfeedProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set(items.map((item) => item.id))
  )

  const toggleItem = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // Filter by single slug first, then by tag filter
  let filteredItems = singleSlug
    ? items.filter((item) => item.slug === singleSlug)
    : items

  if (!singleSlug && activeFilter) {
    const filterLower = activeFilter.toLowerCase()
    filteredItems = filteredItems.filter((item) =>
      item.tags.some((tag) => tag.toLowerCase() === filterLower)
    )
  }

  if (filteredItems.length === 0) {
    return (
      <div className="text-center py-16 text-content-muted">
        {singleSlug ? 'Post not found.' : 'No posts found.'}
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {filteredItems.map((item) => {
        const isExpanded = expandedItems.has(item.id)

        return (
          <article
            key={item.id}
            className="group/article border-b border-border py-6 px-2 md:px-6"
          >
            <div className="max-w-2xl">
              <div className="flex items-start gap-2">
                <button
                  onClick={() => toggleItem(item.id)}
                  className="flex-1 text-left flex items-start gap-2 group"
                >
                  <span
                    className={`text-content-muted mt-1 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  >
                    ›
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg font-medium group-hover:text-content-secondary transition-colors">
                        {item.title}
                      </h2>
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs text-content-muted lowercase"
                        >
                          {tag}
                        </span>
                      ))}
                      {item.date && (
                        <span className="text-xs text-content-muted">
                          ·{' '}
                          {new Date(item.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
                <CopyLinkButton slug={item.slug} />
              </div>

              {isExpanded && (
                <div className="ml-5 mt-3">
                  <PostContent slug={item.slug} />
                </div>
              )}
            </div>
          </article>
        )
      })}
    </div>
  )
}

export default Newsfeed
