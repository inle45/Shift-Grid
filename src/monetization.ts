export type PowerupId = 'extra_time' | 'score_x2' | 'shield'

export interface Powerup {
  id: PowerupId
  name: string
  desc: string
  icon: string
  coinCost: number
}

export interface MonState {
  adsRemoved: boolean
  coins: number
  activePowerup: PowerupId | null
  dailyClaimedAt: number | null
}

const KEY = 'rush_mon_v1'
const DEFAULT: MonState = {
  adsRemoved: false,
  coins: 50, // cadeau de bienvenue pour encourager le premier achat
  activePowerup: null,
  dailyClaimedAt: null,
}

export function loadMon(): MonState {
  try { return { ...DEFAULT, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') } }
  catch { return { ...DEFAULT } }
}

function save(s: MonState) {
  try { localStorage.setItem(KEY, JSON.stringify(s)) } catch {}
}

export function removeAds(): MonState {
  const s = loadMon(); s.adsRemoved = true; save(s); return s
}

export function addCoins(n: number): MonState {
  const s = loadMon(); s.coins = Math.min(9999, s.coins + n); save(s); return s
}

export function spendCoins(n: number): MonState | null {
  const s = loadMon()
  if (s.coins < n) return null
  s.coins -= n; save(s); return s
}

export function setActivePowerup(id: PowerupId | null): MonState {
  const s = loadMon(); s.activePowerup = id; save(s); return s
}

export function consumePowerup(): MonState {
  return setActivePowerup(null)
}

export function canClaimDaily(): boolean {
  const s = loadMon()
  if (!s.dailyClaimedAt) return true
  return Date.now() - s.dailyClaimedAt > 24 * 60 * 60 * 1000
}

export function claimDaily(): { state: MonState; reward: number } {
  const s = loadMon()
  const reward = 25
  s.coins = Math.min(9999, s.coins + reward)
  s.dailyClaimedAt = Date.now()
  save(s)
  return { state: s, reward }
}

export const POWERUPS: Powerup[] = [
  { id: 'extra_time', name: '+5 secondes', desc: 'Ajoute 5s au prochain jeu',  icon: '⏱', coinCost: 15 },
  { id: 'score_x2',   name: 'Score ×2',    desc: 'Double tous les points',      icon: '⚡', coinCost: 25 },
  { id: 'shield',     name: 'Bouclier',    desc: 'Bloque les -1 pénalités',     icon: '🛡', coinCost: 20 },
]

export const IAP_PACKS = [
  { id: 'remove_ads', label: 'Sans Publicité', sub: 'Définitivement', price: '2,99€', icon: '🚫', type: 'perm'  as const },
  { id: 'coins_sm',   label: '100 pièces',     sub: '',               price: '0,99€', icon: '🪙', type: 'coins' as const, coins: 100  },
  { id: 'coins_md',   label: '500 pièces',     sub: '+50 BONUS',      price: '3,99€', icon: '💰', type: 'coins' as const, coins: 550  },
  { id: 'coins_lg',   label: '1 800 pièces',   sub: '+300 BONUS',     price: '7,99€', icon: '💎', type: 'coins' as const, coins: 1800 },
]
