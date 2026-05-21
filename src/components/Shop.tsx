import { useState } from 'react'
import { POWERUPS, IAP_PACKS, spendCoins, setActivePowerup, removeAds, addCoins, canClaimDaily, claimDaily } from '../monetization'
import type { MonState } from '../monetization'

interface Props {
  onClose: () => void
  onStateChange: (s: MonState) => void
  monState: MonState
}

export default function Shop({ onClose, onStateChange, monState }: Props) {
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2200)
  }

  const handleBuyPowerup = (coinCost: number, id: import('../monetization').PowerupId) => {
    if (monState.activePowerup) { showToast('Tu as déjà un power-up actif !'); return }
    const next = spendCoins(coinCost)
    if (!next) { showToast('Pas assez de pièces 😬'); return }
    const s = setActivePowerup(id)
    onStateChange(s)
    showToast('Power-up activé pour le prochain jeu !')
  }

  const handleIAP = (pack: typeof IAP_PACKS[0]) => {
    // En prod: déclencher StoreKit / Google Play Billing ici
    // Simulation pour la démo
    if (pack.type === 'perm') {
      const s = removeAds()
      onStateChange(s)
      showToast('Publicités supprimées — merci ! 🎉')
    } else {
      const s = addCoins(pack.coins)
      onStateChange(s)
      showToast(`+${pack.coins} pièces ajoutées !`)
    }
  }

  const handleDaily = () => {
    const { state, reward } = claimDaily()
    onStateChange(state)
    showToast(`+${reward} pièces ! Reviens demain 🎁`)
  }

  const daily = canClaimDaily()

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.92)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'absolute',
            top: 60,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#1C1C28',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 600,
            whiteSpace: 'nowrap',
            zIndex: 60,
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          }}
        >
          {toast}
        </div>
      )}

      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          flexShrink: 0,
        }}
      >
        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 16, fontWeight: 900, color: '#FFD600', letterSpacing: 3 }}>
          BOUTIQUE
        </div>

        {/* Coin balance */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              background: 'rgba(255,214,0,0.12)',
              border: '1px solid rgba(255,214,0,0.4)',
              borderRadius: 10,
              padding: '5px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span style={{ fontSize: 14 }}>🪙</span>
            <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 14, fontWeight: 700, color: '#FFD600' }}>
              {monState.coins}
            </span>
          </div>
          <button
            onPointerDown={onClose}
            style={{ background: 'var(--s2)', border: 'none', color: 'var(--muted)', width: 32, height: 32, borderRadius: 8, fontSize: 16, cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 32px', scrollbarWidth: 'none' }}>

        {/* Daily reward */}
        <button
          onPointerDown={daily ? handleDaily : undefined}
          style={{
            width: '100%',
            padding: '14px 16px',
            background: daily ? 'rgba(0,255,135,0.1)' : 'var(--s2)',
            border: `1.5px solid ${daily ? '#00FF87' : 'rgba(255,255,255,0.07)'}`,
            borderRadius: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 20,
            cursor: daily ? 'pointer' : 'default',
            opacity: daily ? 1 : 0.5,
          }}
        >
          <span style={{ fontSize: 28 }}>🎁</span>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontWeight: 700, color: daily ? '#00FF87' : 'var(--text)', fontSize: 14 }}>
              Récompense journalière
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
              {daily ? '+25 pièces gratuites !' : 'Déjà réclamée — reviens demain'}
            </div>
          </div>
          {daily && (
            <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 12, fontWeight: 700, color: '#00FF87' }}>
              CLAIM
            </div>
          )}
        </button>

        {/* Power-ups */}
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: 'var(--muted)', marginBottom: 10, textTransform: 'uppercase' }}>
          Power-ups — prochain jeu
        </div>

        {/* Active powerup indicator */}
        {monState.activePowerup && (
          <div
            style={{
              background: 'rgba(168,85,247,0.12)',
              border: '1px solid rgba(168,85,247,0.4)',
              borderRadius: 10,
              padding: '8px 12px',
              fontSize: 12,
              color: '#A855F7',
              fontWeight: 600,
              marginBottom: 10,
              textAlign: 'center',
            }}
          >
            ⚡ Power-up actif : {POWERUPS.find(p => p.id === monState.activePowerup)?.name}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 24 }}>
          {POWERUPS.map(p => {
            const active = monState.activePowerup === p.id
            const canAfford = monState.coins >= p.coinCost
            return (
              <button
                key={p.id}
                onPointerDown={() => handleBuyPowerup(p.coinCost, p.id)}
                style={{
                  background: active ? 'rgba(168,85,247,0.2)' : 'var(--s2)',
                  border: `1.5px solid ${active ? '#A855F7' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 14,
                  padding: '12px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  opacity: canAfford ? 1 : 0.5,
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: 24 }}>{p.icon}</span>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', textAlign: 'center', lineHeight: 1.2 }}>
                  {p.name}
                </div>
                <div style={{ fontSize: 10, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.2 }}>
                  {p.desc}
                </div>
                <div
                  style={{
                    marginTop: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    fontSize: 12,
                    fontWeight: 700,
                    color: canAfford ? '#FFD600' : 'var(--muted)',
                  }}
                >
                  🪙 {p.coinCost}
                </div>
              </button>
            )
          })}
        </div>

        {/* IAP */}
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: 'var(--muted)', marginBottom: 10, textTransform: 'uppercase' }}>
          Achats
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {IAP_PACKS.map(pack => {
            const isPurchased = pack.type === 'perm' && monState.adsRemoved
            return (
              <button
                key={pack.id}
                onPointerDown={() => !isPurchased && handleIAP(pack)}
                style={{
                  background: isPurchased ? 'rgba(0,255,135,0.08)' : 'var(--s2)',
                  border: `1.5px solid ${isPurchased ? '#00FF87' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 14,
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  cursor: isPurchased ? 'default' : 'pointer',
                }}
              >
                <span style={{ fontSize: 26, flexShrink: 0 }}>{pack.icon}</span>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: 14 }}>{pack.label}</div>
                  {pack.sub && (
                    <div style={{ fontSize: 11, color: '#FFD600', fontWeight: 600, marginTop: 1 }}>{pack.sub}</div>
                  )}
                </div>
                <div
                  style={{
                    fontFamily: 'Orbitron, monospace',
                    fontSize: 13,
                    fontWeight: 700,
                    color: isPurchased ? '#00FF87' : '#fff',
                    flexShrink: 0,
                  }}
                >
                  {isPurchased ? '✓ ACTIF' : pack.price}
                </div>
              </button>
            )
          })}
        </div>

        <div style={{ marginTop: 16, fontSize: 10, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.6 }}>
          Les achats sont simulés pour la démo.<br />
          En prod: intégrer Google Play Billing / StoreKit.
        </div>
      </div>
    </div>
  )
}
