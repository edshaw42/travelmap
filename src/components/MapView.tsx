import { useEffect } from 'react'
import { Map, useMap, useMapsLibrary } from '@vis.gl/react-google-maps'
import { DARK_MAP_STYLE, DEFAULT_CENTER, DEFAULT_ZOOM } from '../constants'
import { getYearColor } from '../lib/colors'
import type { Pin } from '../types/pin'
import { YearFilter } from './YearFilter'

interface MapViewProps {
  pins: Pin[]
  selectedPin: Pin | null
  isAddMode: boolean
  activeYears: Set<string>
  years: string[]
  onSelectPin: (pin: Pin | null) => void
  onMapClick: (lat: number, lng: number) => void
  onToggleYear: (year: string) => void
}

export function MapView({
  pins,
  selectedPin,
  isAddMode,
  activeYears,
  years,
  onSelectPin,
  onMapClick,
  onToggleYear,
}: MapViewProps) {
  const visiblePins =
    activeYears.size === 0 ? pins : pins.filter((p) => activeYears.has(p.year))

  return (
    <div className="relative flex-1 overflow-hidden" style={{ cursor: isAddMode ? 'crosshair' : 'default' }}>
      <Map
        defaultCenter={DEFAULT_CENTER}
        defaultZoom={DEFAULT_ZOOM}
        gestureHandling="greedy"
        disableDefaultUI
        clickableIcons={false}
        mapTypeId="roadmap"
      >
        <MapStyler />
        <MapClickHandler isAddMode={isAddMode} onMapClick={onMapClick} />

        {visiblePins.map((pin) => (
          <PinMarker
            key={pin.id}
            pin={pin}
            isSelected={selectedPin?.id === pin.id}
            onSelect={onSelectPin}
          />
        ))}
      </Map>

      <YearFilter years={years} activeYears={activeYears} onToggleYear={onToggleYear} />
    </div>
  )
}

// Sets dark style after map mounts (styles prop isn't a first-class Map prop in vis.gl)
function MapStyler() {
  const map = useMap()
  useEffect(() => {
    if (map) map.setOptions({ styles: DARK_MAP_STYLE })
  }, [map])
  return null
}

// Handles map clicks for add-pin mode
function MapClickHandler({
  isAddMode,
  onMapClick,
}: {
  isAddMode: boolean
  onMapClick: (lat: number, lng: number) => void
}) {
  const map = useMap()
  const mapsLib = useMapsLibrary('core')

  useEffect(() => {
    if (!map || !mapsLib) return

    const listener = map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (!isAddMode || !e.latLng) return
      onMapClick(e.latLng.lat(), e.latLng.lng())
    })

    return () => google.maps.event.removeListener(listener)
  }, [map, mapsLib, isAddMode, onMapClick])

  return null
}

// Custom SVG marker for each pin
interface PinMarkerProps {
  pin: Pin
  isSelected: boolean
  onSelect: (pin: Pin) => void
}

function PinMarker({ pin, isSelected, onSelect }: PinMarkerProps) {
  const map = useMap()
  const mapsLib = useMapsLibrary('marker')

  useEffect(() => {
    if (!map || !mapsLib) return

    const color = getYearColor(pin.year)
    const size = isSelected ? 40 : 32
    const svgIcon = makePinSvg(color, isSelected)

    const marker = new google.maps.Marker({
      position: { lat: pin.lat, lng: pin.lng },
      map,
      icon: {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgIcon)}`,
        scaledSize: new google.maps.Size(size, Math.round(size * 1.25)),
        anchor: new google.maps.Point(size / 2, Math.round(size * 1.25)),
      },
      title: pin.name,
      zIndex: isSelected ? 100 : 1,
    })

    const clickListener = marker.addListener('click', () => onSelect(pin))

    return () => {
      google.maps.event.removeListener(clickListener)
      marker.setMap(null)
    }
  }, [map, mapsLib, pin, isSelected, onSelect])

  return null
}

function makePinSvg(color: string, selected: boolean): string {
  const ring = selected ? `<circle cx="16" cy="16" r="13" fill="none" stroke="${color}" stroke-width="2" opacity="0.4"/>` : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
    ${ring}
    <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 24 16 24s16-12 16-24C32 7.163 24.837 0 16 0z" fill="${color}"/>
    <circle cx="16" cy="16" r="6" fill="rgba(0,0,0,0.35)"/>
    <circle cx="16" cy="16" r="3.5" fill="white" opacity="0.9"/>
  </svg>`
}

