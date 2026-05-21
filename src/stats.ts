import type { GameId } from './types'

export interface GameStats {
  bestScore: number
  gamesPlayed: number
  totalScore: number
}

const KEY = 'rush_stats_v1'

function loadAll(): Partial<Record<GameId, GameStats>> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}')
  } catch {
    return {}
  }
}

export function getStats(gameId: GameId): GameStats {
  return loadAll()[gameId] ?? { bestScore: 0, gamesPlayed: 0, totalScore: 0 }
}

export function getAllStats(): Partial<Record<GameId, GameStats>> {
  return loadAll()
}

/** Persists the game result and returns whether it's a new record. */
export function recordGame(gameId: GameId, score: number): { stats: GameStats; isRecord: boolean } {
  const all = loadAll()
  const prev = all[gameId] ?? { bestScore: 0, gamesPlayed: 0, totalScore: 0 }
  const isRecord = score > prev.bestScore
  const stats: GameStats = {
    bestScore: Math.max(prev.bestScore, score),
    gamesPlayed: prev.gamesPlayed + 1,
    totalScore: prev.totalScore + score,
  }
  all[gameId] = stats
  try {
    localStorage.setItem(KEY, JSON.stringify(all))
  } catch { /* storage full */ }
  return { stats, isRecord }
}
