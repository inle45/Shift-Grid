import { useState, useEffect, useRef } from 'react'
import type { GameProps } from '../types'
import { sfx } from '../sfx'

const COLOR      = '#FF0066'
const SPAWN_MS   = 750   // was 900
const LIFETIME   = 1400  // was 2000 — disappears much faster
const MAX        = 4

interface PulseCircle { id: number; x: number; y: number; size: number; born: number }

export default function PulseCollector({ isActive, onScore }: GameProps) {
  const [circles, setCircles] = useState<PulseCircle[]>([])
  const [, tick] = useState(0)
  const nextId      = useRef(0)
  const circlesRef  = useRef<PulseCircle[]>([])
  const timeouts    = useRef<number[]>([])
  const rafRef      = useRef(0)

  useEffect(() => { circlesRef.current = circles }, [circles])

  // Render loop for lifetime indicator
  useEffect(() => {
    if (!isActive) return
    const loop = () => { tick(n => n + 1); rafRef.current = requestAnimationFrame(loop) }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [isActive])

  useEffect(() => {
    if (!isActive) return
    const spawn = () => {
      if (circlesRef.current.length >= MAX) return
      const id   = nextId.current++
      const size = 56 + Math.random() * 28
      const c: PulseCircle = { id, x: Math.random() * 76 + 8, y: Math.random() * 66 + 10, size, born: performance.now() }
      setCircles(prev => [...prev, c])
      const t = window.setTimeout(() => setCircles(prev => prev.filter(c => c.id !== id)), LIFETIME)
      timeouts.current.push(t)
    }
    const interval = setInterval(spawn, SPAWN_MS)
    return () => { clearInterval(interval); timeouts.current.forEach(clearTimeout); timeouts.current = [] }
  }, [isActive])

  useEffect(() => () => { cancelAnimationFrame(rafRef.current); timeouts.current.forEach(clearTimeout) }, [])

  const handleTap = (id: number) => {
    setCircles(prev => prev.filter(c => c.id !== id))
    sfx.tap()
    onScore(1)
  }

  const now = performance.now()

  return (
    <div style={{ position: 'absolute', inset: 0, touchAction: 'none' }}>
      {circles.length === 0 && isActive && (
        <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold" style={{ color: 'var(--muted)', pointerEvents: 'none' }}>
          Les cercles arrivent…
        </div>
      )}
      {circles.map(c => {
        const age   = Math.min(1, (now - c.born) / LIFETIME)
        const bw    = Math.max(2, 6 - age * 5)
        const color = age > 0.55 ? '#FF3300' : COLOR
        return (
          <button
            key={c.id}
            className="pulse-circle pulsing"
            style={{
              left: `${c.x}%`, top: `${c.y}%`,
              width: c.size, height: c.size,
              border: `${bw}px solid ${color}`,
              color,
              opacity: 1 - age * 0.25,
              outline: `2px solid ${color}25`,
              outlineOffset: `${(1 - age) * 14}px`,
            }}
            onPointerDown={e => { e.preventDefault(); handleTap(c.id) }}
          >
            <div style={{ width: c.size * 0.32, height: c.size * 0.32, borderRadius: '50%', background: color, opacity: 0.28 }} />
          </button>
        )
      })}
    </div>
  )
}
