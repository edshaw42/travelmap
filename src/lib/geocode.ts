export interface GeoResult {
  city: string
  state: string
  country: string
}

export interface PlaceResult {
  lat: number
  lng: number
  label: string
  geo: GeoResult
}

export interface PlaceSuggestion {
  id: string
  mainText: string
  secondaryText: string
  prediction: google.maps.places.PlacePrediction
}

/** Address component normalized across the Geocoder (long_name) and Places (longText) APIs */
interface Component {
  name: string
  types: string[]
}

const EMPTY: GeoResult = { city: '', state: '', country: '' }

/** Pull city / state / country out of one or more address-component lists, best result first */
function parseComponents(lists: Component[][]): GeoResult {
  const result = { ...EMPTY }

  for (const components of lists) {
    for (const c of components) {
      if (!result.city && c.types.includes('locality')) result.city = c.name
      if (!result.state && c.types.includes('administrative_area_level_1')) result.state = c.name
      if (!result.country && c.types.includes('country')) result.country = c.name
    }
    if (result.city && result.state && result.country) return result
  }

  // Second pass for places without a proper locality (towns, boroughs, rural areas)
  for (const components of lists) {
    for (const c of components) {
      if (
        !result.city &&
        (c.types.includes('postal_town') ||
          c.types.includes('administrative_area_level_3') ||
          c.types.includes('sublocality_level_1') ||
          c.types.includes('sublocality'))
      ) {
        result.city = c.name
      }
      if (!result.state && c.types.includes('administrative_area_level_2')) result.state = c.name
    }
    if (result.city && result.state) break
  }

  return result
}

/**
 * Reverse-geocode a map click. Uses the Maps JS Geocoder — the REST geocoding
 * endpoint rejects referrer-restricted keys, so it can't be called from the browser.
 */
export async function geocodeLatLng(lat: number, lng: number): Promise<GeoResult> {
  try {
    const { Geocoder } = (await google.maps.importLibrary('geocoding')) as google.maps.GeocodingLibrary
    const { results } = await new Geocoder().geocode({ location: { lat, lng } })
    return parseComponents(
      results
        .slice(0, 5)
        .map((r) => r.address_components.map((c) => ({ name: c.long_name, types: c.types }))),
    )
  } catch {
    // Return empty strings on failure — Apps Script backfills location server-side
    return { ...EMPTY }
  }
}

/** Type-ahead suggestions for the place search box */
export async function searchPlaces(
  input: string,
  sessionToken: google.maps.places.AutocompleteSessionToken,
): Promise<PlaceSuggestion[]> {
  const { AutocompleteSuggestion } = (await google.maps.importLibrary(
    'places',
  )) as google.maps.PlacesLibrary
  const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
    input,
    sessionToken,
  })
  return suggestions
    .map((s) => s.placePrediction)
    .filter((p): p is google.maps.places.PlacePrediction => p !== null)
    .map((p) => ({
      id: p.placeId,
      mainText: p.mainText?.text ?? p.text.text,
      secondaryText: p.secondaryText?.text ?? '',
      prediction: p,
    }))
}

/** Resolve a chosen suggestion to coordinates + city/state/country */
export async function resolvePlace(suggestion: PlaceSuggestion): Promise<PlaceResult | null> {
  const place = suggestion.prediction.toPlace()
  await place.fetchFields({ fields: ['location', 'addressComponents'] })
  if (!place.location) return null

  return {
    lat: place.location.lat(),
    lng: place.location.lng(),
    label: [suggestion.mainText, suggestion.secondaryText].filter(Boolean).join(', '),
    geo: parseComponents([
      (place.addressComponents ?? []).map((c) => ({ name: c.longText ?? '', types: c.types })),
    ]),
  }
}

export async function newSearchSession(): Promise<google.maps.places.AutocompleteSessionToken> {
  const { AutocompleteSessionToken } = (await google.maps.importLibrary(
    'places',
  )) as google.maps.PlacesLibrary
  return new AutocompleteSessionToken()
}
