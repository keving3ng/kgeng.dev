-- Move "recommended" from a separate bucket into a boolean badge on visited spots
ALTER TABLE spots ADD COLUMN recommended INTEGER NOT NULL DEFAULT 0;
UPDATE spots SET recommended = 1, bucket = 'visited' WHERE bucket = 'recommended';
