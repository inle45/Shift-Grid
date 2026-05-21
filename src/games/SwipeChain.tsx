import { useState, useRef, useCallback } from 'react'
import type { GameProps } from '../types'
import { sfx } from '../sfx'

const COLOR = '#00FF87'

type TileAnim = 'idle' | 'correct' | 'wrong'
interface Tile { value: number; anim: TileAnim }

function shuffle(arr: number[]) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
const makeTiles = (): Tile[] => shuffle([1, 2, 3, 4]).map(v => ({ value: v, anim: 'idle' }))

export default function SwipeChain({ isActive, onScore }: GameProps) {
  const [tiles, setTiles]       = useState<Tile[]>(makeTiles)
  const [currentTarget, setCurrentTarget] = useState(1)
  const [completedSets, setCompletedSets] = useState(0)
  const targetRef = useRef(1)

  const setAnim = (idx: number, anim: TileAnim, delay: number) => {
    setTiles(prev => { const n = [...prev]; n[idx] = { ...n[idx], anim }; return n })
    window.setTimeout(() => {
      setTiles(prev => { const n = [...prev]; n[idx] = { ...n[idx], anim: 'idle' }; return n })
    }, delay)
  }

  const handleTap = useCallback((idx: number) => {
    if (!isActive) return
    const tile = tiles[idx]
    if (tile.value === targetRef.current) {
      sfx.correct()
      onScore(1)
      setAnim(idx, 'correct', 180)
      const next = targetRef.current + 1
      if (next > 4) {
        targetRef.current = 1
        setCurrentTarget(1)
        setCompletedSets(s => s + 1)
        window.setTimeout(() => setTiles(makeTiles()), 190)
      } else {
        targetRef.current = next
        setCurrentTarget(next)
      }
    } else {
      sfx.miss()
      onScore(-1) // penalty
      setAnim(idx, 'wrong', 280)
    }
  }, [isActive, tiles, onScore])

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
      {/* Target */}
      <div className="text-center" style={{ marginBottom: 4 }}>
        <div className="text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--muted)' }}>Prochain</div>
        <div className="font-display text-5xl font-black" style={{ color: COLOR, textShadow: `0 0 20px ${COLOR}80` }}>
          {currentTarget}
        </div>
      </div>

      {/* 2×2 grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%', maxWidth: 280 }}>
        {tiles.map((tile, idx) => {
          const isTarget  = tile.value === currentTarget
          const bgColor   = tile.anim === 'correct' ? `${COLOR}35` : tile.anim === 'wrong' ? 'rgba(255,0,102,0.22)' : 'var(--s2)'
          const borderCol = tile.anim === 'correct' ? COLOR : tile.anim === 'wrong' ? '#FF0066' : isTarget ? `${COLOR}90` : 'transparent'
          return (
            <button
              key={idx}
              className={`chain-tile ${tile.anim === 'correct' ? 'tile-ok' : ''} ${tile.anim === 'wrong' ? 'tile-err' : ''}`}
              style={{ height: 115, background: bgColor, borderColor: borderCol, color: tile.anim === 'wrong' ? '#FF0066' : COLOR, boxShadow: isTarget && tile.anim === 'idle' ? `0 0 14px ${COLOR}45` : 'none' }}
              onPointerDown={e => { e.preventDefault(); handleTap(idx) }}
            >
              {tile.value}
            </button>
          )
        })}
      </div>

      {/* Penalty hint */}
      <div className="text-xs font-semibold" style={{ color: 'var(--muted)', opacity: 0.7 }}>
        Mauvais tap = −1 point
      </div>

      {completedSets > 0 && (
        <div className="text-xs font-bold" style={{ color: COLOR }}>
          {completedSets} séquence{completedSets > 1 ? 's' : ''} ✓
        </div>
      )}
    </div>
  )
}
