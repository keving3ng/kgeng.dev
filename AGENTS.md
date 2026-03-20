# AGENTS.md

**Canonical project context for AI coding agents** (Cursor, Claude Code, Codex, etc.). Prefer reading this file over inferring conventions from scattered files.

---

## 1. Verify before you finish

After substantive edits:

```bash
npm run check
```

(`check` runs **build** → **lint** → **test`.)

- **Build** runs `tsc && vite build` (typecheck + production bundle).
- **Lint** uses ESLint with **zero warnings** (`--max-warnings 0`). Fix or remove unused disables.
- **Test** runs Vitest once (`vitest run`); use `npm run test:watch` while iterating.

---

## 2. Non‑negotiables

| Rule | Detail |
|------|--------|
| Colors | Tailwind **semantic tokens** only (`bg-surface`, `text-content`, `border-border`, …). No `bg-white dark:bg-…` style hardcoding. |
| Copy | User-facing strings **lowercase** in UI (`.toLowerCase()` where appropriate). |
| API surface | New HTTP behavior → Cloudflare Pages Functions under `functions/api/`, reuse `_shared.ts` (CORS, rate limit, logging). |
| Client API | Call `/api/…` via `src/services/` wrappers; components do not embed `fetch` to Notion. |

---

## 3. Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Full stack: Vite + Wrangler Pages dev (**localhost:8788**). |
| `npm run check` | **build** + **lint** + **test** — run this before finishing substantive work. |
| `npm run build` | TypeScript + Vite production build. |
| `npm run lint` | ESLint, zero warnings. |
| `npm run test` | Vitest, single run (CI-style). |
| `npm run test:watch` | Vitest watch mode. |
| `npm run preview` | Preview production `dist` with Wrangler Pages. |

**Local secrets:** add a root **`.dev.vars`** (gitignored) with `NOTION_API_KEY`, `NOTION_DATABASE_ID`, and `NOTION_RECIPES_DATABASE_ID` from your Notion integration — no committed template file.

**CI:** `.github/workflows/ci.yml` runs **`npm run check`** on pushes to **`main`**, on pull requests, and via **workflow dispatch** (manual). Concurrency cancels superseded runs on the same PR/branch; the job uses a **15m** timeout and **`contents: read`** permission only.

---

## 4. Tests (Vitest)

- **Config:** `vite.config.ts` (`test` block). **Discovery:** `src/**/*.test.{ts,tsx}`.
- **Placement:** Co-locate tests beside the module under test (e.g. `paths.test.ts` next to `paths.ts`) so agents find specs next to implementation.
- **Imports:** Use `import { describe, it, expect } from 'vitest'` (no global test APIs—ESLint stays simple).
- **Environment:** Default is **`node`** (fast, no DOM). For components or DOM-dependent hooks, put `// @vitest-environment jsdom` at the **top** of that test file and add devDependencies **`jsdom`**, **`@testing-library/react`**, **`@testing-library/jest-dom`** when you introduce the first such test.
- **Workers / E2E:** Cloudflare Pages Functions and browser E2E are **not** wired yet; add `@cloudflare/vitest-pool-workers` or Playwright only when you need them—don’t block simple unit tests on that.

---

## 5. Stack & entry points

- **Stack:** React 18 + TypeScript + Vite + Tailwind + React Router; **deploy:** Cloudflare Pages (Functions + optional R2 for image cache).
- **Client bootstrap:** `src/main.tsx` → `src/App.tsx`.
- **Routes:** Registered in **`src/config/routes.tsx`** (`appRoutes`); **`src/config/paths.ts`** holds canonical path strings and `postPath(slug)` for permalinks. Do not scatter `"/tools/..."` literals—extend `paths` and wire the route once.

| Path | Page / behavior |
|------|-----------------|
| `/`, `/cv`, `/post/:slug` | `Home` (newsfeed; slug/cv are variants on home) |
| `/blog` | `Blog` |
| `/about` | `About` |
| `/tools/splits`, `/tools/recipeer`, `/tools/boba` | Tool pages |
| `/picks` | `Picks` |
| `/projects` | `Projects` |
| `/recipes` | `Recipes` |
| `/games` | `Games` (hub + discovery selector) |
| `/games/:gameSlug` | `GameRoute` → game component from `src/games/registry.ts` |

- **Nav config:** `src/config/navigation.ts` (`tools`, `lists`, social links)—URLs must match `paths.ts`.

---

## 6. Task playbooks

### Add or change a **client page / route**

1. Add/update component under `src/pages/`.
2. Add the path to **`src/config/paths.ts`** (if it’s a named page, not only a param route).
3. Append `{ path, Component }` to **`appRoutes`** in **`src/config/routes.tsx`**.
4. If it should appear in the sidebar, update **`src/config/navigation.ts`** (and any filters if it’s feed-related — see `usePostFilters` on blog-style pages).
5. Use semantic color tokens and lowercase UI copy.
6. Run **`npm run check`**.

### Add a **tool** (e.g. under `/tools/...`)

1. New page in `src/pages/`.
2. Add `paths.tools.*` (or a new segment) in **`paths.ts`**, then register in **`routes.tsx`**.
3. Entry in **`navigation.ts`** → `tools` array.

### Add a **mini-game** (under `/games/...`)

1. Create a component under **`src/games/`** (see **`WelcomeGame.tsx`**).
2. Register it in **`src/games/registry.ts`** (`GAME_LIST` — unique **`slug`**).
3. Hub UI (**`src/pages/Games.tsx`**) reads the registry automatically; routing is **`/games/:gameSlug`** via **`GameRoute`** (already wired in **`routes.tsx`**).
4. Use **`gamePath(slug)`** from **`paths.ts`** for links; **`PageHeader`** accepts **`backTo={paths.games}`** and **`backLabel="← games"`** on game pages.
5. Run **`npm run check`**.

### Add or extend **unit tests**

1. Co-locate **`*.test.ts`** / **`*.test.tsx`** next to the module (see §4).
2. Prefer testing pure functions, derived data, and config over full-page snapshots unless you have jsdom + Testing Library set up.
3. Run **`npm run test`** (or **`npm run test:watch`**) and finish with **`npm run check`**.

### Add a **Pages Function / API** endpoint

1. Implement under `functions/api/` (follow existing file layout).
2. Types in `functions/api/types/notion.ts` if Notion-related.
3. Use `_shared.ts`: `getCorsHeaders`, `checkRateLimit`, `errorResponse`, `logger`; match caching pattern (dev vs Cache API in prod — mirror siblings).
4. Allowed origins live in `_shared.ts` (kgeng.dev, www, localhost ports).
5. Document the new route in **this file** (§8).
6. Run **`npm run check`**.

---

## 7. Architecture (reference)

**Content:** Posts and recipes live in **Notion**; the app talks only to **`/api/*`** (proxied by Cloudflare Pages Functions).

**Layout pattern:** `Layout` + `Sidebar` + `Newsfeed`-style pages. Filters: **`null` = “all posts”** (not `""`). Articles expand for lazy-loaded body content.

**Notion rendering:** `NotionRenderer.tsx` maps API blocks to React.

**Theme:** `ThemeContext` + CSS variables in `src/index.css`; themes in `src/config/themes.ts`. Default follows system preference; no localStorage persistence.

**File map**

| Area | Location |
|------|----------|
| Pages Functions | `functions/api/` |
| Shared API helpers | `functions/api/_shared.ts` |
| API constants (TTL, limits, Notion version) | `functions/api/config.ts` |
| Client API wrappers | `src/services/` |
| Hooks | `src/hooks/` |
| Static config (nav, cv, themes, paths, routes) | `src/config/` |
| Mini-games (registry + game components) | `src/games/` |
| Presentational components | `src/components/` (no direct Notion/API calls) |
| Unit tests | `src/**/*.test.{ts,tsx}` (Vitest) |

---

## 8. HTTP API (summary)

| Method & path | Role |
|---------------|------|
| `GET /api/posts` | List published posts |
| `GET /api/posts/[slug]` | Single post + Notion blocks |
| `GET /api/recipes` | Recipes list |
| `GET /api/image/[blockId]` | Image proxy + R2 cache |

**Cross-cutting:** CORS to allowed origins, rate limit ~60/min/IP, image URL allowlist (Notion S3, Unsplash), sanitized client errors + structured server logs.

**Useful `_shared` exports:** `getCorsHeaders`, `errorResponse`, `checkRateLimit`, `logger`, `fetchNotionBlockChildren`, `isAllowedImageUrl`, `enrichBlocksWithChildren`, `isLocalDevelopment`.

---

## 9. Notion schemas

- **Posts:** Title, Slug, Tags (multi-select), Date, Published (checkbox).
- **Recipes:** Recipe Name, Link, Notes, Tags.

---

## 10. Styling tokens (Tailwind)

Semantic tokens (see `tailwind.config.js`): `bg-surface`, `bg-surface-secondary`, `text-content`, `text-content-secondary`, `text-content-muted`, `text-error`, `border-border`.

```jsx
// Good
<div className="bg-surface text-content border-border" />

// Avoid
<div className="bg-white dark:bg-gray-950 …" />
```

Light theme: Solarized-based; dark: gray-950 base.

---

## 11. Duplication policy

**Do not** copy this file into other markdown files. **`CLAUDE.md`** exists only so tools that auto-load it can be pointed at the same rules; it should remain a short pointer to this document.
