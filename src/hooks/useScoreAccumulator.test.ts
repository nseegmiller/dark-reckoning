import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useScoreAccumulator } from './useScoreAccumulator'
import { COMMIT_DEBOUNCE_MS, FLUSH_SCORES_EVENT } from '../constants'
import { ACTIONS } from '../types'

describe('useScoreAccumulator', () => {
  const mockDispatch = vi.fn()
  const playerId = 'test-player-123'

  beforeEach(() => {
    vi.useFakeTimers()
    mockDispatch.mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('initialization', () => {
    it('initializes with zero accumulated change', () => {
      const { result } = renderHook(() => useScoreAccumulator(playerId, mockDispatch))

      expect(result.current.accumulatedChange).toBe(0)
      expect(result.current.hasPendingChanges).toBe(false)
    })

    it('returns add and commit functions', () => {
      const { result } = renderHook(() => useScoreAccumulator(playerId, mockDispatch))

      expect(typeof result.current.add).toBe('function')
      expect(typeof result.current.commit).toBe('function')
    })
  })

  describe('accumulation', () => {
    it('accumulates positive changes', () => {
      const { result } = renderHook(() => useScoreAccumulator(playerId, mockDispatch))

      act(() => {
        result.current.add(5)
      })

      expect(result.current.accumulatedChange).toBe(5)
      expect(result.current.hasPendingChanges).toBe(true)
    })

    it('accumulates negative changes', () => {
      const { result } = renderHook(() => useScoreAccumulator(playerId, mockDispatch))

      act(() => {
        result.current.add(-3)
      })

      expect(result.current.accumulatedChange).toBe(-3)
      expect(result.current.hasPendingChanges).toBe(true)
    })

    it('accumulates multiple changes', () => {
      const { result } = renderHook(() => useScoreAccumulator(playerId, mockDispatch))

      act(() => {
        result.current.add(5)
        result.current.add(3)
        result.current.add(-2)
      })

      expect(result.current.accumulatedChange).toBe(6) // 5 + 3 - 2
      expect(result.current.hasPendingChanges).toBe(true)
    })

    it('handles changes that cancel out', () => {
      const { result } = renderHook(() => useScoreAccumulator(playerId, mockDispatch))

      act(() => {
        result.current.add(5)
        result.current.add(-5)
      })

      expect(result.current.accumulatedChange).toBe(0)
      // Still has pending since timer is running
      expect(result.current.hasPendingChanges).toBe(true)
    })
  })

  describe('debounced commit', () => {
    it('does not commit immediately', () => {
      const { result } = renderHook(() => useScoreAccumulator(playerId, mockDispatch))

      act(() => {
        result.current.add(5)
      })

      expect(mockDispatch).not.toHaveBeenCalled()
    })

    it('commits after debounce period', () => {
      const { result } = renderHook(() => useScoreAccumulator(playerId, mockDispatch))

      act(() => {
        result.current.add(5)
      })

      act(() => {
        vi.advanceTimersByTime(COMMIT_DEBOUNCE_MS)
      })

      expect(mockDispatch).toHaveBeenCalledWith({
        type: ACTIONS.ADJUST_SCORE,
        payload: { playerId, change: 5 }
      })
    })

    it('resets state after commit', () => {
      const { result } = renderHook(() => useScoreAccumulator(playerId, mockDispatch))

      act(() => {
        result.current.add(5)
      })

      act(() => {
        vi.advanceTimersByTime(COMMIT_DEBOUNCE_MS)
      })

      expect(result.current.accumulatedChange).toBe(0)
      expect(result.current.hasPendingChanges).toBe(false)
    })

    it('resets debounce timer on new changes', () => {
      const { result } = renderHook(() => useScoreAccumulator(playerId, mockDispatch))

      act(() => {
        result.current.add(5)
      })

      // Advance partway through debounce
      act(() => {
        vi.advanceTimersByTime(COMMIT_DEBOUNCE_MS - 100)
      })

      // Add another change - should reset timer
      act(() => {
        result.current.add(3)
      })

      // Original debounce time should have passed, but timer was reset
      act(() => {
        vi.advanceTimersByTime(100)
      })

      expect(mockDispatch).not.toHaveBeenCalled()

      // Complete the new debounce period
      act(() => {
        vi.advanceTimersByTime(COMMIT_DEBOUNCE_MS - 100)
      })

      expect(mockDispatch).toHaveBeenCalledWith({
        type: ACTIONS.ADJUST_SCORE,
        payload: { playerId, change: 8 } // 5 + 3
      })
    })
  })

  describe('manual commit', () => {
    it('commits immediately when called', () => {
      const { result } = renderHook(() => useScoreAccumulator(playerId, mockDispatch))

      act(() => {
        result.current.add(5)
      })

      act(() => {
        result.current.commit()
      })

      expect(mockDispatch).toHaveBeenCalledWith({
        type: ACTIONS.ADJUST_SCORE,
        payload: { playerId, change: 5 }
      })
    })

    it('does not commit if no changes', () => {
      const { result } = renderHook(() => useScoreAccumulator(playerId, mockDispatch))

      act(() => {
        result.current.commit()
      })

      expect(mockDispatch).not.toHaveBeenCalled()
    })

    it('cancels pending debounced commit', () => {
      const { result } = renderHook(() => useScoreAccumulator(playerId, mockDispatch))

      act(() => {
        result.current.add(5)
      })

      act(() => {
        result.current.commit()
      })

      // Advance past original debounce - should not commit again
      act(() => {
        vi.advanceTimersByTime(COMMIT_DEBOUNCE_MS * 2)
      })

      expect(mockDispatch).toHaveBeenCalledTimes(1)
    })
  })

  describe('flush event handling', () => {
    it('commits on flush event', () => {
      const { result } = renderHook(() => useScoreAccumulator(playerId, mockDispatch))

      act(() => {
        result.current.add(5)
      })

      act(() => {
        window.dispatchEvent(new CustomEvent(FLUSH_SCORES_EVENT))
      })

      expect(mockDispatch).toHaveBeenCalledWith({
        type: ACTIONS.ADJUST_SCORE,
        payload: { playerId, change: 5 }
      })
    })

    it('does not dispatch on flush if no changes', () => {
      renderHook(() => useScoreAccumulator(playerId, mockDispatch))

      act(() => {
        window.dispatchEvent(new CustomEvent(FLUSH_SCORES_EVENT))
      })

      expect(mockDispatch).not.toHaveBeenCalled()
    })
  })

  describe('cleanup on unmount', () => {
    it('commits pending changes on unmount', () => {
      const { result, unmount } = renderHook(() => useScoreAccumulator(playerId, mockDispatch))

      act(() => {
        result.current.add(5)
      })

      unmount()

      expect(mockDispatch).toHaveBeenCalledWith({
        type: ACTIONS.ADJUST_SCORE,
        payload: { playerId, change: 5 }
      })
    })

    it('does not dispatch on unmount if no changes', () => {
      const { unmount } = renderHook(() => useScoreAccumulator(playerId, mockDispatch))

      unmount()

      expect(mockDispatch).not.toHaveBeenCalled()
    })

    it('clears pending timer on unmount', () => {
      const { result, unmount } = renderHook(() => useScoreAccumulator(playerId, mockDispatch))

      act(() => {
        result.current.add(5)
      })

      unmount()

      // Should have committed once on unmount
      expect(mockDispatch).toHaveBeenCalledTimes(1)

      // Advance timers - should not commit again
      act(() => {
        vi.advanceTimersByTime(COMMIT_DEBOUNCE_MS * 2)
      })

      expect(mockDispatch).toHaveBeenCalledTimes(1)
    })
  })

  describe('player ID changes', () => {
    it('uses correct player ID in dispatch', () => {
      const playerId1 = 'player-1'
      const playerId2 = 'player-2'

      const { result, rerender } = renderHook(
        ({ id }) => useScoreAccumulator(id, mockDispatch),
        { initialProps: { id: playerId1 } }
      )

      act(() => {
        result.current.add(5)
      })

      rerender({ id: playerId2 })

      act(() => {
        result.current.add(3)
      })

      act(() => {
        vi.advanceTimersByTime(COMMIT_DEBOUNCE_MS)
      })

      // The commit should use the current player ID
      expect(mockDispatch).toHaveBeenCalledWith({
        type: ACTIONS.ADJUST_SCORE,
        payload: { playerId: playerId2, change: expect.any(Number) }
      })
    })
  })
})
