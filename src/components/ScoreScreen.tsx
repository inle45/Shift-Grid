import { useEffect, useRef, useState } from 'react'
import type { GameId } from '../types'
import type { MonState } from '../monetization'
import { GAME_CONFIGS } from '../types'
import { recordGame } from '../stats'
import { sfx } from '../sfx'
import Shop from './Shop'

interface Props {
  score: number
  gameId: GameId
  onPlayAgain: () => void
  onMenu: () => void
  monState: MonState
  onMonStateChange: (s: MonState) => void
}

const THRESHOLDS: Record<GameId, [number, number, number, number]> = {
  'tap-rush':        [8,  16, 26, 38],
  'swipe-chain':     [4,  9,  15, 22],
  'clicker':         [30, 60, 100, 150],
  'pulse-collector': [5,  11, 18, 27],
  'combo-blitz':     [10, 20, 32, 46],
}
const RATINGS      = ['D', 'C', 'B', 'A', 'S']
const RATING_COLORS = ['#5A5A72', '#00D4FF', '#00FF87', '#FFD600', '#FF0066']
const RATING_MSGS  = ['Continue !', 'Pas mal !', 'Bien joué !', 'Excellent !', 'LÉGENDAIRE !']

function getRatingIdx(score: number, gameId: GameId) {
  const t = THRESHOLDS[gameId]
  if (score >= t[3]) return 4
  if (score >= t[2]) return 3
  if (score >= t[1]) return 2
  if (score >= t[0]) return 1
  return 0
}

export default function ScoreScreen({ score, gameId, onPlayAgain, onMenu, monState, onMonStateChange }: Props) {
  const cfg = GAME_CONFIGS[gameId]
  const idx  = getRatingIdx(score, gameId)
  const [showShop, setShowShop] = useState(false)

  const resultRef = useRef<ReturnType<typeof recordGame> | null>(null)
  if (!resultRef.current) resultRef.current = recordGame(gameId, score)
  const { stats, isRecord } = resultRef.current

  // Coins earned this game
  const coinsEarned = Math.max(3, Math.floor(score / 3))

  useEffect(() => {
    if (isRecord && score > 0) sfx.newRecord()
  }, [isRecord, score])

  return (
    <div className="score-screen flex flex-col h-full items-center justify-between px-6 py-6 relative overflow-hidden">
      {/* Orbs */}
      <div className="orb" style={{ width: 300, height: 300, background: `${cfg.color}10`, top: -100, left: -100 }} />
      <div className="orb" style={{ width: 200, height: 200, background: `${RATING_COLORS[idx]}10`, bottom: -60, right: -60, animationDelay: '-5s' }} />

      {/* Game name */}
      <div className="relative z-10 text-center w-full">
        <div className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--muted)' }}>Résultat</div>
        <div className="font-display text-lg font-bold mt-1" style={{ color: cfg.color }}>{cfg.name}</div>
      </div>

      {/* Rating + score */}
      <div className="relative z-10 text-center flex-1 flex flex-col items-center justify-center gap-3">
        {isRecord && score > 0 && (
          <div
            className="px-4 py-1 rounded-full text-xs font-bold tracking-widest"
            style={{ background: `${cfg.color}25`, color: cfg.color, border: `1px solid ${cfg.color}60` }}
          >
            🏆 NOUVEAU RECORD !
          </div>
        )}

        <div
          className="font-display font-black leading-none"
          style={{ fontSize: '6rem', color: RATING_COLORS[idx], textShadow: `0 0 30px ${RATING_COLORS[idx]}80` }}
        >
          {RATINGS[idx]}
        </div>

        <div className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>{RATING_MSGS[idx]}</div>

        <div className="text-center">
          <div className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: 'var(--muted)' }}>Score</div>
          <div className="score-big font-display text-6xl font-black" style={{ color: '#fff', textShadow: `0 0 20px ${cfg.color}60` }}>
            {score}
          </div>
        </div>

        {/* Coins earned */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255,214,0,0.1)',
            border: '1px solid rgba(255,214,0,0.3)',
            borderRadius: 10,
            padding: '5px 14px',
            fontSize: 12,
            fontWeight: 700,
            color: '#FFD600',
          }}
        >
          🪙 +{coinsEarned} pièces gagnées
        </div>

        {/* Stats row */}
        <div
          className="flex gap-6 px-5 py-3 rounded-2xl"
          style={{ background: 'var(--s2)' }}
        >
          <div className="text-center">
            <div className="font-display text-lg font-black" style={{ color: cfg.color }}>{stats.bestScore}</div>
            <div className="text-xs" style={{ color: 'var(--muted)' }}>Meilleur</div>
          </div>
          <div className="text-center">
            <div className="font-display text-lg font-black" style={{ color: cfg.color }}>{stats.gamesPlayed}</div>
            <div className="text-xs" style={{ color: 'var(--muted)' }}>Parties</div>
          </div>
          <div className="text-center">
            <div className="font-display text-lg font-black" style={{ color: cfg.color }}>
              {stats.gamesPlayed > 0 ? Math.round(stats.totalScore / stats.gamesPlayed) : 0}
            </div>
            <div className="text-xs" style={{ color: 'var(--muted)' }}>Moyenne</div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="relative z-10 w-full space-y-2.5">
        {/* Power-up upsell */}
        {!monState.activePowerup && (
          <button
            onPointerDown={() => setShowShop(true)}
            style={{
              width: '100%',
              padding: '11px 16px',
              borderRadius: 14,
              background: 'rgba(168,85,247,0.1)',
              border: '1.5px solid rgba(168,85,247,0.4)',
              color: '#A855F7',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            ⚡ Activer un power-up — 🪙 {monState.coins}
          </button>
        )}

        <button
          onPointerDown={onPlayAgain}
          className="w-full py-4 rounded-2xl font-display text-sm font-bold tracking-widest"
          style={{ background: cfg.color, color: '#000', boxShadow: `0 0 20px ${cfg.color}50` }}
        >
          REJOUER
        </button>

        <button
          onPointerDown={onMenu}
          className="w-full py-4 rounded-2xl font-display text-sm font-bold tracking-widest"
          style={{ background: 'var(--s2)', color: 'var(--text)', border: '1.5px solid rgba(255,255,255,0.08)' }}
        >
          MENU PRINCIPAL
        </button>

        {!monState.adsRemoved && (
          <button
            onPointerDown={() => setShowShop(true)}
            className="w-full py-2 text-xs font-semibold"
            style={{ color: 'var(--muted)' }}
          >
            🚫 Enlever les pubs — 2,99€
          </button>
        )}
      </div>

      {showShop && (
        <Shop
          monState={monState}
          onStateChange={onMonStateChange}
          onClose={() => setShowShop(false)}
        />
      )}
    </div>
  )
}
