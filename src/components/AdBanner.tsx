/**
 * AdBanner — placeholder AdMob 320×50
 * En prod: remplacer le contenu par <AdMob.Banner adUnitId="ca-app-pub-xxx" />
 */
interface Props {
  visible: boolean
}

const ADS = [
  { bg: '#1a1a2e', accent: '#00D4FF', title: 'RUSH PRO', cta: 'SANS PUB →', sub: 'Jouez sans interruption' },
  { bg: '#1a0a2e', accent: '#A855F7', title: '⚡ POWER-UP', cta: 'ACHETER →', sub: '×2 score disponible' },
  { bg: '#0a1a1a', accent: '#00FF87', title: '🪙 PIÈCES', cta: 'RECHARGER →', sub: '50 pièces offertes !' },
]

// Rotate fake ad based on time (changes every 30s)
const getAd = () => ADS[Math.floor(Date.now() / 30000) % ADS.length]

export default function AdBanner({ visible }: Props) {
  if (!visible) return null
  const ad = getAd()

  return (
    <div
      style={{
        height: 52,
        background: ad.bg,
        borderTop: `1px solid ${ad.accent}30`,
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        gap: 10,
        flexShrink: 0,
        position: 'relative',
      }}
    >
      {/* AdMob label */}
      <span
        style={{
          position: 'absolute',
          top: 3,
          right: 6,
          fontSize: 9,
          color: 'rgba(255,255,255,0.3)',
          fontFamily: 'monospace',
          letterSpacing: 1,
        }}
      >
        PUB
      </span>

      {/* Icon */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          background: `${ad.accent}20`,
          border: `1px solid ${ad.accent}50`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
          flexShrink: 0,
        }}
      >
        🎮
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>{ad.title}</div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 1 }}>{ad.sub}</div>
      </div>

      {/* CTA */}
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: ad.accent,
          border: `1px solid ${ad.accent}`,
          borderRadius: 6,
          padding: '4px 8px',
          flexShrink: 0,
          fontFamily: 'monospace',
        }}
      >
        {ad.cta}
      </div>
    </div>
  )
}
