import { useState, useCallback, memo, useLayoutEffect, useRef } from 'react'
import { useGame, ACTIONS } from '../context/GameContext'
import { useSwipe } from '../hooks/useSwipe'
import { useScoreAccumulator } from '../hooks/useScoreAccumulator'
import type { PlayerCellProps } from '../types'

export const PlayerCell = memo(function PlayerCell({ player }: PlayerCellProps) {
  const { dispatch } = useGame()
  const [previewChange, setPreviewChange] = useState<number | null>(null)

  // Use the score accumulator hook for debounced score changes
  const { accumulatedChange, hasPendingChanges, add, commit } = useScoreAccumulator(
    player.id,
    dispatch
  )

  // Track rotation for smooth transitions (avoid backwards animation on normalization)
  const prevRotationRef = useRef(player.rotation)
  const [visualRotation, setVisualRotation] = useState(player.rotation)
  const [skipTransition, setSkipTransition] = useState(false)

  const handleScoreChange = useCallback((change: number) => {
    add(change)
  }, [add])

  const handlePreview = useCallback((change: number | null) => {
    setPreviewChange(change)
  }, [])

  const handleRotate = useCallback(() => {
    // Commit pending changes before rotating
    commit()
    dispatch({ type: ACTIONS.ROTATE_PLAYER, payload: player.id })
  }, [commit, dispatch, player.id])

  const swipeHandlers = useSwipe({
    rotation: player.rotation,
    onSwipe: handleScoreChange,
    onPreview: handlePreview,
    onTap: handleScoreChange,
  })

  // Show both accumulated changes and current preview
  const displayScore = player.score + accumulatedChange + (previewChange || 0)
  const isPreviewActive = previewChange !== null && previewChange !== 0
  const totalDelta = accumulatedChange + (previewChange || 0)
  const showDelta = (isPreviewActive || hasPendingChanges) && totalDelta !== 0
  const shouldHighlight = isPreviewActive || (hasPendingChanges && accumulatedChange !== 0)
  const isPositive = totalDelta > 0
  const highlightColor = shouldHighlight
    ? (isPositive ? 'var(--color-positive)' : 'var(--color-negative)')
    : player.color

  // Detect rotation normalization (value decreased) and handle smoothly
  useLayoutEffect(() => {
    const currentRotation = player.rotation
    const prevRotation = prevRotationRef.current

    if (currentRotation < prevRotation) {
      // Normalization happened (e.g., 360 → 90)
      // First, instantly jump to the equivalent lower position (e.g., 360 → 0)
      const equivalentPrevious = prevRotation % 360
      setVisualRotation(equivalentPrevious)
      setSkipTransition(true)

      // Then on next frame, animate to new position (e.g., 0 → 90)
      requestAnimationFrame(() => {
        setSkipTransition(false)
        setVisualRotation(currentRotation)
      })
    } else {
      // Normal rotation, just update
      setVisualRotation(currentRotation)
    }

    prevRotationRef.current = currentRotation
  }, [player.rotation])

  return (
    <div
      {...swipeHandlers}
      className={`relative flex items-center justify-center select-none touch-none cursor-ns-resize overflow-hidden ${
        hasPendingChanges ? 'animate-pulse-subtle' : ''
      }`}
      style={{
        backgroundColor: 'var(--dr-bg)',
        border: hasPendingChanges ? `2px solid ${player.color}` : 'none',
        boxShadow: hasPendingChanges ? `0 0 15px ${player.color}80` : 'none',
      }}
    >
      {/* Rotation button - stays fixed in corner */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleRotate()
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        className="absolute top-1 right-1 sm:top-2 sm:right-2 z-10 w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center dr-text-dim hover:dr-text active:dr-text transition-colors text-xl sm:text-lg touch-manipulation"
        style={{ textShadow: '0 0 10px var(--dr-green-glow)' }}
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
        className={`flex flex-col items-center justify-center px-2 ${skipTransition ? '' : 'transition-transform duration-200'}`}
        style={{ transform: `rotate(${visualRotation}deg)` }}
      >
        {/* Player name */}
        <div
          className="text-lg sm:text-2xl uppercase tracking-widest mb-1 sm:mb-2 max-w-full truncate"
          style={{ color: player.color, textShadow: `0 0 10px ${player.color}80` }}
        >
          {player.name}
        </div>

        {/* Score with aria-live for accessibility */}
        <div
          className="score-text transition-all duration-75"
          style={{
            color: highlightColor,
            textShadow: `0 0 20px ${shouldHighlight
              ? (isPositive ? 'var(--color-positive-glow)' : 'var(--color-negative-glow)')
              : player.color}80, 0 0 40px ${shouldHighlight
              ? (isPositive ? 'var(--color-positive-glow-dim)' : 'var(--color-negative-glow-dim)')
              : player.color}40`
          }}
          aria-live="polite"
          aria-atomic="true"
        >
          {displayScore}
        </div>

        {/* Delta indicator */}
        <div className="h-6 flex items-center justify-center">
          {showDelta && (
            <span className={`text-lg ${isPositive ? 'text-positive' : 'text-negative'}`}>
              {isPositive ? '+' : ''}{totalDelta}
            </span>
          )}
        </div>
      </div>
    </div>
  )
})
