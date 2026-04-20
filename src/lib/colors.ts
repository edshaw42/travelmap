// Bright palette — used for map pins (visible on any map background)
const MAP_PALETTE = [
  '#FF6B6B', // coral
  '#FFD93D', // golden yellow
  '#6BCB77', // fresh green
  '#4D96FF', // sky blue
  '#FF6FC8', // hot pink
  '#C77DFF', // violet
  '#FF9A3C', // amber orange
  '#00D4FF', // cyan
]

// Darker/contrast-safe palette — used for UI text, badges, and pills
// Each color targets ≥ 4.5:1 on white and ≥ 3:1 on the dark surface
const UI_DARK_PALETTE = [
  '#FF6B6B', // coral — readable on dark
  '#F0C040', // gold (shifted from yellow) — readable on dark
  '#6BCB77', // green — readable on dark
  '#4D96FF', // blue — readable on dark
  '#FF6FC8', // pink — readable on dark
  '#C77DFF', // violet — readable on dark
  '#FF9A3C', // orange — readable on dark
  '#00D4FF', // cyan — readable on dark
]

const UI_LIGHT_PALETTE = [
  '#B83232', // dark coral
  '#8B6200', // dark amber
  '#1A6E35', // dark green
  '#1A4FA8', // dark blue
  '#A0205A', // dark pink
  '#6A1BA0', // dark violet
  '#C05000', // dark orange
  '#006B99', // dark cyan
]

const yearColorCache = new Map<string, string>()

function getIndex(year: string | number): number {
  const n = parseInt(String(year), 10)
  return isNaN(n) ? 0 : Math.abs(n - 2018) % MAP_PALETTE.length
}

/** Bright color for map markers — always uses the vivid palette */
export function getYearColor(year: string | number): string {
  const key = `map:${year}`
  if (yearColorCache.has(key)) return yearColorCache.get(key)!
  const color = MAP_PALETTE[getIndex(year)]
  yearColorCache.set(key, color)
  return color
}

/** Contrast-safe color for UI text, badges, and pill labels */
export function getYearColorForUI(year: string | number, isDark: boolean): string {
  const key = `ui:${year}:${isDark}`
  if (yearColorCache.has(key)) return yearColorCache.get(key)!
  const palette = isDark ? UI_DARK_PALETTE : UI_LIGHT_PALETTE
  const color = palette[getIndex(year)]
  yearColorCache.set(key, color)
  return color
}

export function getUniqueYears(years: string[]): string[] {
  return [...new Set(years)].sort()
}
