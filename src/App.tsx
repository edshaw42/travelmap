import { APIProvider } from '@vis.gl/react-google-maps'
import { AnimatePresence } from 'framer-motion'
import { useMemo } from 'react'
import { API_KEY } from './constants'
import { usePins } from './hooks/usePins'
import { useMapState } from './hooks/useMapState'
import { getUniqueYears } from './lib/colors'
import { Header } from './components/Header'
import { MapView } from './components/MapView'
import { JournalCard } from './components/JournalCard'
import { AddPinFlow } from './components/AddPinFlow'
import { StatsPanel } from './components/StatsPanel'
import { LoadingScreen } from './components/LoadingScreen'
import type { Pin } from './types/pin'

export default function App() {
  const { data: pins = [], isLoading } = usePins()

  const {
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
  } = useMapState()

  const years = useMemo(() => getUniqueYears(pins.map((p) => p.year)), [pins])

  function handlePinAdded(newPin: Pin) {
    // Optimistically show the pin immediately before re-fetch
    selectPin(newPin)
  }

  return (
    <APIProvider apiKey={API_KEY}>
      <div className="flex flex-col h-screen overflow-hidden bg-[#0f0f1a]">
        <Header
          isAddMode={isAddMode}
          isStatsPanelOpen={isStatsPanelOpen}
          onToggleAddMode={toggleAddMode}
          onToggleStats={toggleStatsPanel}
        />

        <div className="relative flex-1 overflow-hidden">
          {isLoading ? (
            <LoadingScreen />
          ) : (
            <MapView
              pins={pins}
              selectedPin={selectedPin}
              isAddMode={isAddMode}
              activeYears={activeYears}
              years={years}
              onSelectPin={(pin) => {
                selectPin(pin)
                if (isStatsPanelOpen) toggleStatsPanel()
              }}
              onMapClick={(lat, lng) => {
                if (!isAddMode) return
                selectPin(null)
                startAddPin(lat, lng)
              }}
              onToggleYear={toggleYear}
            />
          )}

          {/* Journal card — slides in from right */}
          <JournalCard pin={selectedPin} onClose={() => selectPin(null)} />

          {/* Stats panel — slides in from right */}
          <StatsPanel
            pins={pins}
            isOpen={isStatsPanelOpen}
            onClose={toggleStatsPanel}
          />

          {/* Add pin flow — modal */}
          <AnimatePresence>
            {pendingLocation && (
              <AddPinFlow
                key="add-pin"
                location={pendingLocation}
                onCancel={cancelAddPin}
                onSuccess={handlePinAdded}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </APIProvider>
  )
}
