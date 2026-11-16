import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  getTrips,
  getTrip,
  verifyTripAdmin,
  updateSpot,
  reorderSpots,
  uploadSpotImage,
  importGoogleMapsUrl,
} from './trips'
import {
  extractListIdFromUrl,
  isAllowedGoogleMapsUrl,
  isGoogleMapsListUrl,
  parseEntityListJson,
  parsePlaceFromGoogleMapsUrl,
} from '../../functions/api/trips/_mapsParser'

describe('trips service', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches trips list', async () => {
    const mockTrips = [{ id: 't1', slug: 'taiwan', title: 'taiwan', regionCount: 6, spotCount: 0 }]
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(mockTrips), { status: 200 }),
    )

    const res = await getTrips()
    expect(fetchMock).toHaveBeenCalledWith('/api/trips')
    expect(res).toEqual(mockTrips)
  })

  it('fetches single trip detail by slug', async () => {
    const mockDetail = { trip: { id: 't1', slug: 'taiwan', title: 'taiwan' }, regions: [] }
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(mockDetail), { status: 200 }),
    )

    const res = await getTrip('taiwan')
    expect(fetchMock).toHaveBeenCalledWith('/api/trips/taiwan')
    expect(res).toEqual(mockDetail)
  })

  it('verifies admin passcode via bearer token', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    )

    const ok = await verifyTripAdmin('secret-123')
    expect(ok).toBe(true)
    expect(fetchMock).toHaveBeenCalledWith('/api/trips/auth', {
      method: 'POST',
      headers: { Authorization: 'Bearer secret-123' },
    })
  })

  it('sends atomic spot reorder payload', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    )

    await reorderSpots('tok', 'taiwan', [{ id: 's1', bucket: 'visited', sortOrder: 0 }])
    expect(fetchMock).toHaveBeenCalledWith('/api/trips/taiwan/spots', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer tok',
      },
      body: JSON.stringify({ reorder: [{ id: 's1', bucket: 'visited', sortOrder: 0 }] }),
    })
  })

  it('updates spot recommended badge', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    )

    await updateSpot('tok', 'taiwan', { id: 's1', recommended: true })
    expect(fetchMock).toHaveBeenCalledWith('/api/trips/taiwan/spots', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer tok',
      },
      body: JSON.stringify({ id: 's1', recommended: true }),
    })
  })

  it('uploads spot image as multipart form data', async () => {
    const mockImg = { id: 'img1', spotId: 's1', r2Key: 'trips/s1/img1.png', url: '/api/trips/media/x', caption: null, sortOrder: 0 }
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(mockImg), { status: 200 }),
    )
    const file = new File(['abc'], 'photo.png', { type: 'image/png' })

    const res = await uploadSpotImage('tok', 's1', file, 'lunch')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0]?.[0]).toBe('/api/trips/images')
    expect(res).toEqual(mockImg)
  })

  it('calls maps-import endpoint with bearer token', async () => {
    const mockRes = { kind: 'place', listTitle: null, sourceUrl: 'https://www.google.com/maps/place/Test', spots: [] }
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(mockRes), { status: 200 }),
    )

    const res = await importGoogleMapsUrl('tok', 'https://maps.app.goo.gl/abc')
    expect(fetchMock).toHaveBeenCalledWith('/api/trips/maps-import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer tok',
      },
      body: JSON.stringify({ url: 'https://maps.app.goo.gl/abc' }),
    })
    expect(res).toEqual(mockRes)
  })
})

describe('google maps parser', () => {
  it('validates allowed Google Maps URLs and rejects non-Google hosts', () => {
    expect(isAllowedGoogleMapsUrl('https://maps.app.goo.gl/xyz123')).not.toBeNull()
    expect(isAllowedGoogleMapsUrl('https://www.google.com/maps/place/Din+Tai+Fung/@25.03,121.56,17z')).not.toBeNull()
    expect(isAllowedGoogleMapsUrl('https://evil.com/maps')).toBeNull()
    expect(isAllowedGoogleMapsUrl('http://localhost:8788/api')).toBeNull()
  })

  it('extracts place name and exact pin coordinates from place URL', () => {
    const url = new URL(
      'https://www.google.com/maps/place/Din+Tai+Fung/@25.0300,121.5600,17z/data=!3m1!4b1!4m6!3m5!1s0x0:0x0!8m2!3d25.033964!4d121.564468',
    )
    expect(parsePlaceFromGoogleMapsUrl(url)).toEqual({
      name: 'din tai fung',
      url: url.toString(),
      lat: 25.033964,
      lng: 121.564468,
      note: null,
    })
  })

  it('detects list URLs and extracts list IDs', () => {
    const url = new URL('https://www.google.com/maps/placelists/list/abcDEF123_xyz?hl=en')
    expect(isGoogleMapsListUrl(url)).toBe(true)
    expect(extractListIdFromUrl(url)).toBe('abcDEF123_xyz')
  })

  it('parses Google Maps entitylist JSON response', () => {
    const payload = `)]}'\n${JSON.stringify([
      [
        'list-id',
        null,
        null,
        null,
        'Taipei Eats',
        null,
        null,
        null,
        [
          [
            null,
            [null, null, null, null, 'Taipei, Taiwan', [null, null, 25.0339, 121.5645]],
            'Din Tai Fung',
            'Xiao long bao',
          ],
          [
            null,
            [null, null, null, null, 'Taipei, Taiwan', [null, null, 25.0512, 121.5204]],
            'Simple Kaffa',
            null,
          ],
        ],
      ],
    ])}`

    expect(parseEntityListJson(payload)).toEqual([
      {
        name: 'din tai fung',
        lat: 25.0339,
        lng: 121.5645,
        note: 'xiao long bao',
        url: 'https://www.google.com/maps/search/?api=1&query=Din%20Tai%20Fung%2025.0339%2C121.5645',
      },
      {
        name: 'simple kaffa',
        lat: 25.0512,
        lng: 121.5204,
        note: null,
        url: 'https://www.google.com/maps/search/?api=1&query=Simple%20Kaffa%2025.0512%2C121.5204',
      },
    ])
  })
})
