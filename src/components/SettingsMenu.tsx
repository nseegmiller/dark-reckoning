import { useState } from 'react'
import { useGame, ACTIONS } from '../context/GameContext'
import { ConfirmDialog } from './ConfirmDialog'
import { PlayerList } from './PlayerList'
import { AddPlayerForm } from './AddPlayerForm'
import { ThemeSelector } from './ThemeSelector'
import { MAX_PLAYERS, flushAndExecute } from '../constants'
import type { SettingsMenuProps, ConfirmDialogState } from '../types'

export function SettingsMenu({ onClose }: SettingsMenuProps) {
  const { state, dispatch } = useGame()
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null)

  const handleAddPlayer = (name: string) => {
    if (state.players.length >= MAX_PLAYERS) return
    dispatch({ type: ACTIONS.ADD_PLAYER, payload: name })
  }

  const handleRemovePlayer = (id: string) => {
    dispatch({ type: ACTIONS.REMOVE_PLAYER, payload: id })
  }

  const handleUpdatePlayerName = (playerId: string, name: string) => {
    dispatch({
      type: ACTIONS.UPDATE_PLAYER,
      payload: { id: playerId, updates: { name } }
    })
  }

  const handleColorChange = (playerId: string, color: string) => {
    dispatch({
      type: ACTIONS.UPDATE_PLAYER,
      payload: { id: playerId, updates: { color } },
    })
  }

  const handleThemeChange = (theme: string) => {
    dispatch({ type: ACTIONS.SET_THEME, payload: theme })
  }

  const handleNewGame = () => {
    flushAndExecute(() => {
      setConfirmDialog({
        title: 'New Game',
        message: 'Reset all scores to 0? Players will be kept.',
        confirmText: 'Reset Scores',
        onConfirm: () => {
          dispatch({ type: ACTIONS.NEW_GAME })
          setConfirmDialog(null)
          onClose()
        },
      })
    })
  }

  const handleClearAll = () => {
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
            {/* Players Section */}
            <div>
              <label className="block text-sm uppercase tracking-wider dr-text-dim mb-2">
                Players ({state.players.length}/{MAX_PLAYERS})
              </label>

              <PlayerList
                players={state.players}
                editingPlayerId={editingPlayer}
                usedColors={usedColors}
                onEditPlayer={setEditingPlayer}
                onColorChange={handleColorChange}
                onRemovePlayer={handleRemovePlayer}
                onUpdatePlayerName={handleUpdatePlayerName}
              />

              <AddPlayerForm
                canAddPlayer={state.players.length < MAX_PLAYERS}
                onAddPlayer={handleAddPlayer}
              />
            </div>

            {/* Theme Selection */}
            <ThemeSelector
              currentTheme={state.theme}
              onThemeChange={handleThemeChange}
            />

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
