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
  const [form, setForm] = useState({ name: '', month: '', year: String(CURRENT_YEAR), description: '' })
  const [geo, setGeo] = useState<{ city: string; state: string; country: string } | null>(null)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const { mutateAsync: addPin, isPending } = useAddPin()

  if (!location) return null

  const latStr = location.lat >= 0 ? `${location.lat.toFixed(5)}°N` : `${Math.abs(location.lat).toFixed(5)}°S`
  const lngStr = location.lng >= 0 ? `${location.lng.toFixed(5)}°E` : `${Math.abs(location.lng).toFixed(5)}°W`

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
      name: form.name, month: form.month, year: form.year, description: form.description,
      lat: location!.lat, lng: location!.lng,
      city: geo?.city ?? '', state: geo?.state ?? '', country: geo?.country ?? '',
    }
    await addPin(pin)
    onSuccess({ ...pin, id: `optimistic-${Date.now()}` })
    onCancel()
  }

  const steps: Step[] = ['confirm', 'details', 'story']
  const stepIndex = steps.indexOf(step)

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="fixed inset-x-4 bottom-4 sm:inset-auto sm:left-1/2 sm:-translate-x-1/2
          sm:top-1/2 sm:-translate-y-1/2 z-50 w-auto sm:w-[480px] rounded-2xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--c-surface)', border: '1px solid var(--c-border)' }}
      >
        {/* Progress bar */}
        <div className="h-[2px]" style={{ backgroundColor: 'var(--c-border)' }}>
          <motion.div
            className="h-full"
            style={{ backgroundColor: 'var(--c-accent)' }}
            initial={{ width: 0 }}
            animate={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3"
          style={{ borderBottom: '1px solid var(--c-border-sub)' }}>
          <div>
            <p className="text-[10px] font-medium tracking-widest uppercase" style={{ color: 'var(--c-text-3)' }}>
              New Entry · {stepIndex + 1} of {steps.length}
            </p>
            <h2 className="text-base font-semibold mt-0.5" style={{ color: 'var(--c-text-1)' }}>
              {step === 'confirm' && 'Mark your location'}
              {step === 'details' && 'When & where?'}
              {step === 'story' && 'Tell the story'}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors cursor-pointer"
            style={{ color: 'var(--c-text-3)' }}
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
                  <div className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'var(--c-accent-bg)', border: '1px solid var(--c-accent-bdr)' }}>
                    <MapPin className="w-6 h-6" style={{ color: 'var(--c-accent)' }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--c-text-1)' }}>You were here</p>
                    <p className="text-xs font-mono mt-1" style={{ color: 'var(--c-text-3)' }}>
                      {latStr} · {lngStr}
                    </p>
                  </div>
                  <p className="text-xs max-w-xs" style={{ color: 'var(--c-text-3)' }}>
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
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
                      style={{ backgroundColor: 'var(--c-deep)', border: '1px solid var(--c-border)' }}>
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--c-accent)' }} />
                      <span className="text-xs truncate" style={{ color: 'var(--c-text-2)' }}>
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
                      autoFocus
                      className="w-full px-3 py-2.5 rounded-lg text-sm placeholder:opacity-40
                        focus:outline-none transition-colors"
                      style={{
                        backgroundColor: 'var(--c-deep)',
                        border: '1px solid var(--c-border)',
                        color: 'var(--c-text-1)',
                      }}
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Month">
                      <select
                        value={form.month}
                        onChange={(e) => setForm((f) => ({ ...f, month: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none cursor-pointer"
                        style={{
                          backgroundColor: 'var(--c-deep)',
                          border: '1px solid var(--c-border)',
                          color: form.month ? 'var(--c-text-1)' : 'var(--c-text-4)',
                        }}
                      >
                        <option value="" disabled>Month</option>
                        {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </Field>
                    <Field label="Year">
                      <select
                        value={form.year}
                        onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none cursor-pointer"
                        style={{
                          backgroundColor: 'var(--c-deep)',
                          border: '1px solid var(--c-border)',
                          color: 'var(--c-text-1)',
                        }}
                      >
                        {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </Field>
                  </div>
                </div>
              </StepPane>
            )}

            {step === 'story' && (
              <StepPane key="story">
                <div className="flex flex-col gap-3">
                  <div className="px-3 py-2 rounded-lg"
                    style={{ backgroundColor: 'var(--c-deep)', border: '1px solid var(--c-border)' }}>
                    <p className="text-sm font-medium" style={{ color: 'var(--c-text-1)' }}>{form.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--c-text-3)' }}>{form.month} {form.year}</p>
                  </div>
                  <Field label="Journal entry">
                    <textarea
                      placeholder="What made this place memorable? Write a few lines…"
                      value={form.description}
                      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                      rows={5}
                      className="w-full px-3 py-2.5 rounded-lg text-sm leading-relaxed
                        focus:outline-none resize-none italic"
                      style={{
                        backgroundColor: 'var(--c-deep)',
                        border: '1px solid var(--c-border)',
                        color: 'var(--c-text-1)',
                      }}
                    />
                  </Field>
                  <p className="text-[11px]" style={{ color: 'var(--c-text-4)' }}>
                    Optional — you can always leave it blank.
                  </p>
                </div>
              </StepPane>
            )}
          </AnimatePresence>
        </div>

        {/* Footer nav */}
        <div className="flex items-center justify-between px-5 pb-5">
          <button
            onClick={() => {
              if (step === 'confirm') onCancel()
              else if (step === 'details') setStep('confirm')
              else setStep('details')
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer"
            style={{ color: 'var(--c-text-3)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            {step === 'confirm' ? 'Cancel' : 'Back'}
          </button>

          {step === 'confirm' && (
            <ActionButton onClick={confirmLocation} loading={isGeocoding}>
              Confirm <ArrowRight className="w-4 h-4" />
            </ActionButton>
          )}
          {step === 'details' && (
            <ActionButton onClick={() => setStep('story')} disabled={!form.name || !form.month}>
              Continue <ArrowRight className="w-4 h-4" />
            </ActionButton>
          )}
          {step === 'story' && (
            <ActionButton onClick={handleSubmit} loading={isPending}>
              <Check className="w-4 h-4" /> Save entry
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
      <label className="text-[11px] font-medium tracking-wider uppercase" style={{ color: 'var(--c-text-3)' }}>
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
        disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
      style={{ backgroundColor: 'var(--c-accent)', color: '#0f0f1a' }}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
    </button>
  )
}
