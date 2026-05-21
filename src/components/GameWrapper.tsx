import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react'
import type { GameId } from '../types'
import { GAME_CONFIGS } from '../types'

const TapRush = lazy(() => import('../games/TapRush'))
const SwipeChain = lazy(() => import('../games/SwipeChain'))
const Clicker = lazy(() => import('../games/Clicker'))
const PulseCollector = lazy(() => import('../games/PulseCollector'))
const ComboBlitz = lazy(() => import('../games/ComboBlitz'))

const GAME_COMPONENTS = {
  'tap-rush': TapRush,
  'swipe-chain': SwipeChain,
  'clicker': Clicker,
  'pulse-collector': PulseCollector,
  'combo-blitz': ComboBlitz,
}

type Phase = 'countdown' | 'playing' | 'ended'

interface Props {
  gameId: GameId
  onGameEnd: (score: number) => void
  onExit: () => void
}

export default function GameWrapper({ gameId, onGameEnd, onExit }: Props) {
  const cfg = GAME_CONFIGS[gameId]
  const [phase, setPhase] = useState<Phase>('countdown')
  const [countdown, setCountdown] = useState(3)
  const [timeLeft, setTimeLeft] = useState(cfg.duration)
  const [score, setScore] = useState(0)
  const [scoreKey, setScoreKey] = useState(0)

  const scoreRef = useRef(0)

  const handleScore = useCallback((delta: number) => {
    scoreRef.current += delta
    setScore(scoreRef.current)
    setScoreKey(k => k + 1)
  }, [])

  // Countdown 3→2→1→GO
  useEffect(() => {
    if (phase !== 'countdown') return
    if (countdown <= 0) {
      setPhase('playing')
      return
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, countdown])

  // Game timer
  useEffect(() => {
    if (phase !== 'playing') return
    if (timeLeft <= 0) {
      setPhase('ended')
      const t = setTimeout(() => onGameEnd(scoreRef.current), 700)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, timeLeft, onGameEnd])

  const GameComponent = GAME_COMPONENTS[gameId]
  const pct = (timeLeft / cfg.duration) * 100
  const isActive = phase === 'playing'

  // Timer color: green → yellow → red
  const timerColor = pct > 50 ? cfg.color : pct > 25 ? '#FFD600' : '#FF0066'

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ touchAction: 'none' }}>
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 gap-3" style={{ flexShrink: 0 }}>
        <button
          onPointerDown={onExit}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-lg font-bold"
          style={{ background: 'var(--s2)', color: 'var(--muted)' }}
        >
          ✕
        </button>

        <span
          className="font-display text-sm font-bold tracking-widest"
          style={{ color: cfg.color }}
        >
          {cfg.name}
        </span>

        {/* Score */}
        <div className="flex items-center gap-1">
          <span
            key={scoreKey}
            className="font-display text-2xl font-black score-animated"
            style={{ color: cfg.color, minWidth: '2.5ch', textAlign: 'right' }}
          >
            {score}
          </span>
        </div>
      </div>

      {/* ── Timer bar ── */}
      <div className="px-4 pb-1" style={{ flexShrink: 0 }}>
        <div className="rounded-full overflow-hidden" style={{ height: 5, background: 'var(--s2)' }}>
          <div
            className="timer-bar h-full rounded-full"
            style={{ width: `${pct}%`, background: timerColor }}
          />
        </div>
        <div className="text-right text-xs font-bold mt-0.5" style={{ color: timerColor }}>
          {timeLeft}s
        </div>
      </div>

      {/* ── Game area ── */}
      <div className="game-area" style={{ position: 'relative' }}>
        <Suspense fallback={null}>
          <GameComponent isActive={isActive} onScore={handleScore} />
        </Suspense>

        {/* Countdown overlay */}
        {phase === 'countdown' && (
          <div className="countdown-overlay">
            <div key={countdown} className="countdown-number" style={{ color: cfg.color }}>
              {countdown > 0 ? countdown : 'GO!'}
            </div>
          </div>
        )}

        {/* Time's up overlay */}
        {phase === 'ended' && (
          <div className="countdown-overlay">
            <div className="countdown-number text-4xl" style={{ color: cfg.color }}>
              FINI !
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom hint ── */}
      {phase === 'playing' && (
        <div className="pb-3 text-center text-xs" style={{ color: 'var(--muted)', flexShrink: 0 }}>
          {cfg.tagline}
        </div>
      )}
    </div>
  )
}
