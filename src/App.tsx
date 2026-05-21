import { useState, useCallback } from 'react'
import type { GameId } from './types'
import type { MonState } from './monetization'
import { loadMon, addCoins, consumePowerup } from './monetization'
import MainMenu from './components/MainMenu'
import GameWrapper from './components/GameWrapper'
import ScoreScreen from './components/ScoreScreen'
import Interstitial from './components/Interstitial'

type View = 'menu' | 'playing' | 'score'

const INTERSTITIAL_EVERY = 3 // affiche une pub toutes les N parties

export default function App() {
  const [view, setView]               = useState<View>('menu')
  const [selectedGame, setSelectedGame] = useState<GameId | null>(null)
  const [lastScore, setLastScore]     = useState(0)
  const [monState, setMonState]       = useState<MonState>(loadMon)
  const [gamesPlayed, setGamesPlayed] = useState(0)
  const [showInterstitial, setShowInterstitial] = useState(false)

  const handleSelectGame = useCallback((id: GameId) => {
    setSelectedGame(id)
    setView('playing')
  }, [])

  const handleGameEnd = useCallback((score: number) => {
    const newCount = gamesPlayed + 1
    setGamesPlayed(newCount)

    // Give coins per game
    const earned = Math.max(3, Math.floor(score / 3))
    const next = addCoins(earned)

    // Consume powerup (single use)
    const finalState = consumePowerup()
    setMonState({ ...finalState, coins: next.coins })

    setLastScore(score)
    setView('score')

    // Show interstitial every N games (unless ads removed)
    if (!monState.adsRemoved && newCount % INTERSTITIAL_EVERY === 0) {
      setTimeout(() => setShowInterstitial(true), 600)
    }
  }, [gamesPlayed, monState.adsRemoved])

  const handlePlayAgain = useCallback(() => {
    setView('playing')
  }, [])

  const handleMenu = useCallback(() => {
    setSelectedGame(null)
    setView('menu')
  }, [])

  const handleMonStateChange = useCallback((s: MonState) => {
    setMonState(s)
  }, [])

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: 'var(--bg)' }}>
      {view === 'menu' && (
        <MainMenu
          onSelectGame={handleSelectGame}
          monState={monState}
          onMonStateChange={handleMonStateChange}
        />
      )}

      {view === 'playing' && selectedGame && (
        <GameWrapper
          key={`${selectedGame}-${gamesPlayed}`}
          gameId={selectedGame}
          onGameEnd={handleGameEnd}
          onExit={handleMenu}
          activePowerup={monState.activePowerup}
        />
      )}

      {view === 'score' && selectedGame && (
        <ScoreScreen
          score={lastScore}
          gameId={selectedGame}
          onPlayAgain={handlePlayAgain}
          onMenu={handleMenu}
          monState={monState}
          onMonStateChange={handleMonStateChange}
        />
      )}

      {showInterstitial && (
        <Interstitial onClose={() => setShowInterstitial(false)} />
      )}
    </div>
  )
}
