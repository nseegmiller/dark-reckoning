import { useState } from 'react'
import PropTypes from 'prop-types'
import { useGame, ACTIONS } from '../context/GameContext'
import { PLAYER_COLORS } from '../utils/colors'
import { ConfirmDialog } from './ConfirmDialog'
import { MAX_PLAYERS, MAX_PLAYER_NAME_LENGTH, flushAndExecute } from '../constants'

export function SettingsMenu({ onClose }) {
  const { state, dispatch } = useGame()
  const [newPlayerName, setNewPlayerName] = useState('')
  const [editingPlayer, setEditingPlayer] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState(null)

  const handleAddPlayer = () => {
    if (state.players.length >= MAX_PLAYERS) return
    dispatch({ type: ACTIONS.ADD_PLAYER, payload: newPlayerName.trim() })
    setNewPlayerName('')
  }

  const handleRemovePlayer = (id) => {
    dispatch({ type: ACTIONS.REMOVE_PLAYER, payload: id })
  }

  const handleNewGame = () => {
    // Flush any pending score changes before new game
    flushAndExecute(() => {
      setConfirmDialog({
        title: 'New Game',
        message: 'Reset all scores to 0? Players will be kept.',
        confirmText: 'Reset Scores',
        onConfirm: () => {
          dispatch({ type: ACTIONS.NEW_GAME })
          setConfirmDialog(null)
        },
      })
    })
  }

  const handleClearAll = () => {
    // Flush any pending score changes before clearing all
    flushAndExecute(() => {
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
    })
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
        className="dr-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <div className="dr-panel w-full max-w-md max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b dr-border">
            <h2 id="settings-title" className="text-lg uppercase tracking-widest dr-text">Settings</h2>
            <button onClick={onClose} className="dialog-close dr-text-dim hover:dr-text" aria-label="Close settings">&times;</button>
          </div>

          <div className="p-3 sm:p-4 space-y-5 sm:space-y-6">
            {/* Players */}
            <div>
              <label className="block text-sm uppercase tracking-wider dr-text-dim mb-2">
                Players ({state.players.length}/{MAX_PLAYERS})
              </label>

              {/* Player list */}
              <div className="space-y-2 mb-3">
                {state.players.map((player) => (
                  <div key={player.id} className="flex items-center gap-2 p-2 border dr-border">
                    {/* Color selector */}
                    <div className="relative shrink-0">
                      <button
                        className="w-8 h-8 border dr-border touch-manipulation"
                        style={{ backgroundColor: player.color, borderRadius: 'var(--theme-border-radius)' }}
                        onClick={() => setEditingPlayer(editingPlayer === player.id ? null : player.id)}
                        aria-label={`Change color for ${player.name}`}
                      />
                      {editingPlayer === player.id && (
                        <div className="absolute top-full left-0 mt-1 p-2 dr-panel z-10 flex flex-wrap gap-1.5 w-36">
                          {PLAYER_COLORS.map((c) => (
                            <button
                              key={c.hex}
                              onClick={() => {
                                handleColorChange(player.id, c.hex)
                                setEditingPlayer(null)
                              }}
                              disabled={usedColors.includes(c.hex) && c.hex !== player.color}
                              className={`w-8 h-8 touch-manipulation ${usedColors.includes(c.hex) && c.hex !== player.color ? 'opacity-30' : ''}`}
                              style={{ backgroundColor: c.hex, borderRadius: 'var(--theme-border-radius)' }}
                              aria-label={`Select ${c.name} color`}
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
                      className="flex-1 min-w-0 bg-transparent border-none outline-none dr-text uppercase tracking-wide"
                      maxLength={MAX_PLAYER_NAME_LENGTH}
                      aria-label={`Name for ${player.name}`}
                    />

                    {/* Score display */}
                    <span className="dr-text-dim text-sm shrink-0 w-10 text-right tabular-nums">{player.score}</span>

                    {/* Remove button */}
                    <button
                      onClick={() => handleRemovePlayer(player.id)}
                      className="shrink-0 w-8 h-8 flex items-center justify-center dr-text-dim hover:text-red-400 text-xl touch-manipulation"
                      aria-label={`Remove ${player.name}`}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>

              {/* Add player */}
              {state.players.length < MAX_PLAYERS && (
                <div className="flex gap-2 items-stretch">
                  <input
                    type="text"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
                    placeholder="Player name..."
                    className="flex-1 min-w-0 px-3 py-2 bg-transparent border dr-border dr-text placeholder:dr-text-dim uppercase tracking-wide outline-none focus:border-[var(--dr-green)]"
                    maxLength={MAX_PLAYER_NAME_LENGTH}
                  />
                  <button onClick={handleAddPlayer} className="dr-btn shrink-0 px-4">
                    Add
                  </button>
                </div>
              )}
            </div>

            {/* Theme Selection */}
            <div>
              <label className="block text-sm uppercase tracking-wider dr-text-dim mb-2">
                Theme
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => dispatch({ type: ACTIONS.SET_THEME, payload: 'atompunk' })}
                  className={`dr-btn py-3 ${state.theme === 'atompunk' ? 'dr-btn-active' : ''}`}
                >
                  <div className="text-center">
                    <div className="text-sm mb-1">Atom Punk</div>
                    <div className="text-xs dr-text-dim">Terminal</div>
                  </div>
                </button>
                <button
                  onClick={() => dispatch({ type: ACTIONS.SET_THEME, payload: 'nebula' })}
                  className={`dr-btn py-3 ${state.theme === 'nebula' ? 'dr-btn-active' : ''}`}
                >
                  <div className="text-center">
                    <div className="text-sm mb-1">Nebula</div>
                    <div className="text-xs dr-text-dim">Space</div>
                  </div>
                </button>
                <button
                  onClick={() => dispatch({ type: ACTIONS.SET_THEME, payload: 'clear' })}
                  className={`dr-btn py-3 ${state.theme === 'clear' ? 'dr-btn-active' : ''}`}
                >
                  <div className="text-center">
                    <div className="text-sm mb-1">Clear</div>
                    <div className="text-xs dr-text-dim">Readable</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={handleNewGame}
                disabled={state.players.length === 0}
                className="dr-btn w-full disabled:opacity-30"
              >
                <span className="sm:hidden">New Game</span>
                <span className="hidden sm:inline">New Game (Reset Scores)</span>
              </button>
              <button
                onClick={handleClearAll}
                className="dr-btn w-full text-red-400 border-red-400/50 hover:border-red-400"
              >
                <span className="sm:hidden">Clear All</span>
                <span className="hidden sm:inline">Clear All Players</span>
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

SettingsMenu.propTypes = {
  onClose: PropTypes.func.isRequired,
}
