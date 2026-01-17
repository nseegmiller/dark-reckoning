import { useState, useCallback, useRef, memo, useEffect } from 'react'
import { useGame, ACTIONS } from '../context/GameContext'
import { useSwipe } from '../hooks/useSwipe'

const COMMIT_DEBOUNCE_MS = 2000

export const PlayerCell = memo(function PlayerCell({ player }) {
  const { state, dispatch } = useGame()
  const [previewChange, setPreviewChange] = useState(null)
  const [hasPendingChanges, setHasPendingChanges] = useState(false)
  const [accumulatedChange, setAccumulatedChange] = useState(0)
  const lastTapRef = useRef(0)
  const commitTimerRef = useRef(null)
  const accumulatedChangeRef = useRef(0)

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

  const handleSwipe = useCallback((change) => {
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

  return (
    <div
      {...swipeHandlers}
      onClick={handleDoubleTap}
      className={`relative flex items-center justify-center select-none touch-none cursor-ns-resize overflow-hidden ${
        hasPendingChanges ? 'animate-pulse-subtle' : ''
      }`}
      style={{
        backgroundColor: 'var(--pip-bg)',
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
