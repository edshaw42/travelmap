export const SHEET_ID = '1wvENHweG4e16n514x2zUR-NJmhp3IrUPxTQUFaGRgg0'
export const API_KEY = 'AIzaSyD4onh-91wzzcsGdBkJxVJ-U6FYnFo3ebQ'
export const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbwrwUkD5GBmYDcoU5a5Pauf9DfMVOJU0EqYHrZYF-yab1lK-iMlxr9wn4EuedyBUD4/exec'

export const DEFAULT_CENTER = { lat: 39.8283, lng: -98.5795 }
export const DEFAULT_ZOOM = 4

// Sheet column layout (0-indexed after header row):
// 0: Timestamp | 1: Year | 2: Month | 3: Name | 4: Description
// 5: Latitude  | 6: Longitude | 7: City | 8: State | 9: Country | 10: PhotoUrl
export const COL = {
  TIMESTAMP: 0,
  YEAR: 1,
  MONTH: 2,
  NAME: 3,
  DESCRIPTION: 4,
  LAT: 5,
  LNG: 6,
  CITY: 7,
  STATE: 8,
  COUNTRY: 9,
  PHOTO_URL: 10,
} as const

export const LIGHT_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#f5f5fa' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#e8e8f0' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca3af' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#d1d5e0' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#b8d4f0' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#6b7280' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#d1d5db' }] },
  { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#6b7280' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#374151' }] },
]

export const DARK_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#1e1e2e' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6b7280' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1e1e2e' }] },
  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: [{ color: '#374151' }],
  },
  {
    featureType: 'administrative.country',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9ca3af' }],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d1d5db' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b7280' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#172032' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#2d2d42' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1a1a2e' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#4b5563' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#374151' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1f2937' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b7280' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#1f2937' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0d1b2e' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#1e3a5f' }],
  },
]
