import { motion } from 'framer-motion'

export function LoadingScreen() {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center"
      style={{ backgroundColor: 'var(--c-canvas)' }}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center gap-6"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width="48" height="60" viewBox="0 0 32 40" fill="none">
            <path
              d="M16 0C7.163 0 0 7.163 0 16c0 12 16 24 16 24s16-12 16-24C32 7.163 24.837 0 16 0z"
              fill="var(--c-accent)"
            />
            <circle cx="16" cy="16" r="7" fill="var(--c-canvas)" opacity="0.7" />
          </svg>
        </motion.div>

        <div className="flex flex-col items-center gap-2">
          <p className="text-lg font-light tracking-[0.15em] uppercase" style={{ color: 'var(--c-text-1)' }}>
            Explored by the Shaws
          </p>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: 'var(--c-accent)' }}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
