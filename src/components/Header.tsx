import { BarChart2, MapPin, Plus, X } from 'lucide-react'
import { motion } from 'framer-motion'

interface HeaderProps {
  isAddMode: boolean
  isStatsPanelOpen: boolean
  onToggleAddMode: () => void
  onToggleStats: () => void
}

export function Header({ isAddMode, isStatsPanelOpen, onToggleAddMode, onToggleStats }: HeaderProps) {
  return (
    <header className="relative z-30 flex items-center justify-between px-5 py-3.5
      bg-[rgba(15,15,26,0.85)] backdrop-blur-xl
      border-b border-[#252535]">

      {/* Left — logo + title */}
      <div className="flex items-center gap-3">
        <motion.div
          whileHover={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.4 }}
        >
          <MapPin className="w-7 h-7 text-[#f0c040]" strokeWidth={2} />
        </motion.div>

        <div className="flex flex-col leading-tight">
          <span className="text-[#e8e8f0] text-lg font-semibold tracking-tight">
            Explored by the Shaws
          </span>
          <span className="text-[#6a6a7c] text-xs font-light tracking-widest uppercase">
            Travel Journal
          </span>
        </div>
      </div>

      {/* Right — controls */}
      <div className="flex items-center gap-2.5">
        {isAddMode && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5
              bg-[#f0c040]/10 border border-[#f0c040]/30 rounded-full"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#f0c040] animate-pulse" />
            <span className="text-[#f0c040] text-xs font-medium">
              Click map to add
            </span>
          </motion.div>
        )}

        <IconButton
          onClick={onToggleStats}
          active={isStatsPanelOpen}
          label="Stats"
          activeColor="#4f9eff"
        >
          <BarChart2 className="w-5 h-5" />
        </IconButton>

        <IconButton
          onClick={onToggleAddMode}
          active={isAddMode}
          label={isAddMode ? 'Cancel' : 'Add pin'}
          activeColor="#f0c040"
        >
          {isAddMode ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </IconButton>
      </div>
    </header>
  )
}

interface IconButtonProps {
  onClick: () => void
  active: boolean
  label: string
  activeColor: string
  children: React.ReactNode
}

function IconButton({ onClick, active, label, activeColor, children }: IconButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={label}
      className="flex items-center justify-center w-10 h-10 rounded-xl border
        transition-all duration-200 cursor-pointer"
      style={{
        backgroundColor: active ? `${activeColor}20` : 'rgba(30,30,46,0.8)',
        borderColor: active ? `${activeColor}60` : '#252535',
        color: active ? activeColor : '#6a6a7c',
      }}
    >
      {children}
    </motion.button>
  )
}
