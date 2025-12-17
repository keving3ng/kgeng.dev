import { useState, useEffect } from 'react'
import type { Post, PostWithContent } from '../types/post'
import { getPost } from '../services/posts'
import NotionRenderer from './NotionRenderer'

interface NewsfeedProps {
  items: Post[]
  activeFilter: string | null
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
      <div className="text-gray-400 dark:text-gray-500 text-sm">Loading...</div>
    )
  }

  if (error) {
    return (
      <div className="text-red-500 dark:text-red-400 text-sm">{error}</div>
    )
  }

  if (!post || !post.blocks || post.blocks.length === 0) {
    return (
      <div className="text-gray-400 dark:text-gray-500 text-sm italic">
        No content
      </div>
    )
  }

  return <NotionRenderer blocks={post.blocks} />
}

function Newsfeed({ items, activeFilter }: NewsfeedProps) {
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

  const filteredItems = activeFilter
    ? items.filter((item) => item.tags.includes(activeFilter))
    : items

  if (filteredItems.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500 dark:text-gray-400">
        No posts found.
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
            className="border-b border-gray-200 dark:border-gray-800 py-6 px-6"
          >
            <div className="max-w-2xl">
              <button
                onClick={() => toggleItem(item.id)}
                className="w-full text-left flex items-start gap-2 group"
              >
                <span
                  className={`text-gray-400 dark:text-gray-500 mt-1 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                >
                  ›
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-medium group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                      {item.title}
                    </h2>
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs text-gray-400 dark:text-gray-500 lowercase"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="ml-5 mt-3">
                  {item.date && (
                    <div className="text-xs text-gray-400 dark:text-gray-500 mb-3">
                      {new Date(item.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  )}
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
