import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useMap } from '@vis.gl/react-google-maps'
import { Loader2, MapPin, Search, X } from 'lucide-react'
import { newSearchSession, resolvePlace, searchPlaces } from '../lib/geocode'
import type { PlaceResult, PlaceSuggestion } from '../lib/geocode'

interface PlaceSearchProps {
  onPlaceFound: (place: PlaceResult) => void
}

/** Floating "type a city or place" box shown in add mode, as an alternative to clicking the map */
export function PlaceSearch({ onPlaceFound }: PlaceSearchProps) {
  const map = useMap()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])
  const [highlight, setHighlight] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  // One session token per search — Google bills the keystrokes + final lookup as a single session
  const sessionRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const input = query.trim()
    if (input.length < 2) {
      setSuggestions([])
      return
    }

    let cancelled = false
    const timer = setTimeout(async () => {
      try {
        sessionRef.current ??= await newSearchSession()
        const results = await searchPlaces(input, sessionRef.current)
        if (cancelled) return
        setSuggestions(results)
        setHighlight(0)
        setError('')
      } catch {
        if (!cancelled) setError('Search is unavailable right now — click the map instead.')
      }
    }, 250)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query])

  async function choose(suggestion: PlaceSuggestion) {
    setIsLoading(true)
    try {
      const place = await resolvePlace(suggestion)
      if (!place) {
        setError("Couldn't find that spot on the map.")
        return
      }
      sessionRef.current = null
      setSuggestions([])
      setQuery(suggestion.mainText)
      if (map) {
        map.panTo({ lat: place.lat, lng: place.lng })
        if ((map.getZoom() ?? 0) < 10) map.setZoom(11)
      }
      onPlaceFound(place)
    } catch {
      setError("Couldn't look up that place.")
    } finally {
      setIsLoading(false)
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight((h) => Math.min(h + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => Math.max(h - 1, 0))
    } else if (e.key === 'Enter' && suggestions[highlight]) {
      e.preventDefault()
      choose(suggestions[highlight])
    } else if (e.key === 'Escape') {
      setQuery('')
      setSuggestions([])
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="absolute top-14 left-3 right-3 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-[420px] z-30"
    >
      <div
        className="rounded-xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--c-surface)', border: '1px solid var(--c-accent-bdr)' }}
      >
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: 'var(--c-accent)' }}
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search a city or place… or click the map"
            aria-label="Search for a place"
            className="w-full pl-10 pr-10 py-3 text-sm bg-transparent focus:outline-none placeholder:opacity-60"
            style={{ color: 'var(--c-text-1)' }}
          />
          {(isLoading || query) && (
            <button
              onClick={() => {
                setQuery('')
                setSuggestions([])
                inputRef.current?.focus()
              }}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center
                rounded-lg cursor-pointer"
              style={{ color: 'var(--c-text-3)' }}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
            </button>
          )}
        </div>

        {suggestions.length > 0 && (
          <ul style={{ borderTop: '1px solid var(--c-border)' }}>
            {suggestions.map((s, i) => (
              <li key={s.id}>
                <button
                  onClick={() => choose(s)}
                  onMouseEnter={() => setHighlight(i)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left cursor-pointer"
                  style={{ backgroundColor: i === highlight ? 'var(--c-raised)' : 'transparent' }}
                >
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--c-text-3)' }} />
                  <span className="min-w-0 truncate">
                    <span className="text-sm" style={{ color: 'var(--c-text-1)' }}>{s.mainText}</span>
                    {s.secondaryText && (
                      <span className="text-xs ml-1.5" style={{ color: 'var(--c-text-3)' }}>
                        {s.secondaryText}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {error && (
          <p className="px-3 py-2 text-xs" style={{ color: 'var(--c-text-3)', borderTop: '1px solid var(--c-border)' }}>
            {error}
          </p>
        )}
      </div>
    </motion.div>
  )
}
