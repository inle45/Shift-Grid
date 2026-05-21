import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react'
import type { GameId } from '../types'
import type { PowerupId } from '../monetization'
import { GAME_CONFIGS } from '../types'
import { sfx } from '../sfx'
import { POWERUPS } from '../monetization'

const TapRush        = lazy(() => import('../games/TapRush'))
const SwipeChain     = lazy(() => import('../games/SwipeChain'))
const Clicker        = lazy(() => import('../games/Clicker'))
const PulseCollector = lazy(() => import('../games/PulseCollector'))
const ComboBlitz     = lazy(() => import('../games/ComboBlitz'))

const GAME_COMPONENTS = {
  'tap-rush':        TapRush,
  'swipe-chain':     SwipeChain,
  'clicker':         Clicker,
  'pulse-collector': PulseCollector,
  'combo-blitz':     ComboBlitz,
}

type Phase = 'countdown' | 'playing' | 'ended'

interface Props {
  gameId: GameId
  onGameEnd: (score: number) => void
  onExit: () => void
  activePowerup: PowerupId | null
}

export default function GameWrapper({ gameId, onGameEnd, onExit, activePowerup }: Props) {
  const cfg = GAME_CONFIGS[gameId]

  // Power-up effects on duration
  const extraTime   = activePowerup === 'extra_time' ? 5 : 0
  const scoreMulti  = activePowerup === 'score_x2'   ? 2 : 1
  const shielded    = activePowerup === 'shield'

  const [phase, setPhase]         = useState<Phase>('countdown')
  const [countdown, setCountdown] = useState(3)
  const [timeLeft, setTimeLeft]   = useState(cfg.duration + extraTime)
  const [score, setScore]         = useState(0)
  const [scoreKey, setScoreKey]   = useState(0)

  const scoreRef   = useRef(0)
  const mountedRef = useRef(true)
  useEffect(() => () => { mountedRef.current = false }, [])

  const handleScore = useCallback((delta: number) => {
    const effective = delta < 0 ? (shielded ? 0 : delta) : delta * scoreMulti
    scoreRef.current = Math.max(0, scoreRef.current + effective)
    setScore(scoreRef.current)
    setScoreKey(k => k + 1)
  }, [shielded, scoreMulti])

  // Countdown
  useEffect(() => {
    if (phase !== 'countdown') return
    if (countdown <= 0) { sfx.go(); setPhase('playing'); return }
    sfx.countdown()
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, countdown])

  // Timer — no cleanup on the onGameEnd timeout (intentional)
  useEffect(() => {
    if (phase !== 'playing') return
    if (timeLeft <= 0) {
      setPhase('ended')
      sfx.gameEnd()
      window.setTimeout(() => {
        if (mountedRef.current) onGameEnd(scoreRef.current)
      }, 900)
      return
    }
    const t = window.setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, timeLeft, onGameEnd])

  const GameComponent = GAME_COMPONENTS[gameId]
  const totalDuration = cfg.duration + extraTime
  const pct           = (timeLeft / totalDuration) * 100
  const isActive      = phase === 'playing'
  const timerColor    = pct > 50 ? cfg.color : pct > 20 ? '#FFD600' : '#FF0066'

  const activePU = activePowerup ? POWERUPS.find(p => p.id === activePowerup) : null

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ touchAction: 'none' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 gap-3" style={{ flexShrink: 0 }}>
        <button
          onPointerDown={onExit}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-lg font-bold"
          style={{ background: 'var(--s2)', color: 'var(--muted)' }}
        >
          ✕
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <span className="font-display text-sm font-bold tracking-widest" style={{ color: cfg.color }}>
            {cfg.name}
          </span>
          {/* Active power-up indicator */}
          {activePU && (
            <span style={{ fontSize: 9, color: '#A855F7', fontWeight: 600, letterSpacing: 1 }}>
              {activePU.icon} {activePU.name.toUpperCase()}
            </span>
          )}
        </div>

        <div key={scoreKey} className="font-display text-2xl font-black score-animated" style={{ color: cfg.color, minWidth: '2.5ch', textAlign: 'right' }}>
          {score}
        </div>
      </div>

      {/* Timer */}
      <div className="px-4 pb-1" style={{ flexShrink: 0 }}>
        <div className="rounded-full overflow-hidden" style={{ height: 5, background: 'var(--s2)' }}>
          <div className="timer-bar h-full rounded-full" style={{ width: `${pct}%`, background: timerColor }} />
        </div>
        <div className="text-right text-xs font-bold mt-0.5" style={{ color: timerColor }}>{timeLeft}s</div>
      </div>

      {/* Game */}
      <div className="game-area" style={{ position: 'relative' }}>
        <Suspense fallback={null}>
          <GameComponent isActive={isActive} onScore={handleScore} />
        </Suspense>

        {phase === 'countdown' && (
          <div className="countdown-overlay">
            <div key={countdown} className="countdown-number" style={{ color: cfg.color }}>
              {countdown > 0 ? countdown : 'GO!'}
            </div>
          </div>
        )}

        {phase === 'ended' && (
          <div className="countdown-overlay">
            <div className="countdown-number" style={{ color: cfg.color, fontSize: '4rem' }}>FINI !</div>
          </div>
        )}
      </div>

      {phase === 'playing' && (
        <div className="pb-3 text-center text-xs" style={{ color: 'var(--muted)', flexShrink: 0 }}>{cfg.tagline}</div>
      )}
    </div>
  )
}
