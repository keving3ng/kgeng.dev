-- Trips CMS schema for Cloudflare D1

CREATE TABLE IF NOT EXISTS trips (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  country TEXT NOT NULL DEFAULT 'taiwan',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS regions (
  id TEXT PRIMARY KEY,
  trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  summary TEXT,
  color TEXT NOT NULL DEFAULT '#10b981',
  map_region_keys TEXT NOT NULL DEFAULT '[]',
  center_lat REAL,
  center_lng REAL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE(trip_id, slug)
);

CREATE TABLE IF NOT EXISTS spots (
  id TEXT PRIMARY KEY,
  region_id TEXT NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  bucket TEXT NOT NULL CHECK(bucket IN ('recommended', 'visited', 'saved')),
  category TEXT,
  note TEXT,
  url TEXT,
  lat REAL,
  lng REAL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS spot_images (
  id TEXT PRIMARY KEY,
  spot_id TEXT NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  r2_key TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_regions_trip_order ON regions(trip_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_spots_region_bucket_order ON spots(region_id, bucket, sort_order);
CREATE INDEX IF NOT EXISTS idx_spot_images_spot_order ON spot_images(spot_id, sort_order);
