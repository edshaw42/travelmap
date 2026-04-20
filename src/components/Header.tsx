import { BarChart2, MapPin, Moon, Plus, Sun, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme } from '../contexts/ThemeContext'

interface HeaderProps {
  isAddMode: boolean
  isStatsPanelOpen: boolean
  onToggleAddMode: () => void
  onToggleStats: () => void
}

export function Header({ isAddMode, isStatsPanelOpen, onToggleAddMode, onToggleStats }: HeaderProps) {
  const { isDark, toggle } = useTheme()

  return (
    <header
      className="relative z-30 flex items-center justify-between px-4 sm:px-5 py-3"
      style={{
        backgroundColor: isDark ? 'rgba(15,15,26,0.9)' : 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: `1px solid var(--c-border)`,
      }}
    >
      {/* Logo + title */}
      <div className="flex items-center gap-2.5">
        <motion.div whileHover={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.4 }}>
          <MapPin className="w-6 h-6" style={{ color: 'var(--c-accent)' }} strokeWidth={2} />
        </motion.div>
        <div className="flex flex-col leading-tight">
          <span className="text-base font-semibold tracking-tight" style={{ color: 'var(--c-text-1)' }}>
            Explored by the Shaws
          </span>
          <span className="text-[10px] font-light tracking-widest uppercase" style={{ color: 'var(--c-text-3)' }}>
            Travel Journal
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* Add-mode indicator — desktop only */}
        {isAddMode && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ backgroundColor: 'var(--c-accent-bg)', border: '1px solid var(--c-accent-bdr)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--c-accent)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--c-accent)' }}>
              Click map to add
            </span>
          </motion.div>
        )}

        {/* Dark / light toggle */}
        <ThemeToggle isDark={isDark} onToggle={toggle} />

        <IconButton
          onClick={onToggleStats}
          active={isStatsPanelOpen}
          label="Stats"
          activeColor="var(--c-blue)"
          activeBg="var(--c-blue-bg)"
        >
          <BarChart2 className="w-4 h-4" />
        </IconButton>

        <IconButton
          onClick={onToggleAddMode}
          active={isAddMode}
          label={isAddMode ? 'Cancel' : 'Add pin'}
          activeColor="var(--c-accent)"
          activeBg="var(--c-accent-bg)"
        >
          {isAddMode ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </IconButton>
      </div>
    </header>
  )
}

/* Sliding pill toggle */
function ThemeToggle({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) {
  return (
    <motion.button
      onClick={onToggle}
      aria-label="Toggle theme"
      className="relative flex items-center w-14 h-7 rounded-full p-0.5 cursor-pointer flex-shrink-0"
      style={{ backgroundColor: isDark ? 'var(--c-deep)' : 'var(--c-deep)', border: '1px solid var(--c-border)' }}
    >
      {/* Track icons */}
      <Moon className="absolute left-1.5 w-3 h-3" style={{ color: isDark ? 'var(--c-accent)' : 'var(--c-text-4)' }} />
      <Sun className="absolute right-1.5 w-3 h-3" style={{ color: !isDark ? 'var(--c-accent)' : 'var(--c-text-4)' }} />

      {/* Sliding knob */}
      <motion.span
        animate={{ x: isDark ? 0 : 28 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className="relative z-10 w-6 h-6 rounded-full flex-shrink-0"
        style={{ backgroundColor: 'var(--c-accent)' }}
      />
    </motion.button>
  )
}

interface IconButtonProps {
  onClick: () => void
  active: boolean
  label: string
  activeColor: string
  activeBg: string
  children: React.ReactNode
}

function IconButton({ onClick, active, label, activeColor, activeBg, children }: IconButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={label}
      className="flex items-center justify-center w-9 h-9 rounded-xl border transition-all duration-200 cursor-pointer"
      style={{
        backgroundColor: active ? activeBg : 'var(--c-raised)',
        borderColor: active ? activeColor : 'var(--c-border)',
        color: active ? activeColor : 'var(--c-text-3)',
      }}
    >
      {children}
    </motion.button>
  )
}
