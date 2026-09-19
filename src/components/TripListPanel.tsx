import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, MapPin, ChevronRight } from 'lucide-react'
import { getYearColor, getYearColorForUI } from '../lib/colors'
import { useTheme } from '../contexts/ThemeContext'
import { useMediaQuery } from '../hooks/useMediaQuery'
import type { Pin } from '../types/pin'

const MONTH_ORDER: Record<string, number> = {
  January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
  July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
}

const MONTH_ABBR: Record<string, string> = {
  January: 'JAN', February: 'FEB', March: 'MAR', April: 'APR',
  May: 'MAY', June: 'JUN', July: 'JUL', August: 'AUG',
  September: 'SEP', October: 'OCT', November: 'NOV', December: 'DEC',
}

type SortOrder = 'newest' | 'oldest' | 'name'

/** A list row: either a lone pin, or several pins sharing a name in the same year (a trip) */
type ListItem =
  | { kind: 'pin'; pin: Pin }
  | { kind: 'trip'; key: string; name: string; year: string; pins: Pin[] }

function groupTrips(pins: Pin[]): ListItem[] {
  const byKey = new Map<string, Pin[]>()
  for (const pin of pins) {
    const key = `${pin.year}|${pin.name.trim().toLowerCase()}`
    const group = byKey.get(key)
    if (group) group.push(pin)
    else byKey.set(key, [pin])
  }

  // Keep the incoming sort order, placing each trip where its first pin appeared
  const items: ListItem[] = []
  const emitted = new Set<string>()
  for (const pin of pins) {
    const key = `${pin.year}|${pin.name.trim().toLowerCase()}`
    const group = byKey.get(key)!
    if (group.length === 1) {
      items.push({ kind: 'pin', pin })
    } else if (!emitted.has(key)) {
      emitted.add(key)
      items.push({
        kind: 'trip',
        key,
        name: pin.name.trim(),
        year: pin.year,
        // Stops in the order they were entered
        pins: [...group].sort((a, b) => Number(a.id) - Number(b.id)),
      })
    }
  }
  return items
}

interface TripListPanelProps {
  pins: Pin[]
  isOpen: boolean
  onClose: () => void
  onSelectPin: (pin: Pin) => void
}

