import { useRef, useCallback, useEffect } from 'react'

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

function calculateChange(delta) {
  if (Math.abs(delta) < SWIPE_THRESHOLD) return 0
  const units = Math.floor(Math.abs(delta) / PIXELS_PER_UNIT)
  return Math.max(1, units) * (delta > 0 ? 1 : -1)
}

export function useSwipe({ onSwipe, onPreview, onTap, rotation = 0 }) {
  const touchStart = useRef(null)
  const currentDelta = useRef({ x: 0, y: 0 })
  const elementRef = useRef(null)  // Store element reference for tap detection
  const lastTouchTimeRef = useRef(0)  // Track touch events to prevent duplicate mouse events

  const handleTouchStart = useCallback((e) => {
    if (!e.touches || !e.touches[0]) return
    lastTouchTimeRef.current = Date.now()  // Mark that touch is being used
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    }
    currentDelta.current = { x: 0, y: 0 }
    elementRef.current = e.currentTarget  // Store element for tap detection
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
    } else if (onTap && Math.abs(deltaX) < 5 && Math.abs(deltaY) < 5 && elementRef.current) {
      // This was a tap (minimal movement), determine direction based on position
      const touch = e.changedTouches?.[0]
      if (touch) {
        const rect = elementRef.current.getBoundingClientRect()
        const centerX = rect.width / 2
        const centerY = rect.height / 2
        const tapX = touch.clientX - rect.left - centerX
        const tapY = touch.clientY - rect.top - centerY

        // Use transformDelta with tap position as if it were a swipe direction
        // Positive values mean tapped right/down, negative means tapped left/up
        const tapDelta = transformDelta(-tapX, -tapY, rotation)
        // Bias toward +1: only return -1 if tap is fully in bottom ~30% of cell
        // Use the correct axis based on rotation (vertical for 0/180, horizontal for 90/270)
        const normalizedRotation = ((rotation % 360) + 360) % 360
        const relevantCenter = (normalizedRotation === 90 || normalizedRotation === 270) ? centerX : centerY
        const biasThreshold = -relevantCenter * 0.4
        onTap(tapDelta >= biasThreshold ? 1 : -1)
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

  // Mouse support for desktop
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
    } else if (onTap && Math.abs(deltaX) < 5 && Math.abs(deltaY) < 5 && elementRef.current) {
      // This was a click (minimal movement), determine direction based on position
      const rect = elementRef.current.getBoundingClientRect()
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      const tapX = e.clientX - rect.left - centerX
      const tapY = e.clientY - rect.top - centerY

      // Use transformDelta with tap position as if it were a swipe direction
      const tapDelta = transformDelta(-tapX, -tapY, rotation)
      // Bias toward +1: only return -1 if tap is fully in bottom ~30% of cell
      // Use the correct axis based on rotation (vertical for 0/180, horizontal for 90/270)
      const normalizedRotation = ((rotation % 360) + 360) % 360
      const relevantCenter = (normalizedRotation === 90 || normalizedRotation === 270) ? centerX : centerY
      const biasThreshold = -relevantCenter * 0.4
      onTap(tapDelta >= biasThreshold ? 1 : -1)
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
    elementRef.current = e.currentTarget  // Store element for tap detection

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
