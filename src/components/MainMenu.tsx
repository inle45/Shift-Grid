import { useState, useEffect } from 'react'
import type { GameId } from '../types'
import { GAME_CONFIGS, GAME_ORDER } from '../types'
import { getStats } from '../stats'

interface Props {
  onSelectGame: (id: GameId) => void
}

const DURATION_LABEL: Record<GameId, string> = {
  'tap-rush': '10s', 'swipe-chain': '15s', 'clicker': '20s',
  'pulse-collector': '10s', 'combo-blitz': '12s',
}

export default function MainMenu({ onSelectGame }: Props) {
  const [bestScores, setBestScores] = useState<Partial<Record<GameId, number>>>({})

  useEffect(() => {
    const scores: Partial<Record<GameId, number>> = {}
    GAME_ORDER.forEach(id => {
      const s = getStats(id)
      if (s.bestScore > 0) scores[id] = s.bestScore
    })
    setBestScores(scores)
  }, [])

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      {/* Ambient orbs */}
      <div className="orb" style={{ width: 300, height: 300, background: 'rgba(0,212,255,0.07)', top: -80, left: -80 }} />
      <div className="orb" style={{ width: 250, height: 250, background: 'rgba(255,0,102,0.07)', bottom: -60, right: -60, animationDelay: '-7s' }} />
      <div className="orb" style={{ width: 200, height: 200, background: 'rgba(168,85,247,0.06)', top: '40%', right: -40, animationDelay: '-13s' }} />

      {/* Header */}
      <div className="relative z-10 pt-10 pb-4 px-6 text-center">
        <div
          className="font-display text-6xl font-black tracking-widest"
          style={{ color: '#fff', textShadow: '0 0 20px rgba(0,212,255,0.6), 0 0 60px rgba(0,212,255,0.3)', letterSpacing: '0.18em' }}
        >
          RUSH
        </div>
        <div className="text-sm mt-1 font-semibold tracking-widest uppercase" style={{ color: 'var(--muted)' }}>
          5 mini-jeux · tape vite
        </div>
      </div>

      {/* Game cards */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 pt-2 space-y-3 relative z-10" style={{ scrollbarWidth: 'none' }}>
        {GAME_ORDER.map((id) => {
          const cfg = GAME_CONFIGS[id]
          const best = bestScores[id]
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
                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="font-display text-base font-bold tracking-wide" style={{ color: cfg.color }}>
                    {cfg.name}
                  </div>
                  <div className="text-xs mt-0.5 leading-snug" style={{ color: 'var(--muted)' }}>
                    {cfg.tagline}
                  </div>
                </div>

                {/* Right side badges */}
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <div
                    className="text-xs font-bold px-2.5 py-1 rounded-lg"
                    style={{ background: `${cfg.color}20`, color: cfg.color }}
                  >
                    {DURATION_LABEL[id]}
                  </div>
                  {best !== undefined && (
                    <div className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>
                      🏆 {best}
                    </div>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Footer */}
      <div className="relative z-10 pb-6 text-center">
        <div className="text-xs opacity-30" style={{ color: 'var(--muted)' }}>● ● ● ● ●</div>
      </div>
    </div>
  )
}
