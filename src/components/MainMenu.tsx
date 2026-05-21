import { useState } from 'react'
import type { GameId } from '../types'
import type { MonState } from '../monetization'
import { GAME_CONFIGS, GAME_ORDER } from '../types'
import { getStats } from '../stats'
import { canClaimDaily, claimDaily } from '../monetization'
import Shop from './Shop'

interface Props {
  onSelectGame: (id: GameId) => void
  monState: MonState
  onMonStateChange: (s: MonState) => void
}

const DURATION: Record<GameId, string> = {
  'tap-rush': '10s', 'swipe-chain': '15s', 'clicker': '20s',
  'pulse-collector': '10s', 'combo-blitz': '12s',
}

export default function MainMenu({ onSelectGame, monState, onMonStateChange }: Props) {
  const [showShop, setShowShop] = useState(false)
  const daily = canClaimDaily()

  const handleDailyTap = () => {
    const { state } = claimDaily()
    onMonStateChange(state)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      {/* Ambient orbs */}
      <div className="orb" style={{ width: 300, height: 300, background: 'rgba(0,212,255,0.07)', top: -80, left: -80 }} />
      <div className="orb" style={{ width: 250, height: 250, background: 'rgba(255,0,102,0.07)', bottom: -60, right: -60, animationDelay: '-7s' }} />
      <div className="orb" style={{ width: 200, height: 200, background: 'rgba(168,85,247,0.06)', top: '40%', right: -40, animationDelay: '-13s' }} />

      {/* Top bar: coins + shop */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-5 pb-1">
        {/* Coin display */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255,214,0,0.1)',
            border: '1px solid rgba(255,214,0,0.3)',
            borderRadius: 10,
            padding: '5px 12px',
          }}
        >
          <span style={{ fontSize: 14 }}>🪙</span>
          <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 13, fontWeight: 700, color: '#FFD600' }}>
            {monState.coins}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {/* Daily reward dot */}
          {daily && (
            <button
              onPointerDown={handleDailyTap}
              style={{
                background: 'rgba(0,255,135,0.12)',
                border: '1px solid rgba(0,255,135,0.4)',
                borderRadius: 10,
                padding: '5px 12px',
                fontSize: 12,
                fontWeight: 700,
                color: '#00FF87',
                cursor: 'pointer',
              }}
            >
              🎁 +25
            </button>
          )}

          {/* Shop button */}
          <button
            onPointerDown={() => setShowShop(true)}
            style={{
              background: 'var(--s2)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10,
              padding: '5px 14px',
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--text)',
              cursor: 'pointer',
            }}
          >
            🏪 Shop
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="relative z-10 pt-5 pb-3 px-6 text-center">
        <div
          className="font-display text-6xl font-black tracking-widest"
          style={{ color: '#fff', textShadow: '0 0 20px rgba(0,212,255,0.6), 0 0 60px rgba(0,212,255,0.3)', letterSpacing: '0.18em' }}
        >
          RUSH
        </div>
        <div className="text-sm mt-1 font-semibold tracking-widest uppercase" style={{ color: 'var(--muted)' }}>
          5 mini-jeux · tape vite
        </div>
        {/* Active powerup notice */}
        {monState.activePowerup && (
          <div
            style={{
              marginTop: 8,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(168,85,247,0.15)',
              border: '1px solid rgba(168,85,247,0.4)',
              borderRadius: 10,
              padding: '4px 12px',
              fontSize: 11,
              fontWeight: 600,
              color: '#A855F7',
            }}
          >
            ⚡ Power-up actif pour le prochain jeu
          </div>
        )}
      </div>

      {/* Game cards */}
      <div className="flex-1 overflow-y-auto px-4 pb-3 pt-1 space-y-3 relative z-10" style={{ scrollbarWidth: 'none' }}>
        {GAME_ORDER.map(id => {
          const cfg  = GAME_CONFIGS[id]
          const best = getStats(id).bestScore
          return (
            <button
              key={id}
              className="menu-card w-full text-left rounded-2xl relative overflow-hidden"
              style={{ background: 'var(--surface)', border: '1.5px solid rgba(255,255,255,0.06)' }}
              onPointerDown={() => onSelectGame(id)}
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: cfg.color }} />
              <div className="absolute inset-0 rounded-2xl" style={{ background: `${cfg.color}08` }} />
              <div className="relative px-5 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="font-display text-base font-bold tracking-wide" style={{ color: cfg.color }}>
                    {cfg.name}
                  </div>
                  <div className="text-xs mt-0.5 leading-snug" style={{ color: 'var(--muted)' }}>
                    {cfg.tagline}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, flexShrink: 0 }}>
                  <div
                    className="text-xs font-bold px-2.5 py-1 rounded-lg"
                    style={{ background: `${cfg.color}20`, color: cfg.color }}
                  >
                    {DURATION[id]}
                  </div>
                  {best > 0 && (
                    <div className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>🏆 {best}</div>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* AdBanner */}
      {!monState.adsRemoved && (
        <div className="relative z-10">
          {/* Using AdBanner component */}
          <div
            style={{
              height: 52,
              background: '#12121A',
              borderTop: '1px solid rgba(0,212,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 12px',
              gap: 10,
            }}
          >
            <span style={{ position: 'absolute', right: 8, top: 3, fontSize: 9, color: 'rgba(255,255,255,0.25)', letterSpacing: 1 }}>PUB</span>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🎮</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>RUSH PRO</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Supprimez les publicités</div>
            </div>
            <button
              onPointerDown={() => setShowShop(true)}
              style={{ fontSize: 10, fontWeight: 700, color: '#00D4FF', border: '1px solid #00D4FF', borderRadius: 6, padding: '4px 8px', background: 'transparent', cursor: 'pointer' }}
            >
              2,99€ →
            </button>
          </div>
        </div>
      )}

      {showShop && (
        <Shop
          monState={monState}
          onStateChange={s => { onMonStateChange(s) }}
          onClose={() => setShowShop(false)}
        />
      )}
    </div>
  )
}
