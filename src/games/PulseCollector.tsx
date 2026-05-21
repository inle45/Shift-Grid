/**
 * PULSE — jeu de timing pur.
 * Un cercle s'agrandit en boucle depuis le centre.
 * Tape exactement quand il est dans la zone cible.
 * PERFECT (+2) si tu tapes au centre de la zone, GOOD (+1) si tu frôles.
 * MISS (0) si tu rates complètement.
 * La vitesse augmente tous les 5 taps réussis.
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import type { GameProps } from '../types'
import { sfx } from '../sfx'

const COLOR = '#FF0066'

// Zone cible : entre 52% et 80% du rayon max → ça laisse une fenêtre visible
const ZONE_MIN = 0.52
const ZONE_MAX = 0.80
const PERFECT_MIN = 0.60
const PERFECT_MAX = 0.72

const BASE_PERIOD = 1700  // ms par cycle complet au départ
const MIN_PERIOD  = 650   // limite basse
const SPEED_STEP  = 130   // ms retirés tous les 5 bons taps

type HitResult = 'perfect' | 'good' | 'miss' | null

export default function PulseCollector({ isActive, onScore }: GameProps) {
  const [progress, setProgress]   = useState(0)       // 0 → 1 (expansion)
  const [hitResult, setHitResult] = useState<HitResult>(null)
  const [, setPeriod]       = useState(BASE_PERIOD)
  const [goodTaps, setGoodTaps]   = useState(0)

  const progressRef  = useRef(0)
  const periodRef    = useRef(BASE_PERIOD)
  const startRef     = useRef(0)
  const rafRef       = useRef(0)
  const hitTimerRef  = useRef(0)
  const goodTapsRef  = useRef(0)

  // Boucle d'animation
  useEffect(() => {
    if (!isActive) return
    startRef.current = performance.now()

    const loop = (now: number) => {
      const elapsed = (now - startRef.current) % periodRef.current
      const p = elapsed / periodRef.current
      progressRef.current = p
      setProgress(p)
      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [isActive])

  useEffect(() => () => {
    cancelAnimationFrame(rafRef.current)
    clearTimeout(hitTimerRef.current)
  }, [])

  const handleTap = useCallback(() => {
    if (!isActive) return
    const p = progressRef.current

    let result: HitResult
    if (p >= PERFECT_MIN && p <= PERFECT_MAX) {
      result = 'perfect'
      onScore(2)
      sfx.multiplier()
    } else if (p >= ZONE_MIN && p <= ZONE_MAX) {
      result = 'good'
      onScore(1)
      sfx.correct()
    } else {
      result = 'miss'
      sfx.miss()
    }

    setHitResult(result)
    clearTimeout(hitTimerRef.current)
    hitTimerRef.current = window.setTimeout(() => setHitResult(null), 380)

    if (result !== 'miss') {
      const newGood = goodTapsRef.current + 1
      goodTapsRef.current = newGood
      setGoodTaps(newGood)

      // Accélération tous les 5 bons taps
      if (newGood % 5 === 0) {
        const newPeriod = Math.max(MIN_PERIOD, periodRef.current - SPEED_STEP)
        periodRef.current = newPeriod
        setPeriod(newPeriod)
        startRef.current = performance.now() // reset pour éviter le saut visuel
      }
    }
  }, [isActive, onScore])

  // ── Dimensions ──
  const SIZE = 260            // diamètre du cercle externe (px)
  const R    = SIZE / 2

  const zoneOuterPx  = R * ZONE_MAX
  const zoneInnerPx  = R * ZONE_MIN
  const ringWidth    = zoneOuterPx - zoneInnerPx

  const pulseR    = R * 0.12 + R * 0.88 * progress // rayon courant, de 12% à 100%
  const inZone    = progress >= ZONE_MIN && progress <= ZONE_MAX
  const inPerfect = progress >= PERFECT_MIN && progress <= PERFECT_MAX

  const speedLabel = periodRef.current >= 1500 ? '×1'
    : periodRef.current >= 1200 ? '×1.5'
    : periodRef.current >= 950  ? '×2'
    : periodRef.current >= 750  ? '×2.5'
    : '×3'

  const hitColor = hitResult === 'perfect' ? '#FFD600'
    : hitResult === 'good' ? COLOR
    : '#FF3300'

  return (
    <div
      style={{ position: 'absolute', inset: 0, touchAction: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}
      onPointerDown={e => { e.preventDefault(); handleTap() }}
    >
      {/* Vitesse */}
      <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 12, fontWeight: 700, color: 'var(--muted)', letterSpacing: 2 }}>
        VITESSE {speedLabel} &nbsp;·&nbsp; {goodTaps} bon{goodTaps !== 1 ? 's' : ''}
      </div>

      {/* Arène */}
      <div style={{ position: 'relative', width: SIZE, height: SIZE }}>

        {/* Cercle limite externe */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: `2px solid ${COLOR}18`,
        }} />

        {/* Zone cible (anneau coloré) */}
        <div style={{
          position: 'absolute',
          left: '50%', top: '50%',
          width:  zoneOuterPx * 2,
          height: zoneOuterPx * 2,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          border: `${ringWidth}px solid ${inPerfect ? `${COLOR}55` : inZone ? `${COLOR}35` : `${COLOR}18`}`,
          boxSizing: 'border-box',
          transition: 'border-color 0.05s',
          pointerEvents: 'none',
        }} />

        {/* Label ZONE */}
        <div style={{
          position: 'absolute',
          top: R - zoneOuterPx - 20,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: 2,
          color: `${COLOR}60`,
          pointerEvents: 'none',
          fontFamily: 'Orbitron, monospace',
        }}>
          ZONE
        </div>

        {/* Cercle pulsant */}
        <div style={{
          position: 'absolute',
          left: '50%', top: '50%',
          width:  pulseR * 2,
          height: pulseR * 2,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${COLOR}50 0%, ${COLOR}15 60%, transparent 100%)`,
          border: `3px solid ${inZone ? COLOR : `${COLOR}80`}`,
          boxShadow: inPerfect
            ? `0 0 30px ${COLOR}, 0 0 60px ${COLOR}80`
            : inZone
            ? `0 0 20px ${COLOR}80`
            : `0 0 10px ${COLOR}40`,
          transition: 'box-shadow 0.05s',
          pointerEvents: 'none',
        }} />

        {/* Feedback texte centré */}
        {hitResult && (
          <div style={{
            position: 'absolute',
            left: '50%', top: '50%',
            transform: 'translate(-50%, -50%)',
            fontFamily: 'Orbitron, monospace',
            fontSize: hitResult === 'perfect' ? '1.3rem' : '1rem',
            fontWeight: 900,
            color: hitColor,
            textShadow: `0 0 20px ${hitColor}`,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            zIndex: 2,
          }}>
            {hitResult === 'perfect' ? '✦ PERFECT' : hitResult === 'good' ? '✓ GOOD' : '✗ MISS'}
          </div>
        )}
      </div>

      {/* Légende */}
      <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--muted)', lineHeight: 1.7 }}>
        <span style={{ color: `${COLOR}90`, fontWeight: 700 }}>PERFECT +2</span> · zone centrale
        <br />
        <span style={{ color: `${COLOR}60` }}>GOOD +1</span> · dans la zone &nbsp;·&nbsp; <span style={{ color: '#FF3300' }}>MISS 0</span>
      </div>
    </div>
  )
}
