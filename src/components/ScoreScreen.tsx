import type { GameId } from '../types'
import { GAME_CONFIGS } from '../types'

interface Props {
  score: number
  gameId: GameId
  onPlayAgain: () => void
  onMenu: () => void
}

const THRESHOLDS: Record<GameId, [number, number, number, number]> = {
  'tap-rush':       [8,  15, 22, 30],
  'swipe-chain':    [4,  8,  13, 18],
  'clicker':        [25, 50, 80, 120],
  'pulse-collector':[6,  12, 18, 25],
  'combo-blitz':    [12, 22, 32, 44],
}

const RATINGS = ['D', 'C', 'B', 'A', 'S']
const RATING_COLORS = ['#5A5A72', '#00D4FF', '#00FF87', '#FFD600', '#FF0066']
const RATING_MSGS = [
  'Continue à t\'entraîner !',
  'Pas mal du tout !',
  'Bien joué !',
  'Excellent !',
  'LEGENDAIRE !',
]

function getRating(score: number, gameId: GameId) {
  const t = THRESHOLDS[gameId]
  if (score >= t[3]) return 4
  if (score >= t[2]) return 3
  if (score >= t[1]) return 2
  if (score >= t[0]) return 1
  return 0
}

function Stars({ level }: { level: number }) {
  return (
    <div className="flex gap-1 justify-center mt-2">
      {[0, 1, 2, 3, 4].map(i => (
        <span
          key={i}
          className="text-lg"
          style={{ color: i <= level ? '#FFD600' : 'var(--s2)', filter: i <= level ? 'drop-shadow(0 0 6px #FFD600)' : 'none' }}
        >
          ★
        </span>
      ))}
    </div>
  )
}

export default function ScoreScreen({ score, gameId, onPlayAgain, onMenu }: Props) {
  const cfg = GAME_CONFIGS[gameId]
  const ratingIdx = getRating(score, gameId)
  const rating = RATINGS[ratingIdx]
  const ratingColor = RATING_COLORS[ratingIdx]
  const msg = RATING_MSGS[ratingIdx]

  return (
    <div className="score-screen flex flex-col h-full items-center justify-between px-6 py-8 relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="orb" style={{ width: 300, height: 300, background: `${cfg.color}10`, top: -100, left: -100 }} />
      <div className="orb" style={{ width: 200, height: 200, background: `${ratingColor}10`, bottom: -60, right: -60, animationDelay: '-5s' }} />

      {/* Top: game name */}
      <div className="relative z-10 text-center w-full">
        <div className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--muted)' }}>
          Résultat
        </div>
        <div className="font-display text-lg font-bold mt-1" style={{ color: cfg.color }}>
          {cfg.name}
        </div>
      </div>

      {/* Center: score & rating */}
      <div className="relative z-10 text-center flex-1 flex flex-col items-center justify-center gap-4">
        {/* Rating letter */}
        <div
          className="font-display text-8xl font-black leading-none"
          style={{
            color: ratingColor,
            textShadow: `0 0 30px ${ratingColor}80, 0 0 80px ${ratingColor}40`,
          }}
        >
          {rating}
        </div>

        <Stars level={ratingIdx} />

        <div className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>
          {msg}
        </div>

        {/* Score number */}
        <div className="mt-2">
          <div className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: 'var(--muted)' }}>
            Score
          </div>
          <div
            className="score-big font-display text-6xl font-black"
            style={{ color: '#fff', textShadow: `0 0 20px ${cfg.color}60` }}
          >
            {score}
          </div>
        </div>
      </div>

      {/* Bottom: buttons */}
      <div className="relative z-10 w-full space-y-3">
        {/* AdMob placeholder */}
        {/* <AdBanner position="bottom" /> */}

        <button
          onPointerDown={onPlayAgain}
          className="w-full py-4 rounded-2xl font-display text-sm font-bold tracking-widest"
          style={{
            background: cfg.color,
            color: '#000',
            boxShadow: `0 0 20px ${cfg.color}50`,
          }}
        >
          REJOUER
        </button>

        <button
          onPointerDown={onMenu}
          className="w-full py-4 rounded-2xl font-display text-sm font-bold tracking-widest"
          style={{
            background: 'var(--s2)',
            color: 'var(--text)',
            border: '1.5px solid rgba(255,255,255,0.08)',
          }}
        >
          MENU
        </button>

        {/* IAP simulé */}
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
