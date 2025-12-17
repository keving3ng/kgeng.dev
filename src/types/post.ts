export interface Post {
  id: string
  title: string
  slug: string
  tags: string[]
  date: string | null
}

export interface PostWithContent extends Post {
  blocks: NotionBlock[]
}

// Notion block types we support
export type NotionBlock =
  | ParagraphBlock
  | Heading1Block
  | Heading2Block
  | Heading3Block
  | BulletedListItemBlock
  | NumberedListItemBlock
  | CodeBlock
  | ImageBlock
  | VideoBlock
  | QuoteBlock
  | DividerBlock
  | CalloutBlock
  | ColumnListBlock
  | ColumnBlock

interface BaseBlock {
  id: string
  type: string
  has_children?: boolean
}

export interface RichText {
  type: 'text'
  text: { content: string; link: { url: string } | null }
  annotations: {
    bold: boolean
    italic: boolean
    strikethrough: boolean
    underline: boolean
    code: boolean
    color: string
  }
  plain_text: string
  href: string | null
}

export interface ParagraphBlock extends BaseBlock {
  type: 'paragraph'
  paragraph: { rich_text: RichText[] }
}

export interface Heading1Block extends BaseBlock {
  type: 'heading_1'
  heading_1: { rich_text: RichText[] }
}

export interface Heading2Block extends BaseBlock {
  type: 'heading_2'
  heading_2: { rich_text: RichText[] }
}

export interface Heading3Block extends BaseBlock {
  type: 'heading_3'
  heading_3: { rich_text: RichText[] }
}

export interface BulletedListItemBlock extends BaseBlock {
  type: 'bulleted_list_item'
  bulleted_list_item: { rich_text: RichText[] }
}

export interface NumberedListItemBlock extends BaseBlock {
  type: 'numbered_list_item'
  numbered_list_item: { rich_text: RichText[] }
}

export interface CodeBlock extends BaseBlock {
  type: 'code'
  code: { rich_text: RichText[]; language: string }
}

export interface ImageBlock extends BaseBlock {
  type: 'image'
  image:
    | { type: 'external'; external: { url: string }; caption: RichText[] }
    | { type: 'file'; file: { url: string }; caption: RichText[] }
}

export interface VideoBlock extends BaseBlock {
  type: 'video'
  video:
    | { type: 'external'; external: { url: string } }
    | { type: 'file'; file: { url: string } }
}

export interface QuoteBlock extends BaseBlock {
  type: 'quote'
  quote: { rich_text: RichText[] }
}

export interface DividerBlock extends BaseBlock {
  type: 'divider'
}

export interface CalloutBlock extends BaseBlock {
  type: 'callout'
  callout: { rich_text: RichText[]; icon: { emoji: string } | null }
}

export interface ColumnListBlock extends BaseBlock {
  type: 'column_list'
  column_list: Record<string, never>
  children?: NotionBlock[]
}

export interface ColumnBlock extends BaseBlock {
  type: 'column'
  column: Record<string, never>
  children?: NotionBlock[]
}
