import { useState, useRef, useCallback } from 'react'
import type { GameProps } from '../types'

const COLOR = '#00FF87'

type TileState = 'idle' | 'correct' | 'wrong'

interface Tile {
  value: number
  state: TileState
}

function shuffle(arr: number[]): number[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function makeTiles(): Tile[] {
  return shuffle([1, 2, 3, 4]).map(v => ({ value: v, state: 'idle' }))
}

export default function SwipeChain({ isActive, onScore }: GameProps) {
  const [tiles, setTiles] = useState<Tile[]>(makeTiles)
  const [currentTarget, setCurrentTarget] = useState(1)
  const [totalSets, setTotalSets] = useState(0)
  const targetRef = useRef(1)
  const stateTimers = useRef<Record<number, number>>({})

  const handleTileTap = useCallback((idx: number) => {
    if (!isActive) return
    const tile = tiles[idx]
    const expected = targetRef.current

    if (tile.value === expected) {
      // Correct
      onScore(1)
      const nextTarget = expected + 1

      setTiles(prev => {
        const next = [...prev]
        next[idx] = { ...next[idx], state: 'correct' }
        return next
      })

      // Clear animation after 200ms
      const t = window.setTimeout(() => {
        if (nextTarget > 4) {
          // Sequence complete — reshuffle
          targetRef.current = 1
          setCurrentTarget(1)
          setTotalSets(s => s + 1)
          setTiles(makeTiles())
        } else {
          targetRef.current = nextTarget
          setCurrentTarget(nextTarget)
          setTiles(prev => {
            const next = [...prev]
            next[idx] = { ...next[idx], state: 'idle' }
            return next
          })
        }
      }, 200)
      stateTimers.current[idx] = t
    } else {
      // Wrong
      setTiles(prev => {
        const next = [...prev]
        next[idx] = { ...next[idx], state: 'wrong' }
        return next
      })
      const t = window.setTimeout(() => {
        setTiles(prev => {
          const next = [...prev]
          next[idx] = { ...next[idx], state: 'idle' }
          return next
        })
      }, 300)
      stateTimers.current[idx] = t
    }
  }, [isActive, tiles, onScore])

  return (
    <div
      style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}
    >
      {/* Target indicator */}
      <div className="text-center" style={{ marginBottom: 8 }}>
        <div className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--muted)' }}>
          Prochain
        </div>
        <div
          className="font-display text-5xl font-black"
          style={{ color: COLOR, textShadow: `0 0 20px ${COLOR}80` }}
        >
          {currentTarget}
        </div>
      </div>

      {/* 2×2 grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          width: '100%',
          maxWidth: 280,
        }}
      >
        {tiles.map((tile, idx) => {
          const isTarget = tile.value === currentTarget
          const bgColor =
            tile.state === 'correct' ? `${COLOR}30` :
            tile.state === 'wrong' ? 'rgba(255,0,102,0.2)' :
            'var(--s2)'
          const borderColor =
            tile.state === 'correct' ? COLOR :
            tile.state === 'wrong' ? '#FF0066' :
            isTarget ? `${COLOR}80` : 'transparent'

          return (
            <button
              key={idx}
              className={`chain-tile ${tile.state === 'correct' ? 'tile-ok' : ''} ${tile.state === 'wrong' ? 'tile-err' : ''}`}
              style={{
                height: 120,
                background: bgColor,
                borderColor,
                color: tile.state === 'wrong' ? '#FF0066' : COLOR,
                boxShadow: isTarget && tile.state === 'idle' ? `0 0 12px ${COLOR}40` : 'none',
              }}
              onPointerDown={(e) => {
                e.preventDefault()
                handleTileTap(idx)
              }}
            >
              {tile.value}
            </button>
          )
        })}
      </div>

      {/* Sets done */}
      {totalSets > 0 && (
        <div className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>
          {totalSets} séquence{totalSets > 1 ? 's' : ''} complète{totalSets > 1 ? 's' : ''} ✓
        </div>
      )}
    </div>
  )
}
