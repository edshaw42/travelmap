import { API_KEY, APPS_SCRIPT_URL, COL, SHEET_ID } from '../constants'
import type { NewPin, Pin } from '../types/pin'

export async function fetchPins(): Promise<Pin[]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1?key=${API_KEY}`
  const response = await fetch(url)

  if (!response.ok) throw new Error(`Sheets API error: ${response.status}`)

  const data = await response.json()
  const rows: string[][] = data.values ?? []

  // Skip header row
  return rows
    .slice(1)
    .filter((row) => row.length >= 7)
    .map((row, index): Pin | null => {
      const lat = parseFloat(row[COL.LAT])
      const lng = parseFloat(row[COL.LNG])
      if (isNaN(lat) || isNaN(lng)) return null

      return {
        id: String(index + 2), // 1-based row index (row 1 = header)
        year: row[COL.YEAR] ?? '',
        month: row[COL.MONTH] ?? '',
        name: row[COL.NAME] ?? '',
        description: row[COL.DESCRIPTION] ?? '',
        lat,
        lng,
        city: row[COL.CITY] ?? '',
        state: row[COL.STATE] ?? '',
        country: row[COL.COUNTRY] ?? '',
        photoUrl: row[COL.PHOTO_URL] ?? undefined,
      }
    })
    .filter((pin): pin is Pin => pin !== null)
}

export async function submitPin(pin: NewPin): Promise<void> {
  const body = new URLSearchParams({
    year: pin.year,
    month: pin.month,
    name: pin.name,
    description: pin.description,
    lat: String(pin.lat),
    lng: String(pin.lng),
    city: pin.city,
    state: pin.state,
    country: pin.country,
  })

  // no-cors sends a cross-origin simple request; Apps Script receives it in e.parameter
  await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    body,
  })
}
