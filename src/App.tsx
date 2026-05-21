import { useState, useCallback } from 'react'
import type { GameId } from './types'
import MainMenu from './components/MainMenu'
import GameWrapper from './components/GameWrapper'
import ScoreScreen from './components/ScoreScreen'

type View = 'menu' | 'playing' | 'score'

export default function App() {
  const [view, setView] = useState<View>('menu')
  const [selectedGame, setSelectedGame] = useState<GameId | null>(null)
  const [lastScore, setLastScore] = useState(0)

  const handleSelectGame = useCallback((id: GameId) => {
    setSelectedGame(id)
    setView('playing')
  }, [])

  const handleGameEnd = useCallback((score: number) => {
    setLastScore(score)
    setView('score')
  }, [])

  const handlePlayAgain = useCallback(() => {
    setView('playing')
  }, [])

  const handleMenu = useCallback(() => {
    setSelectedGame(null)
    setView('menu')
  }, [])

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: 'var(--bg)' }}>
      {view === 'menu' && (
        <MainMenu onSelectGame={handleSelectGame} />
      )}
      {view === 'playing' && selectedGame && (
        <GameWrapper
          key={`${selectedGame}-${lastScore}`}
          gameId={selectedGame}
          onGameEnd={handleGameEnd}
          onExit={handleMenu}
        />
      )}
      {view === 'score' && selectedGame && (
        <ScoreScreen
          score={lastScore}
          gameId={selectedGame}
          onPlayAgain={handlePlayAgain}
          onMenu={handleMenu}
        />
      )}
    </div>
  )
}
