import { useRef, useCallback, useEffect } from 'react'
import {
  SWIPE_THRESHOLD_PX,
  PIXELS_PER_SCORE_UNIT,
  TAP_THRESHOLD_PX,
} from '../constants'

/**
 * Normalize rotation to 0-270 range for direction calculation
 * @param {number} rotation - Raw rotation value
 * @returns {number} Normalized rotation (0, 90, 180, or 270)
 */
function normalizeRotation(rotation) {
  return ((rotation % 360) + 360) % 360
}

/**
 * Transform delta based on rotation so "up" from player's view always increases score.
 * @param {number} deltaX - X movement (positive = moved left from start)
 * @param {number} deltaY - Y movement (positive = moved up from start)
 * @param {number} rotation - Player rotation in degrees
 * @returns {number} Transformed delta for score calculation
 */
function transformDelta(deltaX, deltaY, rotation) {
  switch (normalizeRotation(rotation)) {
    case 90:  return -deltaX  // swipe left (from player's view: up) = increase
    case 180: return -deltaY  // swipe down (from player's view: up) = increase
    case 270: return deltaX   // swipe right (from player's view: up) = increase
    default:  return deltaY   // swipe up = increase
  }
}

/**
 * Calculate score change from swipe delta
 * @param {number} delta - Transformed delta value
 * @returns {number} Score change (positive or negative integer, or 0 if below threshold)
 */
function calculateChange(delta) {
  if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return 0
  const units = Math.floor(Math.abs(delta) / PIXELS_PER_SCORE_UNIT)
  return Math.max(1, units) * (delta > 0 ? 1 : -1)
}

/**
 * Calculate tap direction based on position within element.
 * Uses a bias toward positive scores - only returns -1 if tap is
 * in the bottom ~30% of the relevant axis (based on rotation).
 *
 * @param {number} clientX - Client X coordinate of tap
 * @param {number} clientY - Client Y coordinate of tap
 * @param {DOMRect} rect - Bounding rectangle of the element
 * @param {number} rotation - Player rotation in degrees
 * @returns {number} 1 for positive, -1 for negative
 */
function calculateTapDirection(clientX, clientY, rect, rotation) {
  const centerX = rect.width / 2
  const centerY = rect.height / 2
  const tapX = clientX - rect.left - centerX
  const tapY = clientY - rect.top - centerY

  // Use transformDelta with tap position as if it were a swipe direction
  // Positive values mean tapped right/down, negative means tapped left/up
  const tapDelta = transformDelta(-tapX, -tapY, rotation)

  // Bias toward +1: only return -1 if tap is fully in bottom ~30% of cell
  // Use the correct axis based on rotation (vertical for 0/180, horizontal for 90/270)
  const normalized = normalizeRotation(rotation)
  const relevantCenter = (normalized === 90 || normalized === 270) ? centerX : centerY
  const biasThreshold = -relevantCenter * 0.4

  return tapDelta >= biasThreshold ? 1 : -1
}

/**
 * Hook for handling swipe and tap gestures with rotation awareness.
 *
 * @param {Object} options
 * @param {Function} options.onSwipe - Called with score change when swipe ends
 * @param {Function} [options.onPreview] - Called during swipe with current calculated change
 * @param {Function} [options.onTap] - Called with direction (1 or -1) when tap detected
 * @param {number} [options.rotation=0] - Player rotation in degrees
 * @returns {Object} Event handlers to spread on the target element
 */
