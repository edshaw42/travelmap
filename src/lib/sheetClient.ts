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

export function submitPin(pin: NewPin): Promise<void> {
  return new Promise<void>((resolve) => {
    const iframeName = `pin-submit-${Date.now()}`
    const iframe = document.createElement('iframe')
    iframe.name = iframeName
    iframe.style.display = 'none'
    document.body.appendChild(iframe)

    const form = document.createElement('form')
    form.action = APPS_SCRIPT_URL
    form.method = 'POST'
    form.target = iframeName

    const fields: Record<string, string> = {
      year: pin.year,
      month: pin.month,
      name: pin.name,
      description: pin.description,
      lat: String(pin.lat),
      lng: String(pin.lng),
      city: pin.city,
      state: pin.state,
      country: pin.country,
    }

    for (const [name, value] of Object.entries(fields)) {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = name
      input.value = value
      form.appendChild(input)
    }

    document.body.appendChild(form)
    form.submit()

    // Resolve immediately so the UI closes; clean up the DOM elements
    // after giving Apps Script enough time to finish writing the row.
    resolve()
    setTimeout(() => {
      try { document.body.removeChild(form) } catch { /* already removed */ }
      try { document.body.removeChild(iframe) } catch { /* already removed */ }
    }, 6000)
  })
}
