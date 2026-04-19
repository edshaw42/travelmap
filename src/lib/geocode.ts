import { API_KEY } from '../constants'

interface GeoResult {
  city: string
  state: string
  country: string
}

export async function geocodeLatLng(lat: number, lng: number): Promise<GeoResult> {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`
  const result: GeoResult = { city: '', state: '', country: '' }

  try {
    const response = await fetch(url)
    const geo = await response.json()

    if (geo.status !== 'OK' || !geo.results?.length) return result

    // Search through first 5 results for best coverage
    for (let i = 0; i < Math.min(geo.results.length, 5); i++) {
      const components: google.maps.GeocoderAddressComponent[] =
        geo.results[i].address_components ?? []

      for (const c of components) {
        if (!result.city && c.types.includes('locality')) result.city = c.long_name
        if (!result.state && c.types.includes('administrative_area_level_1'))
          result.state = c.long_name
        if (!result.country && c.types.includes('country')) result.country = c.long_name
      }

      if (result.city && result.state && result.country) break
    }

    // Second pass for missing city alternatives (fixed: proper loop termination)
    if (!result.city || !result.state) {
      for (let i = 0; i < Math.min(geo.results.length, 5); i++) {
        const components: google.maps.GeocoderAddressComponent[] =
          geo.results[i].address_components ?? []

        for (const c of components) {
          if (
            !result.city &&
            (c.types.includes('postal_town') ||
              c.types.includes('administrative_area_level_3') ||
              c.types.includes('sublocality_level_1') ||
              c.types.includes('sublocality'))
          ) {
            result.city = c.long_name
          }
          if (!result.state && c.types.includes('administrative_area_level_2')) {
            result.state = c.long_name
          }
        }

        if (result.city && result.state) break
      }
    }
  } catch {
    // Return empty strings on network failure — caller handles gracefully
  }

  return result
}
