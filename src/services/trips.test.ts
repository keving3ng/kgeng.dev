import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  getTrips,
  getTrip,
  verifyTripAdmin,
  updateSpot,
  reorderSpots,
  uploadSpotImage,
} from './trips'

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
})
