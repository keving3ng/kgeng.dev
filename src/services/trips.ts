import type { SpotBucket, SpotImage, TripDetailData, TripRegion, TripSpot, TripSummary } from '../types/trip'

const API_BASE = '/api/trips'

function authHeaders(token: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

async function parseError(response: Response, fallback: string): Promise<never> {
  try {
    const data = (await response.json()) as { error?: string }
    if (data?.error) throw new Error(data.error)
  } catch (err) {
    if (err instanceof Error && err.message !== fallback && !err.message.includes('JSON')) {
      throw err
    }
  }
  throw new Error(fallback)
}

export async function verifyTripAdmin(token: string): Promise<boolean> {
  const response = await fetch(`${API_BASE}/auth`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.ok
}

export async function getTrips(): Promise<TripSummary[]> {
  const response = await fetch(API_BASE)
  if (!response.ok) await parseError(response, 'failed to fetch trips')
  return response.json()
}

export async function createTrip(
  token: string,
  payload: { title: string; subtitle?: string; country?: string },
): Promise<{ id: string; slug: string; title: string }> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  })
  if (!response.ok) await parseError(response, 'failed to create trip')
  return response.json()
}

export async function getTrip(slug: string): Promise<TripDetailData> {
  const response = await fetch(`${API_BASE}/${encodeURIComponent(slug)}`)
  if (!response.ok) await parseError(response, 'failed to fetch trip')
  return response.json()
}

export async function createRegion(
  token: string,
  tripSlug: string,
  payload: {
    name: string
    summary?: string
    color: string
    mapRegionKeys?: string[]
    centerLat?: number | null
    centerLng?: number | null
  },
): Promise<TripRegion> {
  const response = await fetch(`${API_BASE}/${encodeURIComponent(tripSlug)}/regions`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  })
  if (!response.ok) await parseError(response, 'failed to create region')
  return response.json()
}

export async function updateRegion(
  token: string,
  tripSlug: string,
  payload: {
    id: string
    name?: string
    summary?: string | null
    color?: string
    mapRegionKeys?: string[]
    centerLat?: number | null
    centerLng?: number | null
  },
): Promise<void> {
  const response = await fetch(`${API_BASE}/${encodeURIComponent(tripSlug)}/regions`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  })
  if (!response.ok) await parseError(response, 'failed to update region')
}

export async function reorderRegions(
  token: string,
  tripSlug: string,
  orderedIds: string[],
): Promise<void> {
  const response = await fetch(`${API_BASE}/${encodeURIComponent(tripSlug)}/regions`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ orderedIds }),
  })
  if (!response.ok) await parseError(response, 'failed to reorder regions')
}

export async function deleteRegion(token: string, tripSlug: string, id: string): Promise<void> {
  const response = await fetch(
    `${API_BASE}/${encodeURIComponent(tripSlug)}/regions?id=${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    },
  )
  if (!response.ok) await parseError(response, 'failed to delete region')
}

export async function createSpot(
  token: string,
  tripSlug: string,
  payload: {
    regionId: string
    name: string
    bucket: SpotBucket
    recommended?: boolean
    category?: string
    note?: string
    url?: string
    lat?: number | null
    lng?: number | null
  },
): Promise<TripSpot> {
  const response = await fetch(`${API_BASE}/${encodeURIComponent(tripSlug)}/spots`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  })
  if (!response.ok) await parseError(response, 'failed to create spot')
  return response.json()
}

export async function updateSpot(
  token: string,
  tripSlug: string,
  payload: {
    id: string
    name?: string
    bucket?: SpotBucket
    recommended?: boolean
    category?: string | null
    note?: string | null
    url?: string | null
    lat?: number | null
    lng?: number | null
  },
): Promise<void> {
  const response = await fetch(`${API_BASE}/${encodeURIComponent(tripSlug)}/spots`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  })
  if (!response.ok) await parseError(response, 'failed to update spot')
}

export async function reorderSpots(
  token: string,
  tripSlug: string,
  reorder: Array<{ id: string; bucket: SpotBucket; sortOrder: number }>,
): Promise<void> {
  const response = await fetch(`${API_BASE}/${encodeURIComponent(tripSlug)}/spots`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ reorder }),
  })
  if (!response.ok) await parseError(response, 'failed to reorder spots')
}

export async function deleteSpot(token: string, tripSlug: string, id: string): Promise<void> {
  const response = await fetch(
    `${API_BASE}/${encodeURIComponent(tripSlug)}/spots?id=${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    },
  )
  if (!response.ok) await parseError(response, 'failed to delete spot')
}

export interface ImportedMapsSpot {
  name: string
  url: string
  lat: number | null
  lng: number | null
  note: string | null
}

export interface MapsImportResult {
  kind: 'place' | 'list'
  listTitle: string | null
  sourceUrl: string
  spots: ImportedMapsSpot[]
}

export async function importGoogleMapsUrl(
  token: string,
  url: string,
): Promise<MapsImportResult> {
  const response = await fetch(`${API_BASE}/maps-import`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ url }),
  })
  if (!response.ok) await parseError(response, 'failed to import google maps link')
  return response.json()
}

export async function uploadSpotImage(
  token: string,
  spotId: string,
  file: File,
  caption?: string,
): Promise<SpotImage> {
  const form = new FormData()
  form.append('spotId', spotId)
  form.append('file', file)
  if (caption?.trim()) form.append('caption', caption.trim())

  const response = await fetch(`${API_BASE}/images`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  })
  if (!response.ok) await parseError(response, 'failed to upload image')
  return response.json()
}

export async function deleteSpotImage(token: string, imageId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/images?id=${encodeURIComponent(imageId)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) await parseError(response, 'failed to delete image')
}
