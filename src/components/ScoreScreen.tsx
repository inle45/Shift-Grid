import { useEffect, useRef } from 'react'
import type { GameId } from '../types'
import { GAME_CONFIGS } from '../types'
import { recordGame } from '../stats'
import { sfx } from '../sfx'

interface Props {
  score: number
  gameId: GameId
  onPlayAgain: () => void
  onMenu: () => void
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
const RATING_MSGS  = [
  'Continue à t\'entraîner !',
  'Pas mal du tout !',
  'Bien joué !',
  'Excellent !',
  'LÉGENDAIRE !',
]

function getRatingIdx(score: number, gameId: GameId) {
  const t = THRESHOLDS[gameId]
  if (score >= t[3]) return 4
  if (score >= t[2]) return 3
  if (score >= t[1]) return 2
  if (score >= t[0]) return 1
  return 0
}

export default function ScoreScreen({ score, gameId, onPlayAgain, onMenu }: Props) {
  const cfg = GAME_CONFIGS[gameId]
  const ratingIdx = getRatingIdx(score, gameId)
  const ratingColor = RATING_COLORS[ratingIdx]
  const msg = RATING_MSGS[ratingIdx]

  const resultRef = useRef<{ stats: ReturnType<typeof recordGame>['stats']; isRecord: boolean } | null>(null)
  if (resultRef.current === null) {
    resultRef.current = recordGame(gameId, score)
  }
  const { stats, isRecord } = resultRef.current

  useEffect(() => {
    if (isRecord && score > 0) sfx.newRecord()
  }, [isRecord, score])

  return (
    <div className="score-screen flex flex-col h-full items-center justify-between px-6 py-8 relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="orb" style={{ width: 300, height: 300, background: `${cfg.color}10`, top: -100, left: -100 }} />
      <div className="orb" style={{ width: 200, height: 200, background: `${ratingColor}10`, bottom: -60, right: -60, animationDelay: '-5s' }} />

      {/* Game name */}
      <div className="relative z-10 text-center w-full">
        <div className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--muted)' }}>Résultat</div>
        <div className="font-display text-lg font-bold mt-1" style={{ color: cfg.color }}>{cfg.name}</div>
      </div>

      {/* Rating + score */}
      <div className="relative z-10 text-center flex-1 flex flex-col items-center justify-center gap-3">
        {/* New record banner */}
        {isRecord && score > 0 && (
          <div
            className="px-4 py-1 rounded-full text-xs font-bold tracking-widest"
            style={{ background: `${cfg.color}25`, color: cfg.color, border: `1px solid ${cfg.color}60` }}
          >
            🏆 NOUVEAU RECORD !
          </div>
        )}

        {/* Rating letter */}
        <div
          className="font-display font-black leading-none"
          style={{ fontSize: '6rem', color: ratingColor, textShadow: `0 0 30px ${ratingColor}80, 0 0 80px ${ratingColor}40` }}
        >
          {RATINGS[ratingIdx]}
        </div>

        <div className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>{msg}</div>

        {/* Score */}
        <div className="mt-1 text-center">
          <div className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: 'var(--muted)' }}>Score</div>
          <div className="score-big font-display text-6xl font-black" style={{ color: '#fff', textShadow: `0 0 20px ${cfg.color}60` }}>
            {score}
          </div>
        </div>

        {/* Stats row */}
        <div
          className="flex gap-6 mt-2 px-5 py-3 rounded-2xl"
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
      <div className="relative z-10 w-full space-y-3">
        {/* AdMob placeholder — décommenter pour la prod */}
        {/* <AdBanner position="bottom" /> */}

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

        {/* IAP placeholder */}
        <button
          className="w-full py-2 text-xs font-semibold"
          style={{ color: 'var(--muted)' }}
          onPointerDown={() => alert('Fonctionnalité à venir !')}
        >
          🚫 Enlever les pubs
        </button>
      </div>
    </div>
  )
}
