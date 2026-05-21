import { useState, useEffect, useRef } from 'react'
import type { GameProps } from '../types'

const COLOR = '#FF0066'
const SPAWN_MS = 900
const LIFETIME_MS = 2000
const MAX_CIRCLES = 4

interface PulseCircle {
  id: number
  x: number
  y: number
  size: number
  born: number
}

export default function PulseCollector({ isActive, onScore }: GameProps) {
  const [circles, setCircles] = useState<PulseCircle[]>([])
  const [, forceUpdate] = useState(0)
  const nextId = useRef(0)
  const circlesRef = useRef<PulseCircle[]>([])
  const timeoutsRef = useRef<number[]>([])
  const rafRef = useRef<number>(0)

  useEffect(() => {
    circlesRef.current = circles
  }, [circles])

  // Animation frame to update lifetime bars
  useEffect(() => {
    if (!isActive) return
    const tick = () => {
      forceUpdate(n => n + 1)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [isActive])

  useEffect(() => {
    if (!isActive) return

    const spawn = () => {
      if (circlesRef.current.length >= MAX_CIRCLES) return
      const id = nextId.current++
      const size = 60 + Math.random() * 30 // 60–90px
      const circle: PulseCircle = {
        id,
        x: Math.random() * 76 + 8,
        y: Math.random() * 66 + 10,
        size,
        born: performance.now(),
      }
      setCircles(prev => [...prev, circle])

      const t = window.setTimeout(() => {
        setCircles(prev => prev.filter(c => c.id !== id))
      }, LIFETIME_MS)
      timeoutsRef.current.push(t)
    }

    const interval = setInterval(spawn, SPAWN_MS)
    return () => {
      clearInterval(interval)
      timeoutsRef.current.forEach(clearTimeout)
      timeoutsRef.current = []
    }
  }, [isActive])

  useEffect(() => () => {
    cancelAnimationFrame(rafRef.current)
    timeoutsRef.current.forEach(clearTimeout)
  }, [])

  const handleTap = (id: number) => {
    setCircles(prev => prev.filter(c => c.id !== id))
    onScore(1)
  }

  const now = performance.now()

  return (
    <div style={{ position: 'absolute', inset: 0, touchAction: 'none' }}>
      {circles.length === 0 && isActive && (
        <div
          className="absolute inset-0 flex items-center justify-center text-sm font-semibold"
          style={{ color: 'var(--muted)', pointerEvents: 'none' }}
        >
          Les cercles arrivent…
        </div>
      )}

      {circles.map(c => {
        const age = Math.min(1, (now - c.born) / LIFETIME_MS)
        // Fades from COLOR to red as it ages
        const opacity = 1 - age * 0.3
        const borderWidth = Math.max(2, 6 - age * 4)
        const currentColor = age > 0.6 ? '#FF3300' : COLOR

        return (
          <button
            key={c.id}
            className="pulse-circle pulsing"
            style={{
              left: `${c.x}%`,
              top: `${c.y}%`,
              width: c.size,
              height: c.size,
              border: `${borderWidth}px solid ${currentColor}`,
              color: currentColor,
              opacity,
              // Lifetime ring via outline
              outline: `2px solid ${currentColor}30`,
              outlineOffset: `${(1 - age) * 12}px`,
            }}
            onPointerDown={(e) => {
              e.preventDefault()
              handleTap(c.id)
            }}
          >
            <div
              style={{
                width: c.size * 0.35,
                height: c.size * 0.35,
                borderRadius: '50%',
                background: currentColor,
                opacity: 0.3,
              }}
            />
          </button>
        )
      })}
    </div>
  )
}
