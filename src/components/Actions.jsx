import { useState } from 'react'
import { useGame } from '../context/GameContext'
import { History } from './History'

export function Actions() {
  const { state, dispatch } = useGame()
  const [showHistory, setShowHistory] = useState(false)

  const handleUndo = () => {
    dispatch({ type: 'UNDO' })
  }

  const handleNewGame = () => {
    if (state.players.length === 0) return
    if (confirm('Reset all scores to 0?')) {
      dispatch({ type: 'NEW_GAME' })
    }
  }

  const handleClearAll = () => {
    if (confirm('Remove all players and start fresh?')) {
      dispatch({ type: 'CLEAR_ALL' })
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={handleUndo}
          disabled={state.history.length === 0}
          className="btn-game disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4 mr-1.5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
          Undo
        </button>
        <button
          onClick={() => setShowHistory(true)}
          className="btn-game"
        >
          History
        </button>
        <button
          onClick={handleNewGame}
          disabled={state.players.length === 0}
          className="btn-game disabled:opacity-30 disabled:cursor-not-allowed"
        >
          New Game
        </button>
        <button
          onClick={handleClearAll}
          className="btn-game-danger"
        >
          Clear
        </button>
      </div>

      {showHistory && <History onClose={() => setShowHistory(false)} />}
    </>
  )
}
