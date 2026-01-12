import { useState, useCallback } from 'react'
import { useGame } from '../context/GameContext'
import { useSwipe } from '../hooks/useSwipe'
import { ColorPicker } from './ColorPicker'

export function PlayerCard({ player }) {
  const { state, dispatch } = useGame()
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(player.name)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [previewChange, setPreviewChange] = useState(null)

  const handleSwipe = useCallback((change) => {
    dispatch({ type: 'ADJUST_SCORE', payload: { playerId: player.id, change } })
  }, [dispatch, player.id])

  const handlePreview = useCallback((change) => {
    setPreviewChange(change)
  }, [])

  const swipeHandlers = useSwipe({
    multiplier: state.multiplier,
    onSwipe: handleSwipe,
    onPreview: handlePreview,
  })

  const handleNameSubmit = (e) => {
    e.preventDefault()
    dispatch({
      type: 'UPDATE_PLAYER',
      payload: { id: player.id, updates: { name: editName.trim() || player.name } },
    })
    setIsEditing(false)
  }

  const handleColorChange = (color) => {
    dispatch({
      type: 'UPDATE_PLAYER',
      payload: { id: player.id, updates: { color } },
    })
    setShowColorPicker(false)
  }

  const handleRemove = () => {
    if (confirm(`Remove ${player.name}?`)) {
      dispatch({ type: 'REMOVE_PLAYER', payload: player.id })
    }
  }

  const displayScore = previewChange !== null ? player.score + previewChange : player.score
  const isPreviewActive = previewChange !== null && previewChange !== 0

  return (
    <div
      className="card-game p-4 relative"
      style={{
        borderColor: `${player.color}40`,
        boxShadow: `inset 0 0 30px ${player.color}10, 0 0 20px ${player.color}20`
      }}
    >
      {/* Colored accent line */}
      <div
        className="absolute top-0 left-3 right-3 h-0.5"
        style={{ backgroundColor: player.color, boxShadow: `0 0 10px ${player.color}` }}
      />

      {/* Header row */}
      <div className="flex items-center justify-between mb-3 pt-2">
        {isEditing ? (
          <form onSubmit={handleNameSubmit} className="flex-1 mr-2">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleNameSubmit}
              autoFocus
              className="w-full px-3 py-1 bg-game-bg border border-game-accent rounded-sm
                         text-white font-semibold uppercase tracking-wide
                         focus:outline-none focus:shadow-glow"
              maxLength={20}
            />
          </form>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="text-lg font-semibold uppercase tracking-wider hover:text-game-glow transition-colors"
            style={{ color: player.color }}
          >
            {player.name}
          </button>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="w-6 h-6 rounded-sm border-2 border-white/20 transition-all hover:scale-110 hover:border-white/50"
            style={{ backgroundColor: player.color, boxShadow: `0 0 10px ${player.color}60` }}
            aria-label="Change color"
          />
          <button
            onClick={handleRemove}
            className="p-1 text-gray-600 hover:text-red-500 transition-colors"
            aria-label="Remove player"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Color picker dropdown */}
      {showColorPicker && (
        <ColorPicker
          currentColor={player.color}
          usedColors={state.players.filter(p => p.id !== player.id).map(p => p.color)}
          onSelect={handleColorChange}
          onClose={() => setShowColorPicker(false)}
        />
      )}

      {/* Score area - swipeable */}
      <div
        {...swipeHandlers}
        className="relative py-6 cursor-ns-resize select-none touch-none"
      >
        <div className="text-center">
          <span
            className={`score-display transition-all duration-75 ${
              isPreviewActive
                ? previewChange > 0
                  ? 'text-green-400 glow-text'
                  : 'text-red-400 glow-text'
                : 'text-white'
            }`}
            style={!isPreviewActive ? { color: player.color, textShadow: `0 0 30px ${player.color}80` } : {}}
          >
            {displayScore}
          </span>
        </div>
        <div className="h-7 flex items-center justify-center">
          {isPreviewActive && (
            <span
              className={`text-lg font-bold uppercase tracking-wider ${
                previewChange > 0 ? 'text-green-400' : 'text-red-400'
              }`}
              style={{ fontFamily: 'Orbitron, monospace' }}
            >
              {previewChange > 0 ? '+' : ''}{previewChange}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
