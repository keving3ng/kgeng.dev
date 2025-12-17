import type { NotionBlock, RichText } from '../types/post'

interface NotionRendererProps {
  blocks: NotionBlock[]
}

function RichTextRenderer({ richText }: { richText: RichText[] }) {
  return (
    <>
      {richText.map((text, i) => {
        let content: React.ReactNode = text.plain_text

        if (text.annotations.code) {
          content = (
            <code className="bg-surface-secondary px-1.5 py-0.5 rounded text-sm font-mono">
              {content}
            </code>
          )
        }
        if (text.annotations.bold) {
          content = <strong className="font-semibold">{content}</strong>
        }
        if (text.annotations.italic) {
          content = <em>{content}</em>
        }
        if (text.annotations.strikethrough) {
          content = <s>{content}</s>
        }
        if (text.annotations.underline) {
          content = <u>{content}</u>
        }
        if (text.href) {
          content = (
            <a
              href={text.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-content-secondary underline hover:text-content"
            >
              {content}
            </a>
          )
        }

        return <span key={i}>{content}</span>
      })}
    </>
  )
}

function BlockRenderer({ block }: { block: NotionBlock }) {
  switch (block.type) {
    case 'paragraph':
      return (
        <p className="mb-4 text-content-secondary leading-relaxed">
          <RichTextRenderer richText={block.paragraph.rich_text} />
        </p>
      )

    case 'heading_1':
      return (
        <h1 className="text-2xl font-semibold mb-4 mt-8">
          <RichTextRenderer richText={block.heading_1.rich_text} />
        </h1>
      )

    case 'heading_2':
      return (
        <h2 className="text-xl font-semibold mb-3 mt-6">
          <RichTextRenderer richText={block.heading_2.rich_text} />
        </h2>
      )

    case 'heading_3':
      return (
        <h3 className="text-lg font-semibold mb-2 mt-4">
          <RichTextRenderer richText={block.heading_3.rich_text} />
        </h3>
      )

    case 'bulleted_list_item':
      return (
        <li className="ml-4 mb-1 text-content-secondary list-disc">
          <RichTextRenderer richText={block.bulleted_list_item.rich_text} />
          {block.children && block.children.length > 0 && (
            <ul className="mt-1">
              {block.children.map((child) => (
                <BlockRenderer key={child.id} block={child} />
              ))}
            </ul>
          )}
        </li>
      )

    case 'numbered_list_item':
      return (
        <li className="ml-4 mb-1 text-content-secondary list-decimal">
          <RichTextRenderer richText={block.numbered_list_item.rich_text} />
          {block.children && block.children.length > 0 && (
            <ol className="mt-1">
              {block.children.map((child) => (
                <BlockRenderer key={child.id} block={child} />
              ))}
            </ol>
          )}
        </li>
      )

    case 'code':
      return (
        <pre className="bg-surface-secondary p-4 rounded-lg mb-4 overflow-x-auto">
          <code className="text-sm font-mono">
            <RichTextRenderer richText={block.code.rich_text} />
          </code>
        </pre>
      )

    case 'image': {
      // Use proxy for Notion-hosted images (they expire after ~1 hour)
      const url =
        block.image.type === 'external'
          ? block.image.external.url
          : `/api/image/${block.id}`
      const caption = block.image.caption
      return (
        <figure className="mb-4">
          <img
            src={url}
            alt={caption?.[0]?.plain_text || ''}
            className="rounded-lg max-w-full"
          />
          {caption && caption.length > 0 && (
            <figcaption className="text-sm text-content-muted mt-2 text-center">
              <RichTextRenderer richText={caption} />
            </figcaption>
          )}
        </figure>
      )
    }

    case 'video': {
      const url =
        block.video.type === 'external'
          ? block.video.external.url
          : block.video.file.url

      // Handle YouTube embeds
      const youtubeMatch = url.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/
      )
      if (youtubeMatch) {
        return (
          <div className="mb-4 aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeMatch[1]}`}
              className="w-full h-full rounded-lg"
              allowFullScreen
            />
          </div>
        )
      }

      return (
        <video src={url} controls className="w-full rounded-lg mb-4">
          Your browser does not support the video tag.
        </video>
      )
    }

    case 'quote':
      return (
        <blockquote className="border-l-4 border-content-muted pl-4 mb-4 italic text-content-secondary">
          <RichTextRenderer richText={block.quote.rich_text} />
          {block.children && block.children.length > 0 && (
            <div className="mt-2 not-italic">
              {block.children.map((child) => (
                <BlockRenderer key={child.id} block={child} />
              ))}
            </div>
          )}
        </blockquote>
      )

    case 'divider':
      return <hr className="my-8 border-border" />

    case 'callout':
      return (
        <div className="bg-surface-secondary p-4 rounded-lg mb-4 flex gap-3">
          {block.callout.icon && (
            <span className="text-xl">{block.callout.icon.emoji}</span>
          )}
          <div className="text-content-secondary flex-1">
            <RichTextRenderer richText={block.callout.rich_text} />
            {block.children && block.children.length > 0 && (
              <div className="mt-2">
                {block.children.map((child) => (
                  <BlockRenderer key={child.id} block={child} />
                ))}
              </div>
            )}
          </div>
        </div>
      )

    case 'column_list':
      return (
        <div className="flex gap-4 mb-4">
          {block.children?.map((child) => (
            <BlockRenderer key={child.id} block={child} />
          ))}
        </div>
      )

    case 'column':
      return (
        <div className="flex-1 min-w-0">
          {block.children?.map((child) => (
            <BlockRenderer key={child.id} block={child} />
          ))}
        </div>
      )

    case 'toggle':
      return (
        <details className="mb-4">
          <summary className="cursor-pointer text-content-secondary hover:text-content">
            <RichTextRenderer richText={block.toggle.rich_text} />
          </summary>
          {block.children && block.children.length > 0 && (
            <div className="pl-4 mt-2 border-l-2 border-border">
              {block.children.map((child) => (
                <BlockRenderer key={child.id} block={child} />
              ))}
            </div>
          )}
        </details>
      )

    default:
      return null
  }
}

export default function NotionRenderer({ blocks }: NotionRendererProps) {
  return (
    <div className="notion-content">
      {blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </div>
  )
}
