/**
 * Interstitial — pub plein écran toutes les 3 parties
 * En prod: remplacer par AdMob.Interstitial.show()
 */
import { useState, useEffect } from 'react'

interface Props {
  onClose: () => void
}

const SKIP_AFTER = 5 // secondes avant skip autorisé

export default function Interstitial({ onClose }: Props) {
  const [remaining, setRemaining] = useState(SKIP_AFTER)

  useEffect(() => {
    if (remaining <= 0) return
    const t = setTimeout(() => setRemaining(r => r - 1), 1000)
    return () => clearTimeout(t)
  }, [remaining])

  const canSkip = remaining <= 0

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.96)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      {/* Skip / countdown */}
      <div style={{ position: 'absolute', top: 16, right: 16 }}>
        {canSkip ? (
          <button
            onPointerDown={onClose}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff',
              borderRadius: 8,
              padding: '6px 14px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            FERMER ✕
          </button>
        ) : (
          <div
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'rgba(255,255,255,0.6)',
              borderRadius: 8,
              padding: '6px 14px',
              fontSize: 13,
              fontWeight: 700,
              minWidth: 80,
              textAlign: 'center',
            }}
          >
            {remaining}s
          </div>
        )}
      </div>

      {/* Label pub */}
      <div style={{ position: 'absolute', top: 16, left: 16, fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: 2 }}>
        PUBLICITÉ
      </div>

      {/* Fake ad card (300×250 IAB standard) */}
      <div
        style={{
          width: 300,
          height: 250,
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          padding: 24,
        }}
      >
        <div style={{ fontSize: 48 }}>🎮</div>
        <div
          style={{
            fontFamily: 'Orbitron, monospace',
            fontSize: 22,
            fontWeight: 900,
            color: '#fff',
            letterSpacing: 4,
            textShadow: '0 0 20px rgba(0,212,255,0.6)',
          }}
        >
          RUSH PRO
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
          Jouez sans aucune publicité
        </div>
        <div
          style={{
            background: '#00D4FF',
            color: '#000',
            fontWeight: 700,
            fontSize: 13,
            padding: '10px 24px',
            borderRadius: 10,
            marginTop: 4,
          }}
        >
          OBTENIR — 2,99€
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginTop: 20, width: 300, height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
        <div
          style={{
            height: '100%',
            background: '#00D4FF',
            borderRadius: 2,
            width: `${((SKIP_AFTER - remaining) / SKIP_AFTER) * 100}%`,
            transition: 'width 1s linear',
          }}
        />
      </div>
      <div style={{ marginTop: 6, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
        {canSkip ? 'Vous pouvez fermer cette annonce' : `Fermeture dans ${remaining} seconde${remaining > 1 ? 's' : ''}…`}
      </div>
    </div>
  )
}