export function useSwipe({ onSwipe, onPreview, onTap, rotation = 0 }) {
  const touchStart = useRef(null)
  const currentDelta = useRef({ x: 0, y: 0 })
  const elementRef = useRef(null)
  const lastTouchTimeRef = useRef(0)

  // =========================================================================
  // Touch handlers
  // =========================================================================

  const handleTouchStart = useCallback((e) => {
    if (!e.touches || !e.touches[0]) return
    lastTouchTimeRef.current = Date.now()
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    }
    currentDelta.current = { x: 0, y: 0 }
    elementRef.current = e.currentTarget
  }, [])

  const handleTouchMove = useCallback((e) => {
    if (!touchStart.current || !e.touches || !e.touches[0]) return

    const deltaX = touchStart.current.x - e.touches[0].clientX
    const deltaY = touchStart.current.y - e.touches[0].clientY
    currentDelta.current = { x: deltaX, y: deltaY }

    // Prevent scrolling when swiping on player cards
    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      e.preventDefault()
    }

    // Call preview with current calculated change
    if (onPreview) {
      const transformedDelta = transformDelta(deltaX, deltaY, rotation)
      const change = calculateChange(transformedDelta)
      onPreview(change)
    }
  }, [onPreview, rotation])

  const handleTouchEnd = useCallback((e) => {
    if (!touchStart.current) return

    const { x: deltaX, y: deltaY } = currentDelta.current
    const transformedDelta = transformDelta(deltaX, deltaY, rotation)
    const change = calculateChange(transformedDelta)

    if (change !== 0) {
      onSwipe(change)

      // Haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(10)
      }
    } else if (onTap && Math.abs(deltaX) < TAP_THRESHOLD_PX && Math.abs(deltaY) < TAP_THRESHOLD_PX && elementRef.current) {
      // This was a tap (minimal movement), determine direction based on position
      const touch = e.changedTouches?.[0]
      if (touch) {
        const rect = elementRef.current.getBoundingClientRect()
        const direction = calculateTapDirection(touch.clientX, touch.clientY, rect, rotation)
        onTap(direction)
      }
    }

    // Clear preview
    if (onPreview) {
      onPreview(null)
    }

    touchStart.current = null
    currentDelta.current = { x: 0, y: 0 }
    elementRef.current = null
  }, [onSwipe, onPreview, onTap, rotation])

  const handleTouchCancel = useCallback(() => {
    if (onPreview) {
      onPreview(null)
    }
    touchStart.current = null
    currentDelta.current = { x: 0, y: 0 }
    elementRef.current = null
  }, [onPreview])

  // =========================================================================
  // Mouse handlers (for desktop support)
  // =========================================================================

  const mouseStart = useRef(null)

  const handleMouseMove = useCallback((e) => {
    if (!mouseStart.current) return
    const deltaX = mouseStart.current.x - e.clientX
    const deltaY = mouseStart.current.y - e.clientY
    currentDelta.current = { x: deltaX, y: deltaY }

    // Call preview with current calculated change
    if (onPreview) {
      const transformedDelta = transformDelta(deltaX, deltaY, rotation)
      const change = calculateChange(transformedDelta)
      onPreview(change)
    }
  }, [onPreview, rotation])

  const handleMouseUp = useCallback((e) => {
    if (!mouseStart.current) return

    const { x: deltaX, y: deltaY } = currentDelta.current
    const transformedDelta = transformDelta(deltaX, deltaY, rotation)
    const change = calculateChange(transformedDelta)

    if (change !== 0) {
      onSwipe(change)
    } else if (onTap && Math.abs(deltaX) < TAP_THRESHOLD_PX && Math.abs(deltaY) < TAP_THRESHOLD_PX && elementRef.current) {
      // This was a click (minimal movement), determine direction based on position
      const rect = elementRef.current.getBoundingClientRect()
      const direction = calculateTapDirection(e.clientX, e.clientY, rect, rotation)
      onTap(direction)
    }

    // Clear preview
    if (onPreview) {
      onPreview(null)
    }

    mouseStart.current = null
    currentDelta.current = { x: 0, y: 0 }
    elementRef.current = null

    // Remove global listeners
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }, [onSwipe, onPreview, onTap, rotation, handleMouseMove])

  const handleMouseDown = useCallback((e) => {
    // Skip if this is a synthetic mouse event following a touch event
    // Mobile browsers fire both touch and mouse events for compatibility
    if (Date.now() - lastTouchTimeRef.current < 500) {
      return
    }

    mouseStart.current = { x: e.clientX, y: e.clientY }
    currentDelta.current = { x: 0, y: 0 }
    elementRef.current = e.currentTarget

    // Add global listeners to track mouse even when it leaves the element
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [handleMouseMove, handleMouseUp])

  // Cleanup mouse listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchCancel,
    onMouseDown: handleMouseDown,
  }
}
