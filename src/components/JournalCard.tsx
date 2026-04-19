import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Camera } from 'lucide-react'
import { getYearColor } from '../lib/colors'
import type { Pin } from '../types/pin'

const MONTH_ABBR: Record<string, string> = {
  January: 'JAN', February: 'FEB', March: 'MAR', April: 'APR',
  May: 'MAY', June: 'JUN', July: 'JUL', August: 'AUG',
  September: 'SEP', October: 'OCT', November: 'NOV', December: 'DEC',
}

interface JournalCardProps {
  pin: Pin | null
  onClose: () => void
}

export function JournalCard({ pin, onClose }: JournalCardProps) {
  return (
    <AnimatePresence>
      {pin && (
        <>
          {/* Mobile backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] sm:hidden"
          />

          <motion.aside
            key="card"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[400px] flex flex-col
              bg-[#13131a] border-l border-[#252535] shadow-2xl overflow-hidden"
          >
            <CardContent pin={pin} onClose={onClose} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

function CardContent({ pin, onClose }: { pin: Pin; onClose: () => void }) {
  const color = getYearColor(pin.year)
  const monthAbbr = MONTH_ABBR[pin.month] ?? pin.month?.slice(0, 3).toUpperCase() ?? '—'

  const locationLine = [pin.city, pin.state, pin.country]
    .filter(Boolean)
    .join(' · ')

  const latStr = pin.lat >= 0
    ? `${pin.lat.toFixed(4)}°N`
    : `${Math.abs(pin.lat).toFixed(4)}°S`
  const lngStr = pin.lng >= 0
    ? `${pin.lng.toFixed(4)}°E`
    : `${Math.abs(pin.lng).toFixed(4)}°W`

  return (
    <>
      {/* Hero — photo or gradient */}
      <div className="relative h-52 flex-shrink-0 overflow-hidden">
        {pin.photoUrl ? (
          <img
            src={pin.photoUrl}
            alt={pin.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: `linear-gradient(135deg, ${color}55 0%, ${color}18 50%, #0f0f1a 100%)`,
            }}
          >
            {/* Decorative grid overlay */}
            <svg
              className="absolute inset-0 w-full h-full opacity-[0.06]"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
                  <path d="M 24 0 L 0 0 0 24" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* No photo placeholder */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Camera className="w-10 h-10 opacity-10" style={{ color }} />
            </div>
          </div>
        )}

        {/* Stamp overlay */}
        <div className="absolute top-4 left-4">
          <div
            className="flex flex-col items-center justify-center w-14 h-14
              border-2 rounded-sm rotate-[-3deg]"
            style={{ borderColor: `${color}80`, backgroundColor: `${color}12` }}
          >
            <span
              className="text-[10px] font-bold tracking-[0.12em]"
              style={{ color }}
            >
              {monthAbbr}
            </span>
            <div className="w-full border-t my-0.5" style={{ borderColor: `${color}50` }} />
            <span className="text-[11px] font-semibold" style={{ color }}>
              {pin.year}
            </span>
          </div>
        </div>

        {/* Year badge */}
        <div className="absolute top-4 right-12 flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-xs font-medium" style={{ color }}>
            {pin.year}
          </span>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 flex items-center justify-center
            w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm
            text-white/70 hover:text-white hover:bg-black/60
            transition-all duration-150 cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16"
          style={{ background: 'linear-gradient(to top, #13131a, transparent)' }}
        />
      </div>

      {/* Body — scrollable journal content */}
      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">

        {/* Trip name */}
        <div>
          <h2 className="text-[#e8e8f0] text-2xl font-semibold leading-tight">
            {pin.name}
          </h2>

          {/* Accent rule */}
          <div
            className="mt-2 h-[2px] w-12 rounded-full"
            style={{ backgroundColor: color }}
          />
        </div>

        {/* Location */}
        {locationLine && (
          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-[#6a6a7c]" />
            <span className="text-[#9a9aac] text-sm leading-snug">{locationLine}</span>
          </div>
        )}

        {/* Description — journal entry text */}
        {pin.description ? (
          <div className="relative">
            {/* Opening quote mark */}
            <span
              className="absolute -top-3 -left-1 text-5xl leading-none font-serif opacity-20"
              style={{ color }}
            >
              "
            </span>
            <p className="text-[#c0c0d0] text-sm leading-7 italic pl-3 border-l-2"
              style={{ borderColor: `${color}40` }}>
              {pin.description}
            </p>
          </div>
        ) : (
          <p className="text-[#3a3a4e] text-sm italic">No entry written yet.</p>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer — coordinates as geographic tag */}
        <div className="pt-4 border-t border-[#1e1e2e]">
          <div className="flex items-center justify-between">
            <span className="text-[#3a3a4e] text-[10px] font-mono tracking-widest uppercase">
              Coordinates
            </span>
            <span className="text-[#4a4a5e] text-[11px] font-mono tabular-nums">
              {latStr} · {lngStr}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
