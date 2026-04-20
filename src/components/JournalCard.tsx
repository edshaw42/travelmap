import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Camera } from 'lucide-react'
import { getYearColor, getYearColorForUI } from '../lib/colors'
import { useTheme } from '../contexts/ThemeContext'
import { useMediaQuery } from '../hooks/useMediaQuery'
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
  const isDesktop = useMediaQuery('(min-width: 640px)')

  return (
    <AnimatePresence>
      {pin && (
        <>
          <motion.div
            key="jc-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
          />

          {isDesktop ? (
            <motion.aside
              key="jc-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-[400px] flex flex-col shadow-2xl overflow-hidden"
              style={{ backgroundColor: 'var(--c-surface)', borderLeft: '1px solid var(--c-border)' }}
            >
              <CardContent pin={pin} onClose={onClose} />
            </motion.aside>
          ) : (
            <motion.aside
              key="jc-sheet"
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
                maxHeight: '88vh',
                backgroundColor: 'var(--c-surface)',
                borderTop: '1px solid var(--c-border)',
              }}
            >
              <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                <div className="w-10 h-1 rounded-full" style={{ backgroundColor: 'var(--c-border)' }} />
              </div>
              <CardContent pin={pin} onClose={onClose} />
            </motion.aside>
          )}
        </>
      )}
    </AnimatePresence>
  )
}

function CardContent({ pin, onClose }: { pin: Pin; onClose: () => void }) {
  const { isDark } = useTheme()
  const mapColor = getYearColor(pin.year)           // vivid — for hero gradient & decorative elements
  const uiColor = getYearColorForUI(pin.year, isDark) // contrast-safe — for text, borders
  const monthAbbr = MONTH_ABBR[pin.month] ?? pin.month?.slice(0, 3).toUpperCase() ?? '—'
  const locationLine = [pin.city, pin.state, pin.country].filter(Boolean).join(' · ')
  const latStr = pin.lat >= 0 ? `${pin.lat.toFixed(4)}°N` : `${Math.abs(pin.lat).toFixed(4)}°S`
  const lngStr = pin.lng >= 0 ? `${pin.lng.toFixed(4)}°E` : `${Math.abs(pin.lng).toFixed(4)}°W`

  return (
    <>
      {/* Hero */}
      <div className="relative h-44 sm:h-52 flex-shrink-0 overflow-hidden">
        {pin.photoUrl ? (
          <img src={pin.photoUrl} alt={pin.name} className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full"
            style={{ background: `linear-gradient(135deg, ${mapColor}50 0%, ${mapColor}18 55%, var(--c-surface) 100%)` }}
          >
            <svg className="absolute inset-0 w-full h-full opacity-[0.05]" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="jc-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                  <path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#jc-grid)" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Camera className="w-10 h-10 opacity-10" style={{ color: mapColor }} />
            </div>
          </div>
        )}

        {/* Date stamp — uses uiColor for legibility */}
        <div className="absolute top-4 left-4">
          <div
            className="flex flex-col items-center justify-center w-14 h-14 rounded-sm"
            style={{
              border: `2px solid ${uiColor}80`,
              backgroundColor: `${mapColor}18`,
              transform: 'rotate(-3deg)',
            }}
          >
            <span className="text-[10px] font-bold tracking-[0.12em]" style={{ color: uiColor }}>{monthAbbr}</span>
            <div className="w-full border-t my-0.5" style={{ borderColor: `${uiColor}50` }} />
            <span className="text-[11px] font-semibold" style={{ color: uiColor }}>{pin.year}</span>
          </div>
        </div>

        {/* Year chip */}
        <div className="absolute top-4 right-12 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: mapColor }} />
          <span className="text-xs font-medium" style={{ color: uiColor }}>{pin.year}</span>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 rounded-full
            bg-black/40 backdrop-blur-sm text-white/70 hover:text-white hover:bg-black/60
            transition-all cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div
          className="absolute bottom-0 left-0 right-0 h-16"
          style={{ background: 'linear-gradient(to top, var(--c-surface), transparent)' }}
        />
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-semibold leading-tight" style={{ color: 'var(--c-text-1)' }}>
            {pin.name}
          </h2>
          {/* Accent rule uses the vivid map color — decorative, not text */}
          <div className="mt-2 h-[2px] w-12 rounded-full" style={{ backgroundColor: mapColor }} />
        </div>

        {locationLine && (
          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: 'var(--c-text-3)' }} />
            <span className="text-sm leading-snug" style={{ color: 'var(--c-text-2)' }}>{locationLine}</span>
          </div>
        )}

        {pin.description ? (
          <div className="relative">
            <span
              className="absolute -top-3 -left-1 text-5xl leading-none font-serif"
              style={{ color: mapColor, opacity: isDark ? 0.2 : 0.15 }}
            >"</span>
            <p
              className="text-sm leading-7 italic pl-3 border-l-2"
              style={{ color: 'var(--c-text-2)', borderColor: `${mapColor}50` }}
            >
              {pin.description}
            </p>
          </div>
        ) : (
          <p className="text-sm italic" style={{ color: 'var(--c-text-4)' }}>No entry written yet.</p>
        )}

        <div className="flex-1 min-h-4" />

        <div className="pt-4" style={{ borderTop: '1px solid var(--c-border)' }}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono tracking-widest uppercase" style={{ color: 'var(--c-text-4)' }}>
              Coordinates
            </span>
            <span className="text-[11px] font-mono tabular-nums" style={{ color: 'var(--c-text-3)' }}>
              {latStr} · {lngStr}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
