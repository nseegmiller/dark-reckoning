import { useState } from 'react'
import { useGame, ACTIONS } from '../context/GameContext'
import { PLAYER_COLORS } from '../utils/colors'
import { ConfirmDialog } from './ConfirmDialog'

const FLUSH_DELAY_MS = 50

export function SettingsMenu({ onClose }) {
  const { state, dispatch } = useGame()
  const [newPlayerName, setNewPlayerName] = useState('')
  const [editingPlayer, setEditingPlayer] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState(null)

  const handleAddPlayer = () => {
    if (state.players.length >= 8) return
    dispatch({ type: ACTIONS.ADD_PLAYER, payload: newPlayerName.trim() })
    setNewPlayerName('')
  }

  const handleRemovePlayer = (id) => {
    dispatch({ type: ACTIONS.REMOVE_PLAYER, payload: id })
  }

  const handleUndo = () => {
    // Flush any pending score changes before undo
    window.dispatchEvent(new CustomEvent('flushPendingScores'))
    // Small delay to ensure flush completes
    setTimeout(() => {
      dispatch({ type: ACTIONS.UNDO })
    }, FLUSH_DELAY_MS)
  }

  const handleNewGame = () => {
    // Flush any pending score changes before new game
    window.dispatchEvent(new CustomEvent('flushPendingScores'))
    setTimeout(() => {
      setConfirmDialog({
        title: 'New Game',
        message: 'Reset all scores to 0? Players will be kept.',
        confirmText: 'Reset Scores',
        onConfirm: () => {
          dispatch({ type: ACTIONS.NEW_GAME })
          setConfirmDialog(null)
        },
      })
    }, FLUSH_DELAY_MS)
  }

  const handleClearAll = () => {
    // Flush any pending score changes before clearing all
    window.dispatchEvent(new CustomEvent('flushPendingScores'))
    setTimeout(() => {
      setConfirmDialog({
        title: 'Clear All',
        message: 'Remove all players and start fresh?',
        confirmText: 'Clear All',
        danger: true,
        onConfirm: () => {
          dispatch({ type: ACTIONS.CLEAR_ALL })
          setConfirmDialog(null)
        },
      })
    }, FLUSH_DELAY_MS)
  }

  const handleColorChange = (playerId, color) => {
    dispatch({
      type: ACTIONS.UPDATE_PLAYER,
      payload: { id: playerId, updates: { color } },
    })
  }

  const usedColors = state.players.map(p => p.color)

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <div className="pip-panel w-full max-w-md max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b pip-border">
            <h2 id="settings-title" className="text-lg uppercase tracking-widest pip-text">Settings</h2>
            <button onClick={onClose} className="pip-text-dim hover:pip-text text-2xl" aria-label="Close settings">&times;</button>
          </div>

          <div className="p-4 space-y-6">
            {/* Players */}
            <div>
              <label className="block text-sm uppercase tracking-wider pip-text-dim mb-2">
                Players ({state.players.length}/8)
              </label>

              {/* Player list */}
              <div className="space-y-2 mb-3">
                {state.players.map((player) => (
                  <div key={player.id} className="flex items-center gap-2 p-2 border pip-border">
                    {/* Color selector */}
                    <div className="relative">
                      <button
                        className="w-6 h-6 border pip-border"
                        style={{ backgroundColor: player.color }}
                        onClick={() => setEditingPlayer(editingPlayer === player.id ? null : player.id)}
                      />
                      {editingPlayer === player.id && (
                        <div className="absolute top-full left-0 mt-1 p-2 pip-panel z-10 flex flex-wrap gap-1 w-32">
                          {PLAYER_COLORS.map((c) => (
                            <button
                              key={c.hex}
                              onClick={() => {
                                handleColorChange(player.id, c.hex)
                                setEditingPlayer(null)
                              }}
                              disabled={usedColors.includes(c.hex) && c.hex !== player.color}
                              className={`w-6 h-6 ${usedColors.includes(c.hex) && c.hex !== player.color ? 'opacity-30' : ''}`}
                              style={{ backgroundColor: c.hex }}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Name input */}
                    <input
                      type="text"
                      value={player.name}
                      onChange={(e) => dispatch({
                        type: ACTIONS.UPDATE_PLAYER,
                        payload: { id: player.id, updates: { name: e.target.value } }
                      })}
                      className="flex-1 bg-transparent border-none outline-none pip-text uppercase tracking-wide"
                      maxLength={12}
                      aria-label={`Name for ${player.name}`}
                    />

                    {/* Score display */}
                    <span className="pip-text-dim text-sm w-12 text-right">{player.score}</span>

                    {/* Remove button */}
                    <button
                      onClick={() => handleRemovePlayer(player.id)}
                      className="pip-text-dim hover:text-red-400 text-lg px-1"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>

              {/* Add player */}
              {state.players.length < 8 && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
                    placeholder="Player name..."
                    className="flex-1 px-3 py-2 bg-transparent border pip-border pip-text placeholder:pip-text-dim uppercase tracking-wide outline-none focus:border-[var(--pip-green)]"
                    maxLength={12}
                  />
                  <button onClick={handleAddPlayer} className="pip-btn">
                    Add
                  </button>
                </div>
              )}
            </div>

            {/* Theme Selection */}
            <div>
              <label className="block text-sm uppercase tracking-wider pip-text-dim mb-2">
                Theme
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => dispatch({ type: ACTIONS.SET_THEME, payload: 'atompunk' })}
                  className={`pip-btn py-3 ${state.theme === 'atompunk' ? 'pip-btn-active' : ''}`}
                >
                  <div className="text-center">
                    <div className="text-sm mb-1">Atom Punk</div>
                    <div className="text-xs pip-text-dim">Terminal</div>
                  </div>
                </button>
                <button
                  onClick={() => dispatch({ type: ACTIONS.SET_THEME, payload: 'nebula' })}
                  className={`pip-btn py-3 ${state.theme === 'nebula' ? 'pip-btn-active' : ''}`}
                >
                  <div className="text-center">
                    <div className="text-sm mb-1">Nebula</div>
                    <div className="text-xs pip-text-dim">Space</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={handleUndo}
                disabled={state.history.length === 0}
                className="pip-btn w-full disabled:opacity-30"
              >
                Undo Last Change
              </button>
              <button
                onClick={handleNewGame}
                disabled={state.players.length === 0}
                className="pip-btn w-full disabled:opacity-30"
              >
                New Game (Reset Scores)
              </button>
              <button
                onClick={handleClearAll}
                className="pip-btn w-full text-red-400 border-red-400/50 hover:border-red-400"
              >
                Clear All Players
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Dialog */}
      {confirmDialog && (
        <ConfirmDialog
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmText={confirmDialog.confirmText}
          danger={confirmDialog.danger}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </>
  )
}
