import { useState, useEffect, useRef } from 'react'
import type { GameProps } from '../types'

interface Circle {
  id: number
  x: number  // percent
  y: number  // percent
}

const COLOR = '#00D4FF'
const SPAWN_MS = 650
const LIFETIME_MS = 1500
const MAX_CIRCLES = 5

export default function TapRush({ isActive, onScore }: GameProps) {
  const [circles, setCircles] = useState<Circle[]>([])
  const nextId = useRef(0)
  const circlesRef = useRef<Circle[]>([])
  const timeoutsRef = useRef<number[]>([])

  // Keep ref in sync so interval can read current length
  useEffect(() => {
    circlesRef.current = circles
  }, [circles])

  useEffect(() => {
    if (!isActive) return

    const spawn = () => {
      if (circlesRef.current.length >= MAX_CIRCLES) return
      const id = nextId.current++
      const circle: Circle = {
        id,
        x: Math.random() * 76 + 8, // 8%→84%
        y: Math.random() * 66 + 10, // 10%→76%
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

  // Cleanup on unmount
  useEffect(() => () => {
    timeoutsRef.current.forEach(clearTimeout)
  }, [])

  const handleTap = (id: number) => {
    setCircles(prev => prev.filter(c => c.id !== id))
    onScore(1)
  }

  return (
    <div
      className="game-area"
      style={{ touchAction: 'none', position: 'absolute', inset: 0 }}
    >
      {/* Instruction when no circles */}
      {circles.length === 0 && isActive && (
        <div
          className="absolute inset-0 flex items-center justify-center text-sm font-semibold"
          style={{ color: 'var(--muted)', pointerEvents: 'none' }}
        >
          Les cercles arrivent…
        </div>
      )}

      {circles.map(c => (
        <button
          key={c.id}
          className="tap-circle"
          style={{
            left: `${c.x}%`,
            top: `${c.y}%`,
            color: COLOR,
            boxShadow: `0 0 16px ${COLOR}60`,
          }}
          onPointerDown={(e) => {
            e.preventDefault()
            handleTap(c.id)
          }}
        />
      ))}
    </div>
  )
}
