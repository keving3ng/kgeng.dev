import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import TerminalPrompt from '../components/TerminalPrompt'
import NotionRenderer from '../components/NotionRenderer'
import { usePost, usePosts } from '../hooks/usePosts'
import { useGoBack, useTerminalNav } from '../hooks/useTerminalNav'
import { buildIndexRows, formatShortDate } from '../config/indexRows'
import { paths, postPath, postsIndexPath } from '../config/paths'

export default function PostDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { post, loading, error } = usePost(slug ?? null)
  const { posts } = usePosts()
  const [copied, setCopied] = useState(false)

  const goBack = useGoBack(paths.home)

  useTerminalNav({
    filters: ['post'],
    activeFilter: 'post',
    onFilterChange: () => {},
    itemCount: 0,
    onActivate: () => {},
    onBack: goBack,
  })

  const promptRows = useMemo(() => buildIndexRows(posts), [posts])

  const copyLink = () => {
    if (!slug) return
    navigator.clipboard.writeText(`${window.location.origin}${postPath(slug)}`)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="font-mono pb-12">
      <SiteHeader />

      <main className="px-2 md:px-0">
        {loading ? (
          <p className="text-sm text-content-muted">loading post...</p>
        ) : error ? (
          <div className="space-y-4 text-sm">
            <p className="text-error">{error}</p>
            <Link to={postsIndexPath} className="inline-block text-content hover:text-content-secondary transition-colors">
              ← back to writing
            </Link>
          </div>
        ) : !post ? (
          <p className="text-sm text-content-muted">post not found.</p>
        ) : (
          <article className="space-y-6">
            <header className="space-y-2 border-b border-border pb-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-xl font-medium text-content">{post.title.toLowerCase()}</h2>
                {post.date && (
                  <span className="text-xs text-content-muted">{formatShortDate(post.date)}</span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-content-muted">
                {post.tags.map((tag) => (
                  <span key={tag}>#{tag.toLowerCase()}</span>
                ))}
                <button
                  type="button"
                  onClick={copyLink}
                  className="text-content-muted hover:text-content transition-colors"
                >
                  {copied ? 'copied' : 'copy link'}
                </button>
              </div>
            </header>

            {post.blocks.length > 0 ? (
              <NotionRenderer blocks={post.blocks} />
            ) : (
              <p className="text-sm text-content-muted italic">no content</p>
            )}
          </article>
        )}

        <div className="mt-8 border-t border-border pt-3 space-y-2">
          <p className="hidden md:block text-xs text-content-muted">esc back</p>
          <TerminalPrompt rows={promptRows} />
        </div>
      </main>
    </div>
  )
}
