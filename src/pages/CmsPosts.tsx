import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import { paths } from '../config/paths'
import { useTripAdmin } from '../hooks/useTripAdmin'
import {
  deleteCmsPost,
  getCmsPosts,
  syncPostsFromNotion,
} from '../services/posts'
import type { CmsPostSummary } from '../types/post'

type FilterTab = 'all' | 'published' | 'drafts'

export default function CmsPosts() {
  const { token, isAuthenticated, lock } = useTripAdmin()
  const [posts, setPosts] = useState<CmsPostSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncingPageId, setSyncingPageId] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterTab>('all')

  const loadPosts = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const list = await getCmsPosts(token)
      setPosts(list)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'failed to load posts')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (isAuthenticated && token) {
      void loadPosts()
    }
  }, [isAuthenticated, token, loadPosts])

  const handleSyncAll = async () => {
    if (!token || syncing) return
    setSyncing(true)
    setError(null)
    setStatusMessage(null)
    try {
      const res = await syncPostsFromNotion(token)
      setStatusMessage(
        `synced ${res.synced} ${res.synced === 1 ? 'article' : 'articles'} from notion (${res.created} new, ${res.updated} updated)`,
      )
      await loadPosts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'failed to sync from notion')
    } finally {
      setSyncing(false)
    }
  }

  const handleSyncOne = async (notionPageId: string) => {
    if (!token || syncingPageId) return
    setSyncingPageId(notionPageId)
    setError(null)
    setStatusMessage(null)
    try {
      await syncPostsFromNotion(token, notionPageId)
      setStatusMessage('synced latest content from notion')
      await loadPosts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'failed to sync article from notion')
    } finally {
      setSyncingPageId(null)
    }
  }

  const handleDelete = async (post: CmsPostSummary) => {
    if (!token) return
    if (!window.confirm(`remove "${post.title.toLowerCase()}" from cms? (notion page is untouched)`)) {
      return
    }
    setError(null)
    try {
      await deleteCmsPost(token, post.id)
      setPosts((prev) => prev.filter((p) => p.id !== post.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'failed to delete post')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-surface text-content flex items-center justify-center px-4 pb-24">
        <div className="w-full max-w-xs space-y-3 text-center">
          <p className="text-sm text-content-secondary">cms session is locked.</p>
          <Link
            to={paths.cms}
            className="inline-block rounded-full border border-border bg-surface-secondary px-4 py-1.5 text-xs text-content hover:border-content-muted transition-colors"
          >
            unlock cms
          </Link>
        </div>
      </div>
    )
  }

  const publishedCount = posts.filter((p) => p.published).length
  const draftsCount = posts.length - publishedCount
  const filteredPosts = posts.filter((p) => {
    if (filter === 'published') return p.published
    if (filter === 'drafts') return !p.published
    return true
  })

  return (
    <div className="min-h-screen pb-16">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            to={paths.cms}
            className="inline-block text-xs text-content-muted hover:text-content transition-colors mb-2"
          >
            ← cms
          </Link>
          <h1 className="text-2xl font-medium text-content">blog management</h1>
          <p className="mt-1 text-sm text-content-secondary">
            sync articles from notion into d1. edit content and metadata in notion.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link
            to={paths.trips}
            className="rounded-full border border-border px-3 py-1.5 text-xs text-content-secondary hover:text-content transition-colors"
          >
            trips
          </Link>
          <button
            type="button"
            onClick={() => {
              void handleSyncAll()
            }}
            disabled={syncing}
            className="rounded-full bg-content px-3.5 py-1.5 text-xs font-medium text-surface hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {syncing ? 'syncing…' : 'sync'}
          </button>
          <button
            type="button"
            onClick={lock}
            className="rounded-full border border-border px-3 py-1.5 text-xs text-content-muted hover:text-content"
          >
            lock
          </button>
          <ThemeToggle />
        </div>
      </header>

      {statusMessage && (
        <div className="mb-4 rounded-xl border border-border bg-surface-secondary/50 px-4 py-2.5 text-xs text-content">
          {statusMessage}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-border bg-surface-secondary/50 px-4 py-2.5 text-xs text-error">
          {error}
        </div>
      )}

      <div className="mb-5 flex flex-wrap items-center gap-2 text-xs">
        {(
          [
            ['all', `all (${posts.length})`],
            ['published', `published (${publishedCount})`],
            ['drafts', `drafts (${draftsCount})`],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`rounded-full border px-3 py-1 transition-colors ${
              filter === key
                ? 'border-content bg-content text-surface font-medium'
                : 'border-border bg-surface-secondary/40 text-content-secondary hover:text-content'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && posts.length === 0 ? (
        <p className="py-12 text-sm text-content-muted">loading posts…</p>
      ) : filteredPosts.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface-secondary/30 p-8 text-center space-y-3">
          <p className="text-sm text-content-secondary">
            {posts.length === 0
              ? 'no articles synced yet.'
              : 'no articles match this filter.'}
          </p>
          {posts.length === 0 && (
            <button
              type="button"
              onClick={() => {
                void handleSyncAll()
              }}
              disabled={syncing}
              className="rounded-full bg-content px-4 py-1.5 text-xs font-medium text-surface hover:opacity-90 disabled:opacity-50"
            >
              {syncing ? 'syncing…' : 'sync from notion'}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPosts.map((post) => {
            const isSyncingOne = Boolean(post.notionPageId && syncingPageId === post.notionPageId)

            return (
              <div
                key={post.id}
                className="rounded-2xl border border-border bg-surface-secondary/35 p-4 transition-colors"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm font-medium text-content">
                        {post.title.toLowerCase()}
                      </h2>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[11px] ${
                          post.published
                            ? 'border-content bg-surface text-content font-medium'
                            : 'border-border bg-surface text-content-muted'
                        }`}
                      >
                        {post.published ? 'published' : 'draft'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-content-muted">
                      <span>/post/{post.slug}</span>
                      {post.date && <span>{post.date}</span>}
                      <span>{post.blockCount} blocks</span>
                      <span>synced {post.syncedAt.slice(0, 10)}</span>
                    </div>

                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-surface px-2 py-0.5 text-[11px] text-content-secondary"
                          >
                            #{tag.toLowerCase()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5 text-[11px]">
                    {post.notionPageId && (
                      <button
                        type="button"
                        onClick={() => {
                          void handleSyncOne(post.notionPageId!)
                        }}
                        disabled={isSyncingOne}
                        className="rounded-lg border border-border bg-surface px-2 py-1 text-content-secondary hover:text-content disabled:opacity-50"
                      >
                        {isSyncingOne ? 'syncing…' : 'sync'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        void handleDelete(post)
                      }}
                      className="rounded-lg border border-border bg-surface px-2 py-1 text-error hover:bg-surface-secondary"
                    >
                      del
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
