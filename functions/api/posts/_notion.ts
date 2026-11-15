import { enrichBlocksWithChildren, fetchNotionBlockChildren, logger } from '../_shared'
import { API_CONFIG } from '../config'
import {
  NotionBlock,
  NotionDatabaseQueryResponse,
  NotionPage,
  getDate,
  getPublished,
  getSlug,
  getTags,
  getTitle,
} from '../types/notion'

export interface SyncedNotionPost {
  id: string
  notionPageId: string
  title: string
  slug: string
  tags: string[]
  date: string | null
  published: boolean
  blocks: NotionBlock[]
}

export async function fetchNotionPostPages(
  apiKey: string,
  databaseId: string,
  options: { publishedOnly?: boolean } = {},
): Promise<NotionPage[]> {
  const pages: NotionPage[] = []
  let startCursor: string | undefined

  do {
    const body: Record<string, unknown> = {
      sorts: [{ property: 'Date', direction: 'descending' }],
      page_size: 100,
    }
    if (options.publishedOnly) {
      body.filter = {
        property: 'Published',
        checkbox: { equals: true },
      }
    }
    if (startCursor) {
      body.start_cursor = startCursor
    }

    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Notion-Version': API_CONFIG.NOTION_API_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Notion query failed (${response.status}): ${errorText}`)
    }

    const data = (await response.json()) as NotionDatabaseQueryResponse
    pages.push(...data.results)
    startCursor = data.has_more && data.next_cursor ? data.next_cursor : undefined
  } while (startCursor)

  return pages
}

export async function fetchNotionPageById(apiKey: string, pageId: string): Promise<NotionPage> {
  const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Notion-Version': API_CONFIG.NOTION_API_VERSION,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Notion page fetch failed (${response.status}): ${errorText}`)
  }

  return (await response.json()) as NotionPage
}

export async function fetchNotionPostWithBlocks(
  apiKey: string,
  page: NotionPage,
): Promise<SyncedNotionPost> {
  let fetchError: { status: number; detail: string } | null = null
  const allBlocks = await fetchNotionBlockChildren({
    blockId: page.id,
    apiKey,
    onError: (status, detail) => {
      fetchError = { status, detail }
      logger.error('Failed to fetch blocks', { endpoint: 'posts/sync', status, pageId: page.id, detail })
    },
  })

  if (fetchError && allBlocks.length === 0) {
    throw new Error(`Failed to fetch blocks for page ${page.id}`)
  }

  const enrichedBlocks = await enrichBlocksWithChildren(allBlocks, {
    apiKey,
    onError: (status, blockId, detail) => {
      logger.warn('Failed to fetch block children', { endpoint: 'posts/sync', status, blockId, detail })
    },
  })

  return {
    id: page.id,
    notionPageId: page.id,
    title: getTitle(page),
    slug: getSlug(page),
    tags: getTags(page),
    date: getDate(page),
    published: getPublished(page),
    blocks: enrichedBlocks,
  }
}
