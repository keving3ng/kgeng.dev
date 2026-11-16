export interface ParsedMapsSpot {
  name: string
  url: string
  lat: number | null
  lng: number | null
  note: string | null
}

const ALLOWED_GOOGLE_HOSTS = new Set([
  'maps.app.goo.gl',
  'goo.gl',
  'maps.google.com',
  'www.google.com',
  'google.com',
])

export function isAllowedGoogleMapsUrl(raw: string): URL | null {
  try {
    const url = new URL(raw.trim())
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
    const host = url.hostname.toLowerCase()
    if (!ALLOWED_GOOGLE_HOSTS.has(host)) return null
    if (host === 'goo.gl' && !url.pathname.startsWith('/maps')) return null
    if ((host === 'www.google.com' || host === 'google.com') && !url.pathname.startsWith('/maps')) {
      return null
    }
    return url
  } catch {
    return null
  }
}

export function isGoogleMapsListUrl(url: URL): boolean {
  return (
    url.pathname.includes('/placelists/list/') ||
    url.pathname.includes('/entitylist/') ||
    url.href.includes('!11m2!2s')
  )
}

export function extractListIdFromUrl(url: URL): string | null {
  const pathMatch = /\/placelists\/list\/([^/?#]+)/.exec(url.pathname)
  if (pathMatch?.[1]) return pathMatch[1]
  const dataMatch = /!11m2!2s([^!/?#]+)/.exec(url.href)
  if (dataMatch?.[1]) return dataMatch[1]
  return null
}

function decodeMapsName(raw: string): string {
  try {
    return decodeURIComponent(raw.replace(/\+/g, ' ')).trim().toLowerCase()
  } catch {
    return raw.replace(/\+/g, ' ').trim().toLowerCase()
  }
}

export function parsePlaceFromGoogleMapsUrl(url: URL): ParsedMapsSpot {
  let name = ''
  const placeMatch = /\/maps\/place\/([^/]+)/.exec(url.pathname)
  if (placeMatch?.[1]) {
    name = decodeMapsName(placeMatch[1])
  } else {
    const q = url.searchParams.get('q') ?? url.searchParams.get('query') ?? ''
    if (q && !/^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(q.trim())) {
      name = q.trim().toLowerCase()
    }
  }

  let lat: number | null = null
  let lng: number | null = null

  // Exact place pin coordinates (!3dLAT!4dLNG) take priority over viewport (@LAT,LNG)
  const exactMatch = /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/.exec(url.href)
  if (exactMatch) {
    lat = Number(exactMatch[1])
    lng = Number(exactMatch[2])
  } else {
    const atMatch = /@(-?\d+\.\d+),(-?\d+\.\d+)/.exec(url.href)
    if (atMatch) {
      lat = Number(atMatch[1])
      lng = Number(atMatch[2])
    } else {
      const coordParam = url.searchParams.get('q') ?? url.searchParams.get('ll') ?? ''
      const coordMatch = /^(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)$/.exec(coordParam.trim())
      if (coordMatch) {
        lat = Number(coordMatch[1])
        lng = Number(coordMatch[2])
      }
    }
  }

  return {
    name,
    url: url.toString(),
    lat: lat !== null && Number.isFinite(lat) ? lat : null,
    lng: lng !== null && Number.isFinite(lng) ? lng : null,
    note: null,
  }
}

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&amp;/g, '&')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

export function extractTitleFromHtml(html: string): string | null {
  const ogMatch =
    /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i.exec(html) ??
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i.exec(html)
  const titleMatch = /<title[^>]*>([^<]+)<\/title>/i.exec(html)
  const raw = ogMatch?.[1] ?? titleMatch?.[1]
  if (!raw) return null
  const cleaned = decodeHtmlEntities(raw)
    .replace(/\s*[-·]\s*Google Maps\s*$/i, '')
    .trim()
    .toLowerCase()
  if (!cleaned || cleaned === 'google maps') return null
  return cleaned
}

export function extractGetListUrlsFromHtml(html: string): string[] {
  const matches = html.match(/\/maps\/preview\/entitylist\/getlist[^"'\s\\<>]+/g) ?? []
  const urls = matches.map((m) => {
    const unescaped = m
      .replace(/\\u0026/gi, '&')
      .replace(/\\x26/gi, '&')
      .replace(/&amp;/g, '&')
    return `https://www.google.com${unescaped}`
  })
  return Array.from(new Set(urls))
}

function isValidCoordPair(lat: unknown, lng: unknown): lat is number {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    (lat !== 0 || lng !== 0)
  )
}

function extractEntrySpot(entry: unknown): ParsedMapsSpot | null {
  if (!Array.isArray(entry)) return null

  // Standard Google Maps entitylist entry shape:
  // entry[1] = [..., address (idx 4), [null, null, lat, lng] (idx 5), ...]
  // entry[2] = spot name
  // entry[3] = optional user note
  const loc = Array.isArray(entry[1]) ? entry[1] : null
  const coords = loc && Array.isArray(loc[5]) ? loc[5] : null
  const rawName = typeof entry[2] === 'string' ? entry[2].trim() : ''

  if (rawName && coords && isValidCoordPair(coords[2], coords[3])) {
    const lat = coords[2]
    const lng = coords[3]
    const note = typeof entry[3] === 'string' && entry[3].trim() ? entry[3].trim().toLowerCase() : null
    const name = rawName.toLowerCase()
    return {
      name,
      lat,
      lng,
      note,
      url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${rawName} ${lat},${lng}`)}`,
    }
  }

  return null
}

function findEntriesRecursively(node: unknown, depth = 0): ParsedMapsSpot[] {
  if (depth > 8 || !Array.isArray(node)) return []

  const directSpots = node
    .map((item) => extractEntrySpot(item))
    .filter((spot): spot is ParsedMapsSpot => spot !== null)
  if (directSpots.length > 0) return directSpots

  for (const child of node) {
    if (Array.isArray(child)) {
      const found = findEntriesRecursively(child, depth + 1)
      if (found.length > 0) return found
    }
  }
  return []
}

export function parseEntityListJson(rawText: string): ParsedMapsSpot[] {
  const trimmed = rawText.replace(/^\)\]\}'\s*\n?/, '').trim()
  if (!trimmed) return []

  let parsed: unknown
  try {
    parsed = JSON.parse(trimmed)
  } catch {
    return []
  }

  const root = Array.isArray(parsed) ? parsed : null
  if (!root) return []

  const standardList = (root[0] as unknown[] | undefined)?.[8]
  if (Array.isArray(standardList)) {
    const spots = standardList
      .map((item) => extractEntrySpot(item))
      .filter((spot): spot is ParsedMapsSpot => spot !== null)
    if (spots.length > 0) return spots
  }

  return findEntriesRecursively(root)
}
