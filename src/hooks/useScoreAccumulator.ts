import { useState, useCallback, useRef, useEffect } from 'react'
import { ACTIONS } from '../types'
import type { GameAction, ScoreAccumulatorState } from '../types'
import { COMMIT_DEBOUNCE_MS, FLUSH_SCORES_EVENT } from '../constants'

/**
 * Hook for accumulating score changes with debounced commits.
 *
 * This hook manages the accumulation of score changes over a debounce period
 * before committing them to the game state. It handles:
 * - Accumulating multiple changes before committing
 * - Debounced commit after inactivity
 * - Immediate commit on flush events (undo, settings, etc.)
 * - Cleanup commit on unmount
 *
 * @param playerId - The player's unique identifier
 * @param dispatch - The game context dispatch function
 * @returns Score accumulator state and functions
 */
export function useScoreAccumulator(
  playerId: string,
  dispatch: React.Dispatch<GameAction>
): ScoreAccumulatorState {
  // Dual state tracking for accumulated changes:
  // - accumulatedChange (state): Triggers UI re-renders to show pending changes
  // - accumulatedChangeRef (ref): Used in callbacks/unmount without causing re-renders
  // Both are needed to ensure correct values in all contexts (render vs callbacks)
  const [accumulatedChange, setAccumulatedChange] = useState(0)
  const accumulatedChangeRef = useRef(0)
  const commitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [hasPendingChanges, setHasPendingChanges] = useState(false)

  /**
   * Commit accumulated changes to the game state.
   * Clears the timer and resets accumulated values.
   */
  const commit = useCallback(() => {
    if (accumulatedChangeRef.current !== 0) {
      dispatch({
        type: ACTIONS.ADJUST_SCORE,
        payload: { playerId, change: accumulatedChangeRef.current }
      })
      accumulatedChangeRef.current = 0
      setAccumulatedChange(0)
      setHasPendingChanges(false)
    }
    if (commitTimerRef.current) {
      clearTimeout(commitTimerRef.current)
      commitTimerRef.current = null
    }
  }, [dispatch, playerId])

  /**
   * Add a score change to the accumulator.
   * Resets the debounce timer.
   */
  const add = useCallback((change: number) => {
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
      commit()
    }, COMMIT_DEBOUNCE_MS)
  }, [commit])

  // Commit changes on unmount to prevent data loss
  useEffect(() => {
    return () => {
      // Use ref value directly since this runs in cleanup
      if (accumulatedChangeRef.current !== 0) {
        dispatch({
          type: ACTIONS.ADJUST_SCORE,
          payload: { playerId, change: accumulatedChangeRef.current }
        })
      }
      if (commitTimerRef.current) {
        clearTimeout(commitTimerRef.current)
      }
    }
  }, [dispatch, playerId])

  // Listen for flush events (before undo, settings open, etc.)
  useEffect(() => {
    const handleFlush = () => {
      commit()
    }

    window.addEventListener(FLUSH_SCORES_EVENT, handleFlush)
    return () => {
      window.removeEventListener(FLUSH_SCORES_EVENT, handleFlush)
    }
  }, [commit])

  return {
    /** Current accumulated change value */
    accumulatedChange,
    /** Whether there are uncommitted changes */
    hasPendingChanges,
    /** Add a change to the accumulator */
    add,
    /** Immediately commit all accumulated changes */
    commit,
  }
}
