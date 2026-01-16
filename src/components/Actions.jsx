import { useState } from 'react'
import { useGame, ACTIONS } from '../context/GameContext'
import { History } from './History'
import { ConfirmDialog } from './ConfirmDialog'

export function Actions() {
  const { state, dispatch } = useGame()
  const [showHistory, setShowHistory] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState(null)

  const handleUndo = () => {
    dispatch({ type: ACTIONS.UNDO })
  }

  const handleNewGame = () => {
    if (state.players.length === 0) return
    setConfirmDialog({
      title: 'New Game',
      message: 'Reset all scores to 0?',
      onConfirm: () => {
        dispatch({ type: ACTIONS.NEW_GAME })
        setConfirmDialog(null)
      },
      onCancel: () => setConfirmDialog(null),
      confirmText: 'Reset',
    })
  }

  const handleClearAll = () => {
    setConfirmDialog({
      title: 'Clear All',
      message: 'Remove all players and start fresh?',
      onConfirm: () => {
        dispatch({ type: ACTIONS.CLEAR_ALL })
        setConfirmDialog(null)
      },
      onCancel: () => setConfirmDialog(null),
      confirmText: 'Clear',
      danger: true,
    })
  }

  return (
    <>
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={handleUndo}
          disabled={state.history.length === 0}
          className="btn-game disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Undo last score change"
        >
          <svg className="w-4 h-4 mr-1.5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
          Undo
        </button>
        <button
          onClick={() => setShowHistory(true)}
          className="btn-game"
          aria-label="View score history"
        >
          History
        </button>
        <button
          onClick={handleNewGame}
          disabled={state.players.length === 0}
          className="btn-game disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Start new game, reset all scores"
        >
          New Game
        </button>
        <button
          onClick={handleClearAll}
          className="btn-game-danger"
          aria-label="Clear all players and data"
        >
          Clear
        </button>
      </div>

      {showHistory && <History onClose={() => setShowHistory(false)} />}
      {confirmDialog && <ConfirmDialog {...confirmDialog} />}
    </>
  )
}