export function TripListPanel({ pins, isOpen, onClose, onSelectPin }: TripListPanelProps) {
  const [search, setSearch] = useState('')
  const [yearFilter, setYearFilter] = useState<Set<string>>(new Set())
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const isDesktop = useMediaQuery('(min-width: 640px)')
  const { isDark } = useTheme()

  const allYears = useMemo(
    () => [...new Set(pins.map((p) => p.year))].sort((a, b) => Number(b) - Number(a)),
    [pins],
  )

  const filtered = useMemo(() => {
    let result = pins

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.state.toLowerCase().includes(q) ||
          p.country.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      )
    }

    if (yearFilter.size > 0) {
      result = result.filter((p) => yearFilter.has(p.year))
    }

    return [...result].sort((a, b) => {
      if (sortOrder === 'newest') {
        const d = Number(b.year) - Number(a.year)
        return d !== 0 ? d : (MONTH_ORDER[b.month] ?? 0) - (MONTH_ORDER[a.month] ?? 0)
      }
      if (sortOrder === 'oldest') {
        const d = Number(a.year) - Number(b.year)
        return d !== 0 ? d : (MONTH_ORDER[a.month] ?? 0) - (MONTH_ORDER[b.month] ?? 0)
      }
      return a.name.localeCompare(b.name)
    })
  }, [pins, search, yearFilter, sortOrder])

  const grouped = useMemo(() => {
    if (sortOrder === 'name') return null
    const groups: Record<string, Pin[]> = {}
    for (const pin of filtered) {
      ;(groups[pin.year] ??= []).push(pin)
    }
    return Object.keys(groups)
      .sort((a, b) => (sortOrder === 'newest' ? Number(b) - Number(a) : Number(a) - Number(b)))
      .map((year) => ({ year, items: groupTrips(groups[year]) }))
  }, [filtered, sortOrder])

  const flatItems = useMemo(() => groupTrips(filtered), [filtered])

  const [expandedTrips, setExpandedTrips] = useState<Set<string>>(new Set())
  function toggleTrip(key: string) {
    setExpandedTrips((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }
  // While searching, show matching stops rather than hiding them in collapsed trips
  const isTripExpanded = (key: string) => search.trim() !== '' || expandedTrips.has(key)

  function toggleYear(year: string) {
    setYearFilter((prev) => {
      const next = new Set(prev)
      next.has(year) ? next.delete(year) : next.add(year)
      return next
    })
  }

  function handleSelect(pin: Pin) {
    onSelectPin(pin)
    onClose()
  }

  const countLabel =
    filtered.length === pins.length
      ? `${pins.length} Adventure${pins.length !== 1 ? 's' : ''}`
      : `${filtered.length} of ${pins.length} Adventures`

  const inner = (
    <PanelInner
      search={search}
      onSearch={setSearch}
      sortOrder={sortOrder}
      onSort={setSortOrder}
      allYears={allYears}
      yearFilter={yearFilter}
      onToggleYear={toggleYear}
      filtered={filtered}
      grouped={grouped}
      flatItems={flatItems}
      isTripExpanded={isTripExpanded}
      onToggleTrip={toggleTrip}
      countLabel={countLabel}
      isDark={isDark}
      onClose={onClose}
      onSelect={handleSelect}
    />
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="tlp-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
          />

          {isDesktop ? (
            /* Desktop: centered modal */
            <motion.div
              key="tlp-modal"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            >
              <div
                className="pointer-events-auto flex flex-col rounded-2xl shadow-2xl overflow-hidden"
                style={{
                  width: 'min(680px, 92vw)',
                  maxHeight: '82vh',
                  backgroundColor: 'var(--c-surface)',
                  border: '1px solid var(--c-border)',
                }}
              >
                {inner}
              </div>
            </motion.div>
          ) : (
            /* Mobile: bottom sheet */
            <motion.div
              key="tlp-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 32 }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.15}
              onDragEnd={(_, { velocity, offset }) => {
                if (velocity.y > 400 || offset.y > 160) onClose()
              }}
              className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-2xl shadow-2xl overflow-hidden"
              style={{
                height: '95vh',
                backgroundColor: 'var(--c-surface)',
                borderTop: '1px solid var(--c-border)',
              }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                <div className="w-10 h-1 rounded-full" style={{ backgroundColor: 'var(--c-border)' }} />
              </div>
              {inner}
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  )
}

/* ─── Inner panel content ──────────────────────────────────────────────────── */

interface InnerProps {
  search: string
  onSearch: (v: string) => void
  sortOrder: SortOrder
  onSort: (v: SortOrder) => void
  allYears: string[]
  yearFilter: Set<string>
  onToggleYear: (y: string) => void
  filtered: Pin[]
  grouped: { year: string; items: ListItem[] }[] | null
  flatItems: ListItem[]
  isTripExpanded: (key: string) => boolean
  onToggleTrip: (key: string) => void
  countLabel: string
  isDark: boolean
  onClose: () => void
  onSelect: (pin: Pin) => void
}

function PanelInner({
  search, onSearch, sortOrder, onSort,
  allYears, yearFilter, onToggleYear,
  filtered, grouped, flatItems, isTripExpanded, onToggleTrip, countLabel,
  isDark, onClose, onSelect,
}: InnerProps) {
  const renderItem = (item: ListItem) =>
    item.kind === 'pin' ? (
      <TripCard key={item.pin.id} pin={item.pin} isDark={isDark} onSelect={onSelect} />
    ) : (
      <TripGroup
        key={item.key}
        trip={item}
        isDark={isDark}
        expanded={isTripExpanded(item.key)}
        onToggle={() => onToggleTrip(item.key)}
        onSelect={onSelect}
      />
    )

  return (
    <>
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 pt-4 pb-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--c-border)' }}
      >
        <div>
          <p className="text-[10px] font-medium tracking-widest uppercase" style={{ color: 'var(--c-text-3)' }}>
            Travel Journal
          </p>
          <h2 className="text-base font-semibold" style={{ color: 'var(--c-text-1)' }}>
            {countLabel}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors"
          style={{ color: 'var(--c-text-3)' }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--c-border-sub)' }}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--c-text-3)' }} />
          <input
            type="text"
            placeholder="Search by name, city, state, country…"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg text-sm focus:outline-none"
            style={{
              backgroundColor: 'var(--c-deep)',
              border: '1px solid var(--c-border)',
              color: 'var(--c-text-1)',
            }}
          />
        </div>
      </div>

      {/* Filters */}
      <div
        className="px-4 py-2 flex items-center gap-2 flex-shrink-0 overflow-x-auto [&::-webkit-scrollbar]:hidden"
        style={{ borderBottom: '1px solid var(--c-border-sub)' }}
      >
        {allYears.map((year) => {
          const mapColor = getYearColor(year)
          const uiColor = getYearColorForUI(year, isDark)
          const active = yearFilter.has(year)
          return (
            <button
              key={year}
              onClick={() => onToggleYear(year)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer
                transition-all flex-shrink-0"
              style={{
                backgroundColor: active ? `${mapColor}22` : 'var(--c-raised)',
                border: `1px solid ${active ? `${mapColor}55` : 'var(--c-border)'}`,
                color: active ? uiColor : 'var(--c-text-3)',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: mapColor, opacity: active ? 1 : 0.4 }}
              />
              {year}
            </button>
          )
        })}

        <select
          value={sortOrder}
          onChange={(e) => onSort(e.target.value as SortOrder)}
          className="ml-auto text-xs px-2.5 py-1.5 rounded-lg cursor-pointer focus:outline-none flex-shrink-0"
          style={{
            backgroundColor: 'var(--c-raised)',
            border: '1px solid var(--c-border)',
            color: 'var(--c-text-2)',
          }}
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="name">A – Z</option>
        </select>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-14 text-center">
            <Search className="w-8 h-8" style={{ color: 'var(--c-text-4)' }} />
            <p className="text-sm" style={{ color: 'var(--c-text-3)' }}>No trips match your search.</p>
          </div>
        ) : grouped ? (
          grouped.map(({ year, items }) => (
            <div key={year}>
              {/* Year section header */}
              <div
                className="flex items-center gap-2 px-5 py-2 sticky top-0 z-10"
                style={{ backgroundColor: 'var(--c-raised)', borderBottom: '1px solid var(--c-border-sub)' }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getYearColor(year) }} />
                <span className="text-xs font-bold tracking-wide" style={{ color: getYearColorForUI(year, isDark) }}>
                  {year}
                </span>
                <span className="text-xs" style={{ color: 'var(--c-text-3)' }}>
                  · {items.length} trip{items.length !== 1 ? 's' : ''}
                </span>
              </div>
              {items.map(renderItem)}
            </div>
          ))
        ) : (
          flatItems.map(renderItem)
        )}
      </div>
    </>
  )
}

