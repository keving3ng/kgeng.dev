/**
 * Notion API Types
 *
 * Type definitions for Notion API responses used across the API layer.
 * These types cover the subset of Notion's API that this codebase uses.
 */

// ============================================================================
// Rich Text Types
// ============================================================================

export interface NotionRichText {
  plain_text: string
  href?: string | null
  annotations?: {
    bold?: boolean
    italic?: boolean
    strikethrough?: boolean
    underline?: boolean
    code?: boolean
    color?: string
  }
}

// ============================================================================
// Property Types
// ============================================================================

export interface NotionTitleProperty {
  title?: NotionRichText[]
}

export interface NotionRichTextProperty {
  rich_text?: NotionRichText[]
}

export interface NotionMultiSelectProperty {
  multi_select?: Array<{ name: string }>
}

export interface NotionDateProperty {
  date?: { start: string | null }
}

export interface NotionCheckboxProperty {
  checkbox?: boolean
}

export interface NotionUrlProperty {
  url?: string | null
}

// ============================================================================
// Page Types
// ============================================================================

/**
 * Notion page object from database query results.
 * Properties vary by database schema.
 */
export interface NotionPage {
  id: string
  properties: {
    // Posts database properties
    Title?: NotionTitleProperty
    Slug?: NotionRichTextProperty
    Tags?: NotionMultiSelectProperty
    Date?: NotionDateProperty
    Published?: NotionCheckboxProperty
    // Recipes database properties
    'Recipe Name'?: NotionTitleProperty
    Link?: NotionUrlProperty
    Notes?: NotionRichTextProperty
  }
}

/**
 * Response from Notion database query endpoint.
 */
export interface NotionDatabaseQueryResponse {
  results: NotionPage[]
  has_more: boolean
  next_cursor: string | null
}

// ============================================================================
// Block Types
// ============================================================================

/**
 * Notion block object from block children endpoint.
 * Type-specific content is accessed via block[block.type].
 */
export interface NotionBlock {
  id: string
  type: string
  has_children?: boolean
  children?: NotionBlock[]
  // Block type-specific content accessed dynamically
  [key: string]: unknown
}

/**
 * Response from Notion block children endpoint.
 */
export interface NotionBlockChildrenResponse {
  results: NotionBlock[]
  has_more: boolean
  next_cursor: string | null
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Safely extract title text from a Notion page.
 */
export function getTitle(page: NotionPage, property: 'Title' | 'Recipe Name' = 'Title'): string {
  const prop = page.properties[property] as NotionTitleProperty | undefined
  return prop?.title?.[0]?.plain_text || 'Untitled'
}

/**
 * Safely extract slug text from a Notion page.
 */
export function getSlug(page: NotionPage): string {
  return page.properties.Slug?.rich_text?.[0]?.plain_text || page.id
}

/**
 * Safely extract tags from a Notion page.
 */
export function getTags(page: NotionPage): string[] {
  return page.properties.Tags?.multi_select?.map((tag) => tag.name) || []
}

/**
 * Safely extract date from a Notion page.
 */
export function getDate(page: NotionPage): string | null {
  return page.properties.Date?.date?.start || null
}

/**
 * Safely extract URL from a Notion page (for recipes).
 */
export function getUrl(page: NotionPage): string | null {
  return page.properties.Link?.url || null
}

/**
 * Safely extract notes from a Notion page (for recipes).
 */
export function getNotes(page: NotionPage): string | null {
  return page.properties.Notes?.rich_text?.[0]?.plain_text || null
}
