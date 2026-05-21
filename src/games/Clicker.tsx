import { useState, useRef } from 'react'
import type { GameProps } from '../types'
import { sfx } from '../sfx'

const COLOR           = '#FFD600'
const TAPS_PER_LEVEL  = 8  // was 10 — faster escalation
const MAX_MULT        = 6  // was 5

export default function Clicker({ isActive, onScore }: GameProps) {
  const [taps, setTaps]         = useState(0)
  const [multiplier, setMult]   = useState(1)
  const [multKey, setMultKey]   = useState(0)
  const [pressing, setPressing] = useState(false)
  const tapRef  = useRef(0)
  const multRef = useRef(1)

  const handleTap = () => {
    if (!isActive) return
    const newTaps = tapRef.current + 1
    tapRef.current = newTaps
    const newMult = Math.min(MAX_MULT, 1 + Math.floor(newTaps / TAPS_PER_LEVEL) * 0.5)
    const changed = newMult !== multRef.current
    multRef.current = newMult
    onScore(newMult)
    setTaps(newTaps)
    setMult(newMult)
    if (changed) { sfx.multiplier(); setMultKey(k => k + 1) }
    else sfx.tap()
    setPressing(true)
    setTimeout(() => setPressing(false), 110)
  }

  const tapsToNext = TAPS_PER_LEVEL - (taps % TAPS_PER_LEVEL)
  const progress   = ((taps % TAPS_PER_LEVEL) / TAPS_PER_LEVEL) * 100
  const maxed      = multiplier >= MAX_MULT

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: 24 }}>
      {/* Multiplier */}
      <div className="text-center">
        <div key={multKey} className="font-display font-black text-5xl mult-text" style={{ color: COLOR, textShadow: `0 0 24px ${COLOR}80` }}>
          ×{Number.isInteger(multiplier) ? multiplier : multiplier.toFixed(1)}
        </div>
        <div className="text-xs font-bold tracking-widest uppercase mt-1" style={{ color: 'var(--muted)' }}>Multiplicateur</div>
      </div>

      {/* Button */}
      <button
        className="clicker-btn"
        style={{
          width: 185, height: 185, color: COLOR,
          boxShadow: pressing ? `0 0 10px ${COLOR}40` : `0 0 35px ${COLOR}65, 0 0 70px ${COLOR}30`,
          transform: pressing ? 'scale(0.91)' : 'scale(1)',
          transition: 'transform 0.09s, box-shadow 0.09s',
        }}
        onPointerDown={e => { e.preventDefault(); handleTap() }}
      >
        <div className="font-display font-black text-base" style={{ color: COLOR }}>TAP</div>
        <div className="font-display font-black text-3xl" style={{ color: COLOR }}>
          +{Number.isInteger(multiplier) ? multiplier : multiplier.toFixed(1)}
        </div>
      </button>

      {/* Progress bar */}
      {!maxed && (
        <div className="w-full max-w-xs text-center">
          <div className="rounded-full overflow-hidden mb-1" style={{ height: 6, background: 'var(--s2)' }}>
            <div className="h-full rounded-full" style={{ width: `${progress}%`, background: COLOR, transition: 'width 0.1s linear' }} />
          </div>
          <div className="text-xs" style={{ color: 'var(--muted)' }}>
            {tapsToNext} tap{tapsToNext > 1 ? 's' : ''} → ×{Math.min(MAX_MULT, multiplier + 0.5).toFixed(1)}
          </div>
        </div>
      )}

      {maxed && <div className="text-xs font-bold" style={{ color: COLOR }}>MAXIMUM ×{MAX_MULT} !</div>}
      <div className="text-xs" style={{ color: 'var(--muted)' }}>{taps} tap{taps !== 1 ? 's' : ''}</div>
    </div>
  )
}
