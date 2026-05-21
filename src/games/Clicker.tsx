import { useState, useRef } from 'react'
import type { GameProps } from '../types'

const COLOR = '#FFD600'
const TAPS_PER_LEVEL = 10
const MAX_MULT = 5

export default function Clicker({ isActive, onScore }: GameProps) {
  const [taps, setTaps] = useState(0)
  const [multiplier, setMultiplier] = useState(1)
  const [multKey, setMultKey] = useState(0)
  const [pressing, setPressing] = useState(false)
  const tapCountRef = useRef(0)
  const multRef = useRef(1)

  const handleTap = () => {
    if (!isActive) return

    const newTaps = tapCountRef.current + 1
    tapCountRef.current = newTaps

    const newMult = Math.min(MAX_MULT, 1 + Math.floor(newTaps / TAPS_PER_LEVEL) * 0.5)
    const multChanged = newMult !== multRef.current
    multRef.current = newMult

    onScore(newMult)
    setTaps(newTaps)
    setMultiplier(newMult)
    if (multChanged) setMultKey(k => k + 1)

    // Button press visual
    setPressing(true)
    setTimeout(() => setPressing(false), 120)
  }

  const tapsToNextLevel = TAPS_PER_LEVEL - (taps % TAPS_PER_LEVEL)
  const progress = ((taps % TAPS_PER_LEVEL) / TAPS_PER_LEVEL) * 100
  const maxed = multiplier >= MAX_MULT

  return (
    <div
      style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: 24 }}
    >
      {/* Multiplier badge */}
      <div className="text-center">
        <div
          key={multKey}
          className="font-display font-black text-5xl mult-text"
          style={{ color: COLOR, textShadow: `0 0 24px ${COLOR}80` }}
        >
          ×{multiplier % 1 === 0 ? multiplier : multiplier.toFixed(1)}
        </div>
        <div className="text-xs font-bold tracking-widest uppercase mt-1" style={{ color: 'var(--muted)' }}>
          Multiplicateur
        </div>
      </div>

      {/* Big clicker button */}
      <button
        className="clicker-btn"
        style={{
          width: 180,
          height: 180,
          color: COLOR,
          boxShadow: pressing
            ? `0 0 10px ${COLOR}40`
            : `0 0 30px ${COLOR}60, 0 0 60px ${COLOR}30`,
          transform: pressing ? 'scale(0.92)' : 'scale(1)',
          transition: 'transform 0.1s, box-shadow 0.1s',
        }}
        onPointerDown={(e) => {
          e.preventDefault()
          handleTap()
        }}
      >
        <div
          className="font-display font-black"
          style={{ fontSize: '1.1rem', color: COLOR, letterSpacing: '0.05em' }}
        >
          TAP
        </div>
        <div className="font-display font-black text-3xl" style={{ color: COLOR }}>
          +{multiplier % 1 === 0 ? multiplier : multiplier.toFixed(1)}
        </div>
      </button>

      {/* Progress to next multiplier */}
      {!maxed && (
        <div className="w-full max-w-xs text-center">
          <div className="rounded-full overflow-hidden mb-1" style={{ height: 6, background: 'var(--s2)' }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                background: COLOR,
                transition: 'width 0.1s linear',
              }}
            />
          </div>
          <div className="text-xs" style={{ color: 'var(--muted)' }}>
            {tapsToNextLevel} tap{tapsToNextLevel > 1 ? 's' : ''} → ×{Math.min(MAX_MULT, multiplier + 0.5).toFixed(1)}
          </div>
        </div>
      )}

      {maxed && (
        <div className="text-xs font-bold" style={{ color: COLOR }}>
          MAXIMUM ATTEINT !
        </div>
      )}

      <div className="text-xs" style={{ color: 'var(--muted)' }}>
        {taps} tap{taps > 1 ? 's' : ''}
      </div>
    </div>
  )
}
