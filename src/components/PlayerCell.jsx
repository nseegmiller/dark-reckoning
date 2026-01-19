import { useState, useCallback, useRef, memo, useEffect, useLayoutEffect } from 'react'
import { useGame, ACTIONS } from '../context/GameContext'
import { useSwipe } from '../hooks/useSwipe'

const COMMIT_DEBOUNCE_MS = 2000

export const PlayerCell = memo(function PlayerCell({ player }) {
  const { state, dispatch } = useGame()
  const [previewChange, setPreviewChange] = useState(null)
  const [hasPendingChanges, setHasPendingChanges] = useState(false)

  // Dual state tracking for accumulated changes:
  // - accumulatedChange (state): Triggers UI re-renders to show pending changes
  // - accumulatedChangeRef (ref): Used in callbacks/unmount without causing re-renders
  // Both are needed to ensure correct values in all contexts (render vs callbacks)
  const [accumulatedChange, setAccumulatedChange] = useState(0)
  const accumulatedChangeRef = useRef(0)

  const commitTimerRef = useRef(null)

  // Track rotation for smooth transitions (avoid backwards animation on normalization)
  const prevRotationRef = useRef(player.rotation || 0)
  const [visualRotation, setVisualRotation] = useState(player.rotation || 0)
  const [skipTransition, setSkipTransition] = useState(false)

  const commitChanges = useCallback(() => {
    if (accumulatedChangeRef.current !== 0) {
      dispatch({ type: ACTIONS.ADJUST_SCORE, payload: { playerId: player.id, change: accumulatedChangeRef.current } })
      accumulatedChangeRef.current = 0
      setAccumulatedChange(0)
      setHasPendingChanges(false)
    }
    if (commitTimerRef.current) {
      clearTimeout(commitTimerRef.current)
      commitTimerRef.current = null
    }
  }, [dispatch, player.id])

  const handleScoreChange = useCallback((change) => {
    // Accumulate the change instead of dispatching immediately
    const newValue = accumulatedChangeRef.current + change
    accumulatedChangeRef.current = newValue
    setAccumulatedChange(newValue)
    setHasPendingChanges(true)

    // Clear existing timer
    if (commitTimerRef.current) {
      clearTimeout(commitTimerRef.current)
    }

    // Start new debounce timer
    commitTimerRef.current = setTimeout(() => {
      commitChanges()
    }, COMMIT_DEBOUNCE_MS)
  }, [commitChanges])

  const handlePreview = useCallback((change) => {
    setPreviewChange(change)
  }, [])

  const handleRotate = useCallback(() => {
    // Commit pending changes before rotating
    commitChanges()
    dispatch({ type: ACTIONS.ROTATE_PLAYER, payload: player.id })
  }, [commitChanges, dispatch, player.id])

  const swipeHandlers = useSwipe({
    rotation: player.rotation || 0,
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
  const highlightColor = shouldHighlight
    ? (totalDelta > 0 ? '#4ade80' : '#f87171')
    : player.color
  const rotation = player.rotation || 0

  // Commit changes on unmount
  useEffect(() => {
    return () => {
      if (accumulatedChangeRef.current !== 0) {
        dispatch({ type: ACTIONS.ADJUST_SCORE, payload: { playerId: player.id, change: accumulatedChangeRef.current } })
      }
      if (commitTimerRef.current) {
        clearTimeout(commitTimerRef.current)
      }
    }
  }, [dispatch, player.id])

  // Listen for flush events (before undo, settings open, etc.)
  useEffect(() => {
    const handleFlush = () => {
      commitChanges()
    }

    window.addEventListener('flushPendingScores', handleFlush)
    return () => {
      window.removeEventListener('flushPendingScores', handleFlush)
    }
  }, [commitChanges])

  // Detect rotation normalization (value decreased) and handle smoothly
  useLayoutEffect(() => {
    const currentRotation = player.rotation || 0
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

        {/* Score */}
        <div
          className="score-text transition-all duration-75"
          style={{
            color: highlightColor,
            textShadow: `0 0 20px ${shouldHighlight
              ? (totalDelta > 0 ? 'rgba(74, 222, 128, 0.5)' : 'rgba(248, 113, 113, 0.5)')
              : player.color}80, 0 0 40px ${shouldHighlight
              ? (totalDelta > 0 ? 'rgba(74, 222, 128, 0.3)' : 'rgba(248, 113, 113, 0.3)')
              : player.color}40`
          }}
        >
          {displayScore}
        </div>

        {/* Delta indicator */}
        <div className="h-6 flex items-center justify-center">
          {showDelta && (
            <span className={`text-lg ${totalDelta > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalDelta > 0 ? '+' : ''}{totalDelta}
            </span>
          )}
        </div>
      </div>
    </div>
  )
})