/* ─── Trip group (several stops under one name) ────────────────────────────── */

function TripGroup({
  trip,
  isDark,
  expanded,
  onToggle,
  onSelect,
}: {
  trip: Extract<ListItem, { kind: 'trip' }>
  isDark: boolean
  expanded: boolean
  onToggle: () => void
  onSelect: (p: Pin) => void
}) {
  const mapColor = getYearColor(trip.year)
  const uiColor = getYearColorForUI(trip.year, isDark)

  const months = [...new Set(trip.pins.map((p) => p.month))].sort(
    (a, b) => (MONTH_ORDER[a] ?? 0) - (MONTH_ORDER[b] ?? 0),
  )
  const abbr = (m: string) => MONTH_ABBR[m] ?? m.slice(0, 3).toUpperCase()
  const dateLabel =
    months.length > 1 ? `${abbr(months[0])}–${abbr(months[months.length - 1])}` : abbr(months[0] ?? '')
  const states = [...new Set(trip.pins.map((p) => p.state).filter(Boolean))]

  return (
    <div style={{ borderBottom: '1px solid var(--c-border-sub)' }}>
      <motion.button
        onClick={onToggle}
        whileHover={{ backgroundColor: 'var(--c-raised)' }}
        aria-expanded={expanded}
        className="w-full flex items-stretch gap-3.5 px-5 py-3.5 text-left cursor-pointer transition-colors"
      >
        {/* Thicker stripe marks a multi-stop trip */}
        <div className="w-1 rounded-full flex-shrink-0" style={{ backgroundColor: mapColor }} />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <span className="flex items-center gap-1 font-medium text-sm leading-snug" style={{ color: 'var(--c-text-1)' }}>
              <ChevronRight
                className="w-3.5 h-3.5 flex-shrink-0 transition-transform"
                style={{ color: 'var(--c-text-3)', transform: expanded ? 'rotate(90deg)' : undefined }}
              />
              {trip.name}
            </span>
            <span className="text-[10px] font-bold tracking-wider flex-shrink-0 mt-px" style={{ color: uiColor }}>
              {dateLabel} {trip.year}
            </span>
          </div>
          <p className="text-xs mt-0.5 truncate pl-[18px]" style={{ color: 'var(--c-text-3)' }}>
            {trip.pins.length} stops{states.length > 0 && ` · ${states.join(', ')}`}
          </p>
        </div>
      </motion.button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden pl-5"
            style={{ borderTop: '1px solid var(--c-border-sub)' }}
          >
            {trip.pins.map((pin) => (
              <TripCard key={pin.id} pin={pin} isDark={isDark} onSelect={onSelect} asStop />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Trip card ────────────────────────────────────────────────────────────── */

function TripCard({
  pin,
  isDark,
  onSelect,
  asStop = false,
}: {
  pin: Pin
  isDark: boolean
  onSelect: (p: Pin) => void
  /** Rendered inside a trip group — lead with the place, since the trip name is in the header */
  asStop?: boolean
}) {
  const mapColor = getYearColor(pin.year)
  const uiColor = getYearColorForUI(pin.year, isDark)
  const monthAbbr = MONTH_ABBR[pin.month] ?? pin.month?.slice(0, 3).toUpperCase() ?? '—'
  const location = asStop
    ? [pin.state, pin.country].filter(Boolean).join(', ')
    : [pin.city, pin.state, pin.country].filter(Boolean).join(', ')
  const title = asStop ? pin.city || pin.name : pin.name

  return (
    <motion.button
      onClick={() => onSelect(pin)}
      whileHover={{ backgroundColor: 'var(--c-raised)' }}
      whileTap={{ scale: 0.995 }}
      className="w-full flex items-stretch gap-3.5 px-5 py-3.5 text-left cursor-pointer transition-colors"
      style={{ borderBottom: '1px solid var(--c-border-sub)' }}
    >
      {/* Year-colored left stripe */}
      <div className="w-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: mapColor }} />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <span className="font-medium text-sm leading-snug" style={{ color: 'var(--c-text-1)' }}>
            {title}
          </span>
          <span className="text-[10px] font-bold tracking-wider flex-shrink-0 mt-px" style={{ color: uiColor }}>
            {monthAbbr} {pin.year}
          </span>
        </div>

        {location && (
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="w-2.5 h-2.5 flex-shrink-0" style={{ color: 'var(--c-text-4)' }} />
            <span className="text-xs truncate" style={{ color: 'var(--c-text-3)' }}>{location}</span>
          </div>
        )}

        {pin.description && (
          <p className="text-xs mt-0.5 italic truncate" style={{ color: 'var(--c-text-3)' }}>
            {pin.description}
          </p>
        )}
      </div>
    </motion.button>
  )
}
