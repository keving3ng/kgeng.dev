# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start full stack dev server (localhost:8788)
npm run build    # TypeScript check + production build
npm run lint     # ESLint with zero warnings policy
npm run preview  # Preview production build with Functions
```

## Architecture

Personal website/blog built with React + TypeScript + Vite + Tailwind CSS, deployed on Cloudflare Pages.

### Content Management

Posts are managed in Notion and fetched via the Notion API:
- **Database schema**: Title, Slug, Tags (multi-select), Date, Published (checkbox)
- **API proxy**: Cloudflare Pages Functions in `functions/api/`
- **Client service**: `src/services/posts.ts` fetches from `/api/posts`

### Routing

React Router handles navigation in `src/App.tsx`:
- `/` - Home (main newsfeed)
- `/blog` - Blog page
- `/about` - About page
- `/tools/*` - Tool pages (e.g., `/tools/splits`, `/tools/recipeer`)
- `/picks` - Recommendations list (static)
- `/recipes` - Recipe list (from Notion)

### Layout Structure

The site uses a centered layout with a sidebar + newsfeed pattern:
- `Layout.tsx` - Outer container, centers content horizontally/vertically with max-width
- `Sidebar.tsx` - Left sidebar with filters (tags), tools, and external links
- `Newsfeed.tsx` - Scrollable feed of collapsible articles, fetches content on expand

### Key Patterns

- **Filters**: Defined in page components, passed to Sidebar. "All Posts" maps to `null` filter state.
- **Collapsible articles**: Newsfeed items expand/collapse via caret toggle, content fetched lazily.
- **Notion blocks**: `NotionRenderer.tsx` converts Notion API blocks to React components.
- **Lowercase styling**: Tags and links display lowercase via `.toLowerCase()` in render.
- **External links**: Marked with ↗ arrow to distinguish from internal navigation.

### Environment Variables

For local development, copy `.dev.vars.example` to `.dev.vars`:
- `NOTION_API_KEY` - Notion integration token
- `NOTION_DATABASE_ID` - ID of the posts database
- `NOTION_RECIPES_DATABASE_ID` - ID of the recipes database

### Styling

All styling uses Tailwind CSS utility classes. Dark mode supported via `dark:` variants.
