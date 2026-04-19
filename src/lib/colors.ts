// Year-based colors — vibrant palette that pops on the dark map
const YEAR_PALETTE = [
  '#FF6B6B', // coral red
  '#FFD93D', // golden yellow
  '#6BCB77', // fresh green
  '#4D96FF', // sky blue
  '#FF6FC8', // hot pink
  '#C77DFF', // violet
  '#FF9A3C', // amber orange
  '#00D4FF', // cyan
]

const yearColorCache = new Map<string, string>()

export function getYearColor(year: string | number): string {
  const key = String(year)
  if (yearColorCache.has(key)) return yearColorCache.get(key)!
  const yearNum = parseInt(key, 10)
  const color = isNaN(yearNum)
    ? YEAR_PALETTE[0]
    : YEAR_PALETTE[Math.abs(yearNum - 2018) % YEAR_PALETTE.length]
  yearColorCache.set(key, color)
  return color
}

export function getUniqueYears(years: string[]): string[] {
  return [...new Set(years)].sort()
}
