-- Blog posts imported from Notion and managed in D1 CMS
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  notion_page_id TEXT UNIQUE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tags TEXT NOT NULL DEFAULT '[]',
  date TEXT,
  published INTEGER NOT NULL DEFAULT 1,
  blocks TEXT NOT NULL DEFAULT '[]',
  synced_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_posts_published_date ON posts(published, date DESC);
