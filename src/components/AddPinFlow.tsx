import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Loader2, MapPin, X } from 'lucide-react'
import { geocodeLatLng } from '../lib/geocode'
import { useAddPin } from '../hooks/usePins'
import type { NewPin } from '../types/pin'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: CURRENT_YEAR - 2017 }, (_, i) => CURRENT_YEAR - i)

interface AddPinFlowProps {
  location: { lat: number; lng: number } | null
  onCancel: () => void
  onSuccess: (pin: NewPin & { id: string }) => void
}

type Step = 'confirm' | 'details' | 'story'

export function AddPinFlow({ location, onCancel, onSuccess }: AddPinFlowProps) {
  const [step, setStep] = useState<Step>('confirm')
  const [form, setForm] = useState({
    name: '',
    month: '',
    year: String(CURRENT_YEAR),
    description: '',
  })
  const [geo, setGeo] = useState<{ city: string; state: string; country: string } | null>(null)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const { mutateAsync: addPin, isPending } = useAddPin()

  if (!location) return null

  const latStr = location.lat >= 0
    ? `${location.lat.toFixed(5)}°N`
    : `${Math.abs(location.lat).toFixed(5)}°S`
  const lngStr = location.lng >= 0
    ? `${location.lng.toFixed(5)}°E`
    : `${Math.abs(location.lng).toFixed(5)}°W`

  async function confirmLocation() {
    setIsGeocoding(true)
    const result = await geocodeLatLng(location!.lat, location!.lng)
    setGeo(result)
    setIsGeocoding(false)
    setStep('details')
  }

  async function handleSubmit() {
    if (!form.name || !form.month) return

    const pin: NewPin = {
      name: form.name,
      month: form.month,
      year: form.year,
      description: form.description,
      lat: location!.lat,
      lng: location!.lng,
      city: geo?.city ?? '',
      state: geo?.state ?? '',
      country: geo?.country ?? '',
    }

    await addPin(pin)
    onSuccess({ ...pin, id: `optimistic-${Date.now()}` })
    onCancel()
  }

  const steps: Step[] = ['confirm', 'details', 'story']
  const stepIndex = steps.indexOf(step)

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="fixed inset-x-4 bottom-4 sm:inset-auto sm:left-1/2 sm:-translate-x-1/2
          sm:top-1/2 sm:-translate-y-1/2 z-50
          w-auto sm:w-[480px] bg-[#13131a] border border-[#252535] rounded-2xl
          shadow-[0_32px_80px_rgba(0,0,0,0.7)] overflow-hidden"
      >
        {/* Step progress bar */}
        <div className="h-[2px] bg-[#252535]">
          <motion.div
            className="h-full bg-[#f0c040]"
            initial={{ width: 0 }}
            animate={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[#1e1e2e]">
          <div>
            <p className="text-[#6a6a7c] text-[10px] font-medium tracking-widest uppercase">
              New Entry · {stepIndex + 1} of {steps.length}
            </p>
            <h2 className="text-[#e8e8f0] text-base font-semibold mt-0.5">
              {step === 'confirm' && 'Mark your location'}
              {step === 'details' && 'When & where?'}
              {step === 'story' && 'Tell the story'}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="flex items-center justify-center w-8 h-8 rounded-lg
              text-[#6a6a7c] hover:text-[#e8e8f0] hover:bg-[#1e1e2e]
              transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step content */}
        <div className="px-5 py-4 min-h-[200px]">
          <AnimatePresence mode="wait">
            {step === 'confirm' && (
              <StepPane key="confirm">
                <div className="flex flex-col items-center gap-4 py-2 text-center">
                  <div className="w-14 h-14 rounded-full bg-[#f0c040]/10 border border-[#f0c040]/30
                    flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-[#f0c040]" />
                  </div>
                  <div>
                    <p className="text-[#e8e8f0] text-sm font-medium">You were here</p>
                    <p className="text-[#6a6a7c] text-xs font-mono mt-1">
                      {latStr} · {lngStr}
                    </p>
                  </div>
                  <p className="text-[#6a6a7c] text-xs max-w-xs">
                    We'll look up the city, state, and country automatically.
                    Is this the right spot?
                  </p>
                </div>
              </StepPane>
            )}

            {step === 'details' && (
              <StepPane key="details">
                <div className="flex flex-col gap-3">
                  {geo && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1e1e2e] border border-[#252535]">
                      <MapPin className="w-3.5 h-3.5 text-[#f0c040] flex-shrink-0" />
                      <span className="text-[#9a9aac] text-xs truncate">
                        {[geo.city, geo.state, geo.country].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                  <Field label="Trip name">
                    <input
                      type="text"
                      placeholder="e.g. Grand Canyon, Paris, Lake Tahoe…"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-lg bg-[#1e1e2e] border border-[#252535]
                        text-[#e8e8f0] text-sm placeholder:text-[#3a3a4e]
                        focus:outline-none focus:border-[#f0c040]/50 focus:bg-[#1e1e2e]
                        transition-colors"
                      autoFocus
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Month">
                      <select
                        value={form.month}
                        onChange={(e) => setForm((f) => ({ ...f, month: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-lg bg-[#1e1e2e] border border-[#252535]
                          text-[#e8e8f0] text-sm focus:outline-none focus:border-[#f0c040]/50
                          transition-colors cursor-pointer"
                      >
                        <option value="" disabled>Month</option>
                        {MONTHS.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Year">
                      <select
                        value={form.year}
                        onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-lg bg-[#1e1e2e] border border-[#252535]
                          text-[#e8e8f0] text-sm focus:outline-none focus:border-[#f0c040]/50
                          transition-colors cursor-pointer"
                      >
                        {YEARS.map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </div>
              </StepPane>
            )}

            {step === 'story' && (
              <StepPane key="story">
                <div className="flex flex-col gap-3">
                  <div className="px-3 py-2 rounded-lg bg-[#1e1e2e] border border-[#252535]">
                    <p className="text-[#e8e8f0] text-sm font-medium">{form.name}</p>
                    <p className="text-[#6a6a7c] text-xs mt-0.5">
                      {form.month} {form.year}
                    </p>
                  </div>
                  <Field label="Journal entry">
                    <textarea
                      placeholder="What made this place memorable? Write a few lines…"
                      value={form.description}
                      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                      rows={5}
                      className="w-full px-3 py-2.5 rounded-lg bg-[#1e1e2e] border border-[#252535]
                        text-[#e8e8f0] text-sm placeholder:text-[#3a3a4e] leading-relaxed
                        focus:outline-none focus:border-[#f0c040]/50
                        transition-colors resize-none italic"
                    />
                  </Field>
                  <p className="text-[#3a3a4e] text-[11px]">
                    This is optional — you can always leave it blank.
                  </p>
                </div>
              </StepPane>
            )}
          </AnimatePresence>
        </div>

        {/* Footer navigation */}
        <div className="flex items-center justify-between px-5 pb-5">
          <button
            onClick={() => {
              if (step === 'confirm') onCancel()
              else if (step === 'details') setStep('confirm')
              else setStep('details')
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg
              text-[#6a6a7c] hover:text-[#e8e8f0] text-sm
              transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            {step === 'confirm' ? 'Cancel' : 'Back'}
          </button>

          {step === 'confirm' && (
            <ActionButton onClick={confirmLocation} loading={isGeocoding}>
              Confirm
              <ArrowRight className="w-4 h-4" />
            </ActionButton>
          )}
          {step === 'details' && (
            <ActionButton
              onClick={() => setStep('story')}
              disabled={!form.name || !form.month}
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </ActionButton>
          )}
          {step === 'story' && (
            <ActionButton onClick={handleSubmit} loading={isPending}>
              <Check className="w-4 h-4" />
              Save entry
            </ActionButton>
          )}
        </div>
      </motion.div>
    </>
  )
}

function StepPane({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[#6a6a7c] text-[11px] font-medium tracking-wider uppercase">
        {label}
      </label>
      {children}
    </div>
  )
}

interface ActionButtonProps {
  onClick: () => void
  disabled?: boolean
  loading?: boolean
  children: React.ReactNode
}

function ActionButton({ onClick, disabled, loading, children }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
        bg-[#f0c040] text-[#0f0f1a] hover:bg-[#f5d060]
        disabled:opacity-40 disabled:cursor-not-allowed
        transition-all duration-150 cursor-pointer"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
    </button>
  )
}
