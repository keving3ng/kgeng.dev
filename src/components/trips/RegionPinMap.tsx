import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { BUCKET_META, type TripSpot } from '../../types/trip'

interface RegionPinMapProps {
  centerLat: number
  centerLng: number
  spots: TripSpot[]
  activeSpotId: string | null
  onSelectSpot?: (spotId: string) => void
  pickingCoords?: boolean
  pickedCoords?: { lat: number; lng: number } | null
  onPickCoords?: (lat: number, lng: number) => void
}

export default function RegionPinMap({
  centerLat,
  centerLng,
  spots,
  activeSpotId,
  onSelectSpot,
  pickingCoords = false,
  pickedCoords = null,
  onPickCoords,
}: RegionPinMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const layerGroupRef = useRef<L.LayerGroup | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: [centerLat, centerLng],
      zoom: 11,
      scrollWheelZoom: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; openstreetmap',
      maxZoom: 18,
    }).addTo(map)

    const group = L.layerGroup().addTo(map)
    mapRef.current = map
    layerGroupRef.current = group

    return () => {
      map.remove()
      mapRef.current = null
      layerGroupRef.current = null
    }
  }, [centerLat, centerLng])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    map.setView([centerLat, centerLng], 11)
  }, [centerLat, centerLng])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const handleClick = (e: L.LeafletMouseEvent) => {
      if (pickingCoords && onPickCoords) {
        onPickCoords(Number(e.latlng.lat.toFixed(5)), Number(e.latlng.lng.toFixed(5)))
      }
    }

    map.on('click', handleClick)
    return () => {
      map.off('click', handleClick)
    }
  }, [pickingCoords, onPickCoords])

  useEffect(() => {
    const group = layerGroupRef.current
    if (!group) return
    group.clearLayers()

    for (const spot of spots) {
      if (spot.lat === null || spot.lng === null) continue
      const isRecommended = spot.bucket === 'visited' && spot.recommended
      const color = isRecommended ? '#f59e0b' : BUCKET_META[spot.bucket].accent
      const isSelected = spot.id === activeSpotId

      const marker = L.circleMarker([spot.lat, spot.lng], {
        radius: isSelected ? 10 : 7,
        fillColor: color,
        color: '#ffffff',
        weight: isSelected ? 3 : 2,
        opacity: 1,
        fillOpacity: 0.92,
      })

      const statusLabel = isRecommended
        ? `${BUCKET_META[spot.bucket].label} ★ recommended`
        : BUCKET_META[spot.bucket].label
      marker.bindTooltip(`${spot.name} (${statusLabel})`, {
        direction: 'top',
      })

      marker.on('click', () => {
        onSelectSpot?.(spot.id)
      })

      marker.addTo(group)
    }

    if (pickedCoords) {
      L.circleMarker([pickedCoords.lat, pickedCoords.lng], {
        radius: 9,
        fillColor: '#ec4899',
        color: '#ffffff',
        weight: 2,
        fillOpacity: 0.95,
      })
        .bindTooltip('picked location')
        .addTo(group)
    }
  }, [spots, activeSpotId, onSelectSpot, pickedCoords])

  return (
    <div className="space-y-1.5">
      {pickingCoords && (
        <p className="text-xs text-content-secondary">
          click anywhere on the map to set pin coordinates
          {pickedCoords ? ` (${pickedCoords.lat}, ${pickedCoords.lng})` : ''}
        </p>
      )}
      <div
        ref={containerRef}
        className={`h-64 w-full rounded-xl border border-border overflow-hidden z-0 ${
          pickingCoords ? 'cursor-crosshair ring-2 ring-content/30' : ''
        }`}
      />
    </div>
  )
}
