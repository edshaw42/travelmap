export interface Pin {
  id: string
  year: string
  month: string
  name: string
  description: string
  lat: number
  lng: number
  city: string
  state: string
  country: string
  photoUrl?: string
}

export interface NewPin {
  year: string
  month: string
  name: string
  description: string
  lat: number
  lng: number
  city: string
  state: string
  country: string
}
