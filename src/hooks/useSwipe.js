import { useRef, useCallback } from 'react'

const SWIPE_THRESHOLD = 20 // Minimum pixels to register a swipe
const PIXELS_PER_UNIT = 30 // Every 30px = 1 unit

// Transform delta based on rotation so "up" from player's view always increases
function transformDelta(deltaX, deltaY, rotation) {
  // Normalize rotation to 0-270 range for direction calculation
  const normalizedRotation = ((rotation % 360) + 360) % 360
  switch (normalizedRotation) {
    case 90:  return -deltaX  // swipe left (from player's view: up) = increase
    case 180: return -deltaY  // swipe down (from player's view: up) = increase
    case 270: return deltaX   // swipe right (from player's view: up) = increase
    default:  return deltaY   // swipe up = increase
  }
}

function calculateChange(delta, multiplier) {
  if (Math.abs(delta) < SWIPE_THRESHOLD) return 0
  const units = Math.floor(Math.abs(delta) / PIXELS_PER_UNIT)
  return Math.max(1, units) * multiplier * (delta > 0 ? 1 : -1)
}

export function useSwipe({ onSwipe, onPreview, multiplier = 1, rotation = 0 }) {
  const touchStart = useRef(null)
  const currentDelta = useRef({ x: 0, y: 0 })

  const handleTouchStart = useCallback((e) => {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    }
    currentDelta.current = { x: 0, y: 0 }
  }, [])

  const handleTouchMove = useCallback((e) => {
    if (!touchStart.current) return

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
      const change = calculateChange(transformedDelta, multiplier)
      onPreview(change)
    }
  }, [onPreview, multiplier, rotation])

  const handleTouchEnd = useCallback(() => {
    if (!touchStart.current) return

    const { x: deltaX, y: deltaY } = currentDelta.current
    const transformedDelta = transformDelta(deltaX, deltaY, rotation)
    const change = calculateChange(transformedDelta, multiplier)

    if (change !== 0) {
      onSwipe(change)

      // Haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(10)
      }
    }

    // Clear preview
    if (onPreview) {
      onPreview(null)
    }

    touchStart.current = null
    currentDelta.current = { x: 0, y: 0 }
  }, [onSwipe, onPreview, multiplier, rotation])

  // Mouse support for desktop
  const mouseStart = useRef(null)

  const handleMouseDown = useCallback((e) => {
    mouseStart.current = { x: e.clientX, y: e.clientY }
    currentDelta.current = { x: 0, y: 0 }
  }, [])

  const handleMouseMove = useCallback((e) => {
    if (!mouseStart.current) return
    const deltaX = mouseStart.current.x - e.clientX
    const deltaY = mouseStart.current.y - e.clientY
    currentDelta.current = { x: deltaX, y: deltaY }

    // Call preview with current calculated change
    if (onPreview) {
      const transformedDelta = transformDelta(deltaX, deltaY, rotation)
      const change = calculateChange(transformedDelta, multiplier)
      onPreview(change)
    }
  }, [onPreview, multiplier, rotation])

  const handleMouseUp = useCallback(() => {
    if (!mouseStart.current) return

    const { x: deltaX, y: deltaY } = currentDelta.current
    const transformedDelta = transformDelta(deltaX, deltaY, rotation)
    const change = calculateChange(transformedDelta, multiplier)

    if (change !== 0) {
      onSwipe(change)
    }

    // Clear preview
    if (onPreview) {
      onPreview(null)
    }

    mouseStart.current = null
    currentDelta.current = { x: 0, y: 0 }
  }, [onSwipe, onPreview, multiplier, rotation])

  const handleMouseLeave = useCallback(() => {
    if (mouseStart.current && onPreview) {
      onPreview(null)
    }
    mouseStart.current = null
    currentDelta.current = { x: 0, y: 0 }
  }, [onPreview])

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
    onMouseLeave: handleMouseLeave,
  }
}
