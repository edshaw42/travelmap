import { motion } from 'framer-motion'
import { getYearColor, getYearColorForUI } from '../lib/colors'
import { useTheme } from '../contexts/ThemeContext'

interface YearFilterProps {
  years: string[]
  activeYears: Set<string>
  onToggleYear: (year: string) => void
}

export function YearFilter({ years, activeYears, onToggleYear }: YearFilterProps) {
  const { isDark } = useTheme()
  if (years.length === 0) return null

  const allActive = activeYears.size === 0

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="absolute top-3 left-0 right-0 z-20 px-3 sm:px-4
        flex items-center justify-start sm:justify-center pointer-events-none"
    >
      <div className="flex gap-2 overflow-x-auto pb-1 flex-nowrap sm:flex-wrap sm:justify-center
        pointer-events-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {years.map((year) => {
          const mapColor = getYearColor(year)       // dot — always vivid
          const uiColor = getYearColorForUI(year, isDark) // label — contrast-safe
          const isActive = allActive || activeYears.has(year)

          return (
            <motion.button
              key={year}
              onClick={() => onToggleYear(year)}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
                backdrop-blur-md border transition-all duration-200 cursor-pointer flex-shrink-0"
              style={{
                backgroundColor: isActive
                  ? `${mapColor}22`
                  : isDark ? 'rgba(15,15,26,0.7)' : 'rgba(255,255,255,0.85)',
                borderColor: isActive
                  ? `${mapColor}55`
                  : isDark ? 'rgba(37,37,53,0.9)' : 'rgba(200,200,210,0.9)',
                color: isActive ? uiColor : 'var(--c-text-3)',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: mapColor, opacity: isActive ? 1 : 0.4 }}
              />
              {year}
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}
