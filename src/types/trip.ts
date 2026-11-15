export type SpotBucket = 'recommended' | 'visited' | 'saved'

export const SPOT_BUCKETS: SpotBucket[] = ['recommended', 'visited', 'saved']

export const BUCKET_META: Record<SpotBucket, { label: string; hint: string; accent: string }> = {
  recommended: {
    label: 'recommended',
    hint: 'must-go favorites & highlights',
    accent: '#f59e0b',
  },
  visited: {
    label: 'visited',
    hint: 'places i actually went to',
    accent: '#10b981',
  },
  saved: {
    label: 'saved',
    hint: 'bookmarked for next time',
    accent: '#0ea5e9',
  },
}

export const REGION_PALETTE = [
  '#ef4444', // coral red
  '#f59e0b', // warm amber
  '#10b981', // emerald
  '#0ea5e9', // sky blue
  '#8b5cf6', // violet
  '#ec4899', // rose pink
  '#14b8a6', // teal
  '#f97316', // tangerine
] as const

export interface SpotImage {
  id: string
  spotId: string
  r2Key: string
  url: string
  caption: string | null
  sortOrder: number
}

export interface TripSpot {
  id: string
  regionId: string
  name: string
  bucket: SpotBucket
  category: string | null
  note: string | null
  url: string | null
  lat: number | null
  lng: number | null
  sortOrder: number
  images: SpotImage[]
}

export interface TripRegion {
  id: string
  tripId: string
  slug: string
  name: string
  summary: string | null
  color: string
  mapRegionKeys: string[]
  centerLat: number | null
  centerLng: number | null
  sortOrder: number
  spots: TripSpot[]
}

export interface TripSummary {
  id: string
  slug: string
  title: string
  subtitle: string | null
  country: string
  createdAt: string
  updatedAt: string
  regionCount: number
  spotCount: number
}

export interface TripDetailData {
  trip: {
    id: string
    slug: string
    title: string
    subtitle: string | null
    country: string
    createdAt: string
    updatedAt: string
  }
  regions: TripRegion[]
}
