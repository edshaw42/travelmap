import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { X, Globe, Map, Building2, Compass } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { getYearColor } from '../lib/colors'
import type { Pin } from '../types/pin'

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTHS_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

interface StatsPanelProps {
  pins: Pin[]
  isOpen: boolean
  onClose: () => void
}

export function StatsPanel({ pins, isOpen, onClose }: StatsPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="stats-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] sm:hidden"
          />
          <motion.aside
            key="stats-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[380px] flex flex-col
              bg-[#13131a] border-l border-[#252535] shadow-2xl overflow-hidden"
          >
            <PanelContent pins={pins} onClose={onClose} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

function PanelContent({ pins, onClose }: { pins: Pin[]; onClose: () => void }) {
  const trips = pins.length
  const cities = new Set(pins.map((p) => p.city).filter(Boolean)).size
  const states = new Set(pins.map((p) => p.state).filter(Boolean)).size
  const countries = new Set(pins.map((p) => p.country).filter(Boolean)).size

  // Year data for bar chart
  const yearMap: Record<string, number> = {}
  pins.forEach((p) => {
    if (p.year) yearMap[p.year] = (yearMap[p.year] ?? 0) + 1
  })
  const yearData = Object.entries(yearMap)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([year, count]) => ({ year, count }))

  // Month distribution
  const monthMap: Record<string, number> = {}
  pins.forEach((p) => {
    if (p.month) monthMap[p.month] = (monthMap[p.month] ?? 0) + 1
  })
  const monthData = MONTHS_FULL.map((m, i) => ({
    short: MONTHS_SHORT[i],
    count: monthMap[m] ?? 0,
  }))
  const maxMonth = Math.max(...monthData.map((m) => m.count), 1)

  // Countries list
  const countryList = [...new Set(pins.map((p) => p.country).filter(Boolean))].sort()

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#252535]">
        <div>
          <p className="text-[#6a6a7c] text-[10px] font-medium tracking-widest uppercase">
            The Journey
          </p>
          <h2 className="text-[#e8e8f0] text-base font-semibold">Trip Statistics</h2>
        </div>
        <button
          onClick={onClose}
          className="flex items-center justify-center w-8 h-8 rounded-lg
            text-[#6a6a7c] hover:text-[#e8e8f0] hover:bg-[#1e1e2e]
            transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-6">

        {/* Big 4 counters */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<Compass className="w-4 h-4" />}
            label="Adventures"
            value={trips}
            color="#f0c040"
          />
          <StatCard
            icon={<Building2 className="w-4 h-4" />}
            label="Cities"
            value={cities}
            color="#4f9eff"
          />
          <StatCard
            icon={<Map className="w-4 h-4" />}
            label="States"
            value={states}
            color="#6BCB77"
          />
          <StatCard
            icon={<Globe className="w-4 h-4" />}
            label="Countries"
            value={countries}
            color="#C77DFF"
          />
        </div>

        {/* Year chart */}
        {yearData.length > 0 && (
          <Section title="Adventures by Year">
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearData} barSize={22} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: 10, fill: '#6a6a7c' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#6a6a7c' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                    contentStyle={{
                      background: '#1e1e2e',
                      border: '1px solid #252535',
                      borderRadius: 8,
                      fontSize: 12,
                      color: '#e8e8f0',
                    }}
                    formatter={(v: number) => [v, 'trips']}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {yearData.map((entry) => (
                      <Cell key={entry.year} fill={getYearColor(entry.year)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>
        )}

        {/* Month heatmap row */}
        <Section title="Months on the Road">
          <div className="grid grid-cols-12 gap-1">
            {monthData.map(({ short, count }) => {
              const intensity = maxMonth > 0 ? count / maxMonth : 0
              return (
                <div key={short} className="flex flex-col items-center gap-1">
                  <div
                    className="w-full aspect-square rounded-sm transition-colors"
                    style={{
                      backgroundColor: `rgba(240, 192, 64, ${0.08 + intensity * 0.82})`,
                    }}
                    title={`${short}: ${count} trip${count !== 1 ? 's' : ''}`}
                  />
                  <span className="text-[8px] text-[#3a3a4e]">{short}</span>
                </div>
              )
            })}
          </div>
        </Section>

        {/* Countries */}
        {countryList.length > 0 && (
          <Section title={`Countries Visited · ${countries}`}>
            <div className="flex flex-col gap-1.5">
              {countryList.map((c) => {
                const count = pins.filter((p) => p.country === c).length
                return (
                  <div key={c} className="flex items-center justify-between">
                    <span className="text-[#c0c0d0] text-sm">{c}</span>
                    <span className="text-[#6a6a7c] text-xs tabular-nums">{count}</span>
                  </div>
                )
              })}
            </div>
          </Section>
        )}

        {pins.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <Globe className="w-10 h-10 text-[#3a3a4e]" />
            <p className="text-[#6a6a7c] text-sm">
              No adventures logged yet.<br />Start exploring!
            </p>
          </div>
        )}
      </div>
    </>
  )
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: number
  color: string
}) {
  const [displayed, setDisplayed] = useState(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const start = performance.now()
    const duration = 800

    function step(now: number) {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(Math.round(eased * value))
      if (progress < 1) rafRef.current = requestAnimationFrame(step)
    }

    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [value])

  return (
    <div
      className="flex flex-col gap-2 p-3.5 rounded-xl border"
      style={{ backgroundColor: `${color}0a`, borderColor: `${color}25` }}
    >
      <div className="flex items-center gap-2" style={{ color }}>
        {icon}
        <span className="text-[10px] font-medium tracking-wider uppercase text-[#6a6a7c]">
          {label}
        </span>
      </div>
      <span className="text-2xl font-bold tabular-nums" style={{ color }}>
        {displayed}
      </span>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="text-[#6a6a7c] text-[10px] font-medium tracking-widest uppercase whitespace-nowrap">
          {title}
        </span>
        <div className="flex-1 h-px bg-[#1e1e2e]" />
      </div>
      {children}
    </div>
  )
}
