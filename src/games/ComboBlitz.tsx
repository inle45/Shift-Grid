import { useState, useRef } from 'react'
import type { GameProps } from '../types'
import { sfx } from '../sfx'

const COLOR = '#A855F7'
type Side = 'left' | 'right'

export default function ComboBlitz({ isActive, onScore }: GameProps) {
  const [active, setActive]     = useState<Side>('left')
  const [combo, setCombo]       = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [lFlash, setLFlash]     = useState<'hit' | 'miss' | null>(null)
  const [rFlash, setRFlash]     = useState<'hit' | 'miss' | null>(null)
  const activeRef = useRef<Side>('left')
  const comboRef  = useRef(0)

  const flash = (side: Side, type: 'hit' | 'miss') => {
    const set = side === 'left' ? setLFlash : setRFlash
    set(type)
    setTimeout(() => set(null), 160)
  }

  const handleTap = (side: Side) => {
    if (!isActive) return
    if (side === activeRef.current) {
      comboRef.current += 1
      setCombo(comboRef.current)
      setMaxCombo(m => Math.max(m, comboRef.current))
      sfx.combo()
      onScore(1)
      flash(side, 'hit')
      const next: Side = side === 'left' ? 'right' : 'left'
      activeRef.current = next
      setActive(next)
    } else {
      // Wrong side — penalty
      comboRef.current = 0
      setCombo(0)
      sfx.miss()
      onScore(-1)
      flash(side, 'miss')
    }
  }

  const comboLabel = combo >= 30 ? '🔥 INCROYABLE' : combo >= 15 ? '⚡ EN FEU' : combo >= 8 ? '✓ COMBO' : ''

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '16px 14px', touchAction: 'none' }}>
      {/* Stats row */}
      <div className="flex w-full justify-between items-start px-1">
        <div className="text-center">
          <div className="font-display text-3xl font-black" style={{ color: COLOR }}>{combo}</div>
          <div className="text-xs" style={{ color: 'var(--muted)' }}>Combo</div>
        </div>
        <div className="text-center" style={{ minHeight: '2em', display: 'flex', alignItems: 'center' }}>
          {comboLabel && (
            <div className="text-sm font-bold" style={{ color: COLOR }}>{comboLabel}</div>
          )}
        </div>
        <div className="text-center">
          <div className="font-display text-3xl font-black" style={{ color: 'var(--muted)' }}>{maxCombo}</div>
          <div className="text-xs" style={{ color: 'var(--muted)' }}>Max</div>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 10, width: '100%', flex: 1, maxHeight: 280, marginTop: 12 }}>
        {(['left', 'right'] as Side[]).map(side => {
          const flashState = side === 'left' ? lFlash : rFlash
          const isActiveBtn = side === active
          return (
            <button
              key={side}
              className={`combo-btn ${isActiveBtn ? 'combo-active' : ''}`}
              style={{
                background: flashState === 'hit' ? `${COLOR}40` : flashState === 'miss' ? 'rgba(255,0,102,0.18)' : 'var(--s2)',
                borderColor: isActiveBtn ? COLOR : 'transparent',
                color: isActiveBtn ? COLOR : 'var(--muted)',
                '--c': COLOR,
              } as React.CSSProperties}
              onPointerDown={e => { e.preventDefault(); handleTap(side) }}
            >
              <div className="font-display font-black" style={{ fontSize: '3.5rem', lineHeight: 1 }}>
                {side === 'left' ? '◁' : '▷'}
              </div>
              <div className="font-bold text-sm tracking-widest">
                {side === 'left' ? 'GAUCHE' : 'DROITE'}
              </div>
            </button>
          )
        })}
      </div>

      <div className="text-xs text-center py-2" style={{ color: 'var(--muted)' }}>
        Mauvais côté = −1 point
      </div>
    </div>
  )
}
