import { useState, useCallback, useRef } from 'react'
import { useGame } from '../context/GameContext'
import { useSwipe } from '../hooks/useSwipe'

export function PlayerCell({ player }) {
  const { state, dispatch } = useGame()
  const [previewChange, setPreviewChange] = useState(null)
  const lastTapRef = useRef(0)

  const handleSwipe = useCallback((change) => {
    dispatch({ type: 'ADJUST_SCORE', payload: { playerId: player.id, change } })
  }, [dispatch, player.id])

  const handlePreview = useCallback((change) => {
    setPreviewChange(change)
  }, [])

  const handleRotate = useCallback(() => {
    dispatch({ type: 'ROTATE_PLAYER', payload: player.id })
  }, [dispatch, player.id])

  // Double-tap detection
  const handleDoubleTap = useCallback(() => {
    const now = Date.now()
    if (now - lastTapRef.current < 300) {
      handleRotate()
      lastTapRef.current = 0 // Reset to prevent triple-tap
    } else {
      lastTapRef.current = now
    }
  }, [handleRotate])

  const swipeHandlers = useSwipe({
    multiplier: state.multiplier,
    rotation: player.rotation || 0,
    onSwipe: handleSwipe,
    onPreview: handlePreview,
  })

  const displayScore = previewChange !== null ? player.score + previewChange : player.score
  const isPreviewActive = previewChange !== null && previewChange !== 0
  const rotation = player.rotation || 0

  return (
    <div
      {...swipeHandlers}
      onClick={handleDoubleTap}
      className="relative flex items-center justify-center select-none touch-none cursor-ns-resize overflow-hidden"
      style={{ backgroundColor: 'var(--pip-bg)' }}
    >
      {/* Rotation button - stays fixed in corner */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleRotate()
        }}
        className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center pip-text-dim hover:pip-text transition-colors text-lg"
        style={{ textShadow: '0 0 10px var(--pip-green-glow)' }}
        aria-label="Rotate player"
      >
        ↻
      </button>

      {/* Player color indicator bar - stays at top of cell */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: player.color, boxShadow: `0 0 10px ${player.color}` }}
      />

      {/* Rotated content */}
      <div
        className="flex flex-col items-center justify-center transition-transform duration-200"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {/* Player name */}
        <div
          className="text-2xl uppercase tracking-widest mb-2"
          style={{ color: player.color, textShadow: `0 0 10px ${player.color}80` }}
        >
          {player.name}
        </div>

        {/* Score */}
        <div
          className="score-text transition-all duration-75"
          style={{
            color: isPreviewActive
              ? (previewChange > 0 ? '#4ade80' : '#f87171')
              : player.color,
            textShadow: `0 0 20px ${isPreviewActive
              ? (previewChange > 0 ? 'rgba(74, 222, 128, 0.5)' : 'rgba(248, 113, 113, 0.5)')
              : player.color}80, 0 0 40px ${isPreviewActive
              ? (previewChange > 0 ? 'rgba(74, 222, 128, 0.3)' : 'rgba(248, 113, 113, 0.3)')
              : player.color}40`
          }}
        >
          {displayScore}
        </div>

        {/* Delta indicator */}
        <div className="h-6 flex items-center justify-center">
          {isPreviewActive && (
            <span className={`text-lg ${previewChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {previewChange > 0 ? '+' : ''}{previewChange}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
