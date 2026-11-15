-- Initial Taiwan trip & colorful regional overlays

INSERT OR IGNORE INTO trips (id, slug, title, subtitle, country)
VALUES (
  'trip-taiwan',
  'taiwan',
  'taiwan',
  'regions, favorite spots, places visited, and bookmarks for next time.',
  'taiwan'
);

INSERT OR IGNORE INTO regions (id, trip_id, slug, name, summary, color, map_region_keys, center_lat, center_lng, sort_order)
VALUES
  (
    'reg-tw-north',
    'trip-taiwan',
    'north',
    'taipei & north',
    'night markets, coffee shops, mountain towns, and rain.',
    '#ef4444',
    '["taipei-city","new-taipei-city","keelung-city","taoyuan-city"]',
    25.0330,
    121.5654,
    0
  ),
  (
    'reg-tw-central',
    'trip-taiwan',
    'central',
    'taichung & central',
    'sun moon lake, tea hills, and wide boulevards.',
    '#f59e0b',
    '["taichung-city","miaoli-county","changhua-county","nantou-county"]',
    24.1477,
    120.6736,
    1
  ),
  (
    'reg-tw-tainan',
    'trip-taiwan',
    'tainan',
    'tainan',
    'old temples, alleys, and the best street food.',
    '#10b981',
    '["tainan-city","chiayi-city","chiayi-county","yunlin-county"]',
    22.9999,
    120.2269,
    2
  ),
  (
    'reg-tw-south',
    'trip-taiwan',
    'south',
    'kaohsiung & south',
    'harbor breeze, art piers, and tropical beaches.',
    '#0ea5e9',
    '["kaohsiung-city","pingtung-county"]',
    22.6273,
    120.3014,
    3
  ),
  (
    'reg-tw-east-north',
    'trip-taiwan',
    'yilan-hualien',
    'yilan & hualien',
    'pacific cliffs, marble gorges, and hot springs.',
    '#8b5cf6',
    '["yilan-county","hualien-county"]',
    23.9872,
    121.6016,
    4
  ),
  (
    'reg-tw-taitung',
    'trip-taiwan',
    'taitung',
    'taitung',
    'slow coastal drives, rice fields, and ocean views.',
    '#ec4899',
    '["taitung-county"]',
    22.7583,
    121.1444,
    5
  );
