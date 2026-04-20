import { useEffect, useRef } from 'react'
import { Map, useMap } from '@vis.gl/react-google-maps'
import { MarkerClusterer } from '@googlemaps/markerclusterer'
import type { Renderer } from '@googlemaps/markerclusterer'
import { DARK_MAP_STYLE, DEFAULT_CENTER, DEFAULT_ZOOM, LIGHT_MAP_STYLE } from '../constants'
import { getYearColor } from '../lib/colors'
import type { Pin } from '../types/pin'
import { YearFilter } from './YearFilter'
import { useTheme } from '../contexts/ThemeContext'

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
  const { isDark } = useTheme()
  const visiblePins =
    activeYears.size === 0 ? pins : pins.filter((p) => activeYears.has(p.year))

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ cursor: isAddMode ? 'crosshair' : 'default' }}
    >
      <Map
        defaultCenter={DEFAULT_CENTER}
        defaultZoom={DEFAULT_ZOOM}
        gestureHandling="greedy"
        disableDefaultUI
        clickableIcons={false}
        mapTypeId="roadmap"
        style={{ width: '100%', height: '100%' }}
      >
        <MapStyler isDark={isDark} />
        <MapClickHandler isAddMode={isAddMode} onMapClick={onMapClick} />
        <ClusteredPins
          pins={visiblePins}
          selectedPin={selectedPin}
          onSelect={onSelectPin}
          isDark={isDark}
        />
      </Map>

      <YearFilter years={years} activeYears={activeYears} onToggleYear={onToggleYear} />
    </div>
  )
}

/* Applies map style whenever theme changes */
function MapStyler({ isDark }: { isDark: boolean }) {
  const map = useMap()
  useEffect(() => {
    if (!map) return
    map.setOptions({ styles: isDark ? DARK_MAP_STYLE : LIGHT_MAP_STYLE })
  }, [map, isDark])
  return null
}

/* Map click → add-pin mode */
function MapClickHandler({
  isAddMode,
  onMapClick,
}: {
  isAddMode: boolean
  onMapClick: (lat: number, lng: number) => void
}) {
  const map = useMap()

  useEffect(() => {
    if (!map) return
    const listener = map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (!isAddMode || !e.latLng) return
      onMapClick(e.latLng.lat(), e.latLng.lng())
    })
    return () => google.maps.event.removeListener(listener)
  }, [map, isAddMode, onMapClick])

  return null
}

/* Clustered pin markers — recreated when pins or selection changes */
interface ClusteredPinsProps {
  pins: Pin[]
  selectedPin: Pin | null
  onSelect: (pin: Pin) => void
  isDark: boolean
}

function ClusteredPins({ pins, selectedPin, onSelect, isDark }: ClusteredPinsProps) {
  const map = useMap()
  // Keep callback stable across renders so markers don't need recreating for it
  const onSelectRef = useRef(onSelect)
  useEffect(() => { onSelectRef.current = onSelect })

  useEffect(() => {
    if (!map) return

    const markers: google.maps.Marker[] = []

    for (const pin of pins) {
      const isSelected = selectedPin?.id === pin.id
      const color = getYearColor(pin.year)
      const size = isSelected ? 42 : 32

      const marker = new google.maps.Marker({
        position: { lat: pin.lat, lng: pin.lng },
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(makePinSvg(color, isSelected, size))}`,
          scaledSize: new google.maps.Size(size, Math.round(size * 1.25)),
          anchor: new google.maps.Point(size / 2, Math.round(size * 1.25)),
        },
        title: pin.name,
        zIndex: isSelected ? 1000 : 1,
      })

      marker.addListener('click', () => onSelectRef.current(pin))
      markers.push(marker)
    }

    const clusterer = new MarkerClusterer({
      map,
      markers,
      renderer: makeClusterRenderer(isDark),
    })

    return () => {
      clusterer.clearMarkers()
      clusterer.setMap(null)
      markers.forEach((m) => {
        google.maps.event.clearInstanceListeners(m)
        m.setMap(null)
      })
    }
  }, [map, pins, selectedPin, isDark])

  return null
}

/* Custom cluster bubble — gold circle with count */
function makeClusterRenderer(isDark: boolean): Renderer {
  return {
    render({ count, position }) {
      const size = count > 99 ? 56 : count > 9 ? 48 : 40
      const r = size / 2 - 2
      const fontSize = count > 99 ? 12 : 14
      const accentColor = isDark ? '#f0c040' : '#b07010'
      const textColor = isDark ? '#0f0f1a' : '#ffffff'

      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="${accentColor}" opacity="0.93"/>
        <circle cx="${size / 2}" cy="${size / 2}" r="${r - 6}" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="1.5"/>
        <text x="${size / 2}" y="${size / 2 + 5}" text-anchor="middle"
          font-family="Inter,ui-sans-serif,sans-serif" font-size="${fontSize}" font-weight="700"
          fill="${textColor}">${count}</text>
      </svg>`

      return new google.maps.Marker({
        position,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
          scaledSize: new google.maps.Size(size, size),
          anchor: new google.maps.Point(size / 2, size / 2),
        },
        zIndex: 999,
        title: `${count} locations`,
      })
    },
  }
}

function makePinSvg(color: string, selected: boolean, size: number): string {
  const h = Math.round(size * 1.25)
  const cx = size / 2
  const cy = size / 2
  const ring = selected
    ? `<circle cx="${cx}" cy="${cy}" r="${cx - 2}" fill="none" stroke="${color}" stroke-width="2" opacity="0.35"/>`
    : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${h}" viewBox="0 0 ${size} ${h}">
    ${ring}
    <path d="M${cx} 0C${cx * 0.448} 0 0 ${cy * 0.448} 0 ${cy}c0 ${cy * 0.75} ${cx} ${cy * 1.5} ${cx} ${cy * 1.5}s${cx}-${cy * 0.75} ${cx}-${cy * 1.5}C${size} ${cy * 0.448} ${cx * 1.552} 0 ${cx} 0z" fill="${color}"/>
    <circle cx="${cx}" cy="${cy}" r="${cx * 0.4}" fill="rgba(0,0,0,0.3)"/>
    <circle cx="${cx}" cy="${cy}" r="${cx * 0.22}" fill="white" opacity="0.9"/>
  </svg>`
}
