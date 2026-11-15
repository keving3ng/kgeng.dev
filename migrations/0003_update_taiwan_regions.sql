-- Update Taiwan trip regions to taipei, alishan, chiayi, tainan, kaohsiung

DELETE FROM regions WHERE trip_id = 'trip-taiwan';

INSERT INTO regions (id, trip_id, slug, name, summary, color, map_region_keys, center_lat, center_lng, sort_order)
VALUES
  (
    'reg-tw-taipei',
    'trip-taiwan',
    'taipei',
    'taipei',
    'night markets, coffee shops, and mountain towns like jiufen.',
    '#ef4444',
    '["taipei-city","new-taipei-city","keelung-city"]',
    25.0330,
    121.5654,
    0
  ),
  (
    'reg-tw-alishan',
    'trip-taiwan',
    'alishan',
    'alishan',
    'misty cedar forests, tea trails in shizhuo, and sunrise views.',
    '#f59e0b',
    '["chiayi-county"]',
    23.5105,
    120.8035,
    1
  ),
  (
    'reg-tw-chiayi',
    'trip-taiwan',
    'chiayi',
    'chiayi',
    'turkey rice, cozy cafes, and the gateway to alishan.',
    '#8b5cf6',
    '["chiayi-city"]',
    23.4801,
    120.4491,
    2
  ),
  (
    'reg-tw-tainan',
    'trip-taiwan',
    'tainan',
    'tainan',
    'old temples, alleys, and the best street food.',
    '#10b981',
    '["tainan-city"]',
    22.9999,
    120.2269,
    3
  ),
  (
    'reg-tw-kaohsiung',
    'trip-taiwan',
    'kaohsiung',
    'kaohsiung',
    'harbor breeze, art piers, and night markets.',
    '#0ea5e9',
    '["kaohsiung-city"]',
    22.6273,
    120.3014,
    4
  );
