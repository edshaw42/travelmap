import { useCallback, useState } from 'react'
import type { Pin } from '../types/pin'

export function useMapState() {
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null)
  const [isAddMode, setIsAddMode] = useState(false)
  const [pendingLocation, setPendingLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [activeYears, setActiveYears] = useState<Set<string>>(new Set())
  const [isStatsPanelOpen, setIsStatsPanelOpen] = useState(false)
  const [isListPanelOpen, setIsListPanelOpen] = useState(false)

  const selectPin = useCallback((pin: Pin | null) => {
    setSelectedPin(pin)
    if (pin) setIsListPanelOpen(false) // list closes when journal card opens
  }, [])

  const toggleAddMode = useCallback(() => {
    setIsAddMode((prev) => !prev)
    setSelectedPin(null)
    setPendingLocation(null)
  }, [])

  const startAddPin = useCallback((lat: number, lng: number) => {
    setPendingLocation({ lat, lng })
  }, [])

  const cancelAddPin = useCallback(() => {
    setPendingLocation(null)
    setIsAddMode(false)
  }, [])

  const toggleYear = useCallback((year: string) => {
    setActiveYears((prev) => {
      const next = new Set(prev)
      if (next.has(year)) next.delete(year)
      else next.add(year)
      return next
    })
  }, [])

  const toggleStatsPanel = useCallback(() => {
    setIsStatsPanelOpen((prev) => !prev)
    setSelectedPin(null)
    setIsListPanelOpen(false)
  }, [])

  const toggleListPanel = useCallback(() => {
    setIsListPanelOpen((prev) => !prev)
    setSelectedPin(null)
    setIsStatsPanelOpen(false)
  }, [])

  return {
    selectedPin,
    selectPin,
    isAddMode,
    toggleAddMode,
    pendingLocation,
    startAddPin,
    cancelAddPin,
    activeYears,
    toggleYear,
    isStatsPanelOpen,
    toggleStatsPanel,
    isListPanelOpen,
    toggleListPanel,
  }
}
