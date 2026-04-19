import { motion } from 'framer-motion'
import { getYearColor } from '../lib/colors'

interface YearFilterProps {
  years: string[]
  activeYears: Set<string>
  onToggleYear: (year: string) => void
}

export function YearFilter({ years, activeYears, onToggleYear }: YearFilterProps) {
  if (years.length === 0) return null

  const allActive = activeYears.size === 0

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 flex-wrap justify-center px-4"
    >
      {years.map((year) => {
        const color = getYearColor(year)
        const isActive = allActive || activeYears.has(year)

        return (
          <motion.button
            key={year}
            onClick={() => onToggleYear(year)}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
              backdrop-blur-md border transition-all duration-200 cursor-pointer"
            style={{
              backgroundColor: isActive ? `${color}22` : 'rgba(15,15,26,0.7)',
              borderColor: isActive ? `${color}55` : '#252535',
              color: isActive ? color : '#6a6a7c',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full transition-opacity duration-200"
              style={{ backgroundColor: color, opacity: isActive ? 1 : 0.3 }}
            />
            {year}
          </motion.button>
        )
      })}
    </motion.div>
  )
}
