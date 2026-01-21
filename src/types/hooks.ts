// Hook-related type definitions

import type { TouchEvent, MouseEvent } from 'react'

/** Options for the useSwipe hook */
export interface UseSwipeOptions {
  /** Called with score change when swipe ends */
  onSwipe: (change: number) => void
  /** Called during swipe with current calculated change */
  onPreview?: (change: number | null) => void
  /** Called with direction (1 or -1) when tap detected */
  onTap?: (direction: number) => void
  /** Player rotation in degrees */
  rotation?: number
}

/** Return value from useSwipe hook */
export interface SwipeHandlers {
  onTouchStart: (e: TouchEvent) => void
  onTouchMove: (e: TouchEvent) => void
  onTouchEnd: (e: TouchEvent) => void
  onTouchCancel: () => void
  onMouseDown: (e: MouseEvent) => void
}

/** Return value from useScoreAccumulator hook */
export interface ScoreAccumulatorState {
  /** Current accumulated change value */
  accumulatedChange: number
  /** Whether there are uncommitted changes */
  hasPendingChanges: boolean
  /** Add a change to the accumulator */
  add: (change: number) => void
  /** Immediately commit all accumulated changes */
  commit: () => void
}

/** Return value from useDialog hook */
export interface DialogState {
  /** Whether the dialog is currently open */
  isOpen: boolean
  /** Function to open the dialog */
  open: () => void
  /** Function to close the dialog */
  close: () => void
  /** Function to toggle the dialog */
  toggle: () => void
}
