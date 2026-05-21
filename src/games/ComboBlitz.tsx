import { useState, useRef } from 'react'
import type { GameProps } from '../types'

const COLOR = '#A855F7'

type Side = 'left' | 'right'

export default function ComboBlitz({ isActive, onScore }: GameProps) {
  const [active, setActive] = useState<Side>('left')
  const [combo, setCombo] = useState(0)
  const [leftFlash, setLeftFlash] = useState<'hit' | 'miss' | null>(null)
  const [rightFlash, setRightFlash] = useState<'hit' | 'miss' | null>(null)
  const activeRef = useRef<Side>('left')
  const comboRef = useRef(0)

  const flash = (side: Side, type: 'hit' | 'miss') => {
    const set = side === 'left' ? setLeftFlash : setRightFlash
    set(type)
    setTimeout(() => set(null), 180)
  }

  const handleTap = (side: Side) => {
    if (!isActive) return

    if (side === activeRef.current) {
      // Correct button
      comboRef.current += 1
      setCombo(comboRef.current)
      onScore(1)
      flash(side, 'hit')
      const next: Side = side === 'left' ? 'right' : 'left'
      activeRef.current = next
      setActive(next)
    } else {
      // Wrong button — reset combo
      comboRef.current = 0
      setCombo(0)
      flash(side, 'miss')
    }
  }

  const comboLabel = combo >= 20 ? '🔥 FEU' : combo >= 10 ? '⚡ RAPIDE' : combo >= 5 ? '✓ COMBO' : ''

  const btnStyle = (side: Side, flashState: 'hit' | 'miss' | null) => {
    const isActive_ = side === active
    const hitColor = flashState === 'hit' ? `${COLOR}50` : flashState === 'miss' ? 'rgba(255,0,102,0.2)' : 'var(--s2)'
    return {
      background: hitColor,
      borderColor: isActive_ ? COLOR : 'transparent',
      color: isActive_ ? COLOR : 'var(--muted)',
      '--c': COLOR,
    } as React.CSSProperties
  }

  return (
    <div
      style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '20px 16px', touchAction: 'none' }}
    >
      {/* Combo indicator */}
      <div className="text-center w-full">
        <div className="font-display text-3xl font-black" style={{ color: COLOR }}>
          {combo}
        </div>
        <div className="text-xs font-bold tracking-widest" style={{ color: 'var(--muted)', minHeight: '1.2em' }}>
          {comboLabel}
        </div>
      </div>

      {/* Arrow hint */}
      <div className="flex items-center gap-3 opacity-30">
        <div
          className="font-display text-xl font-black"
          style={{ color: active === 'left' ? COLOR : 'var(--muted)' }}
        >
          ◁
        </div>
        <div className="text-xs font-bold" style={{ color: 'var(--muted)' }}>
          TAPE
        </div>
        <div
          className="font-display text-xl font-black"
          style={{ color: active === 'right' ? COLOR : 'var(--muted)' }}
        >
          ▷
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 12, width: '100%', flex: 1, maxHeight: 260, marginTop: 16 }}>
        {(['left', 'right'] as Side[]).map(side => {
          const flashState = side === 'left' ? leftFlash : rightFlash
          const isActive_ = side === active
          return (
            <button
              key={side}
              className={`combo-btn ${isActive_ ? 'combo-active' : ''}`}
              style={btnStyle(side, flashState)}
              onPointerDown={(e) => {
                e.preventDefault()
                handleTap(side)
              }}
            >
              <div
                className="font-display font-black"
                style={{ fontSize: '3.5rem', lineHeight: 1 }}
              >
                {side === 'left' ? '◁' : '▷'}
              </div>
              <div className="font-bold text-sm tracking-widest">
                {side === 'left' ? 'GAUCHE' : 'DROITE'}
              </div>
            </button>
          )
        })}
      </div>

      {/* Speed feedback */}
      <div className="text-xs text-center pb-2" style={{ color: 'var(--muted)', minHeight: '1.5em' }}>
        {combo > 0 && `${combo} coup${combo > 1 ? 's' : ''} d'affilée !`}
      </div>
    </div>
  )
}
