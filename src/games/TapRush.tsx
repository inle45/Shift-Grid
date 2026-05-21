import { useState, useEffect, useRef } from 'react'
import type { GameProps } from '../types'
import { sfx } from '../sfx'

interface Circle { id: number; x: number; y: number; size: number }

const COLOR      = '#00D4FF'
const SPAWN_MS   = 480   // was 650 — faster spawn
const LIFETIME   = 1100  // was 1500 — disappears sooner
const MAX        = 6     // was 5

export default function TapRush({ isActive, onScore }: GameProps) {
  const [circles, setCircles] = useState<Circle[]>([])
  const nextId      = useRef(0)
  const circlesRef  = useRef<Circle[]>([])
  const timeouts    = useRef<number[]>([])

  useEffect(() => { circlesRef.current = circles }, [circles])

  useEffect(() => {
    if (!isActive) return
    const spawn = () => {
      if (circlesRef.current.length >= MAX) return
      const id   = nextId.current++
      const size = 58 + Math.random() * 20 // 58–78px, some variety
      const c: Circle = {
        id,
        x: Math.random() * 76 + 8,
        y: Math.random() * 66 + 10,
        size,
      }
      setCircles(prev => [...prev, c])
      const t = window.setTimeout(() => {
        setCircles(prev => prev.filter(c => c.id !== id))
      }, LIFETIME)
      timeouts.current.push(t)
    }
    const interval = setInterval(spawn, SPAWN_MS)
    return () => { clearInterval(interval); timeouts.current.forEach(clearTimeout); timeouts.current = [] }
  }, [isActive])

  useEffect(() => () => { timeouts.current.forEach(clearTimeout) }, [])

  const handleTap = (id: number) => {
    setCircles(prev => prev.filter(c => c.id !== id))
    sfx.tap()
    onScore(1)
  }

  return (
    <div style={{ position: 'absolute', inset: 0, touchAction: 'none' }}>
      {circles.length === 0 && isActive && (
        <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold" style={{ color: 'var(--muted)', pointerEvents: 'none' }}>
          Les cercles arrivent…
        </div>
      )}
      {circles.map(c => (
        <button
          key={c.id}
          className="tap-circle"
          style={{ left: `${c.x}%`, top: `${c.y}%`, width: c.size, height: c.size, color: COLOR, boxShadow: `0 0 16px ${COLOR}60` }}
          onPointerDown={e => { e.preventDefault(); handleTap(c.id) }}
        />
      ))}
    </div>
  )
}
