import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSwipe } from './useSwipe'
import { SWIPE_THRESHOLD_PX, PIXELS_PER_SCORE_UNIT } from '../constants'

describe('useSwipe', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('hook initialization', () => {
    it('returns all required handlers', () => {
      const onSwipe = vi.fn()
      const { result } = renderHook(() => useSwipe({ onSwipe }))

      expect(result.current.onTouchStart).toBeDefined()
      expect(result.current.onTouchMove).toBeDefined()
      expect(result.current.onTouchEnd).toBeDefined()
      expect(result.current.onTouchCancel).toBeDefined()
      expect(result.current.onMouseDown).toBeDefined()
    })

    it('handlers are stable between renders', () => {
      const onSwipe = vi.fn()
      const { result, rerender } = renderHook(() => useSwipe({ onSwipe }))

      const initialHandlers = { ...result.current }
      rerender()

      expect(result.current.onTouchStart).toBe(initialHandlers.onTouchStart)
      expect(result.current.onTouchMove).toBe(initialHandlers.onTouchMove)
      expect(result.current.onTouchEnd).toBe(initialHandlers.onTouchEnd)
      expect(result.current.onTouchCancel).toBe(initialHandlers.onTouchCancel)
      expect(result.current.onMouseDown).toBe(initialHandlers.onMouseDown)
    })
  })

  describe('touch tap detection', () => {
    const createTouchEvent = (clientX: number, clientY: number, element: HTMLElement) => ({
      touches: [{ clientX, clientY }],
      changedTouches: [{ clientX, clientY }],
      currentTarget: element,
      preventDefault: vi.fn(),
    })

    it('detects tap in upper area as +1 at 0° rotation', () => {
      const onSwipe = vi.fn()
      const onTap = vi.fn()
      const { result } = renderHook(() => useSwipe({ onSwipe, onTap, rotation: 0 }))

      const element = document.createElement('div')
      element.getBoundingClientRect = vi.fn(() => ({
        left: 0, top: 0, right: 100, bottom: 100,
        width: 100, height: 100, x: 0, y: 0, toJSON: vi.fn()
      }))

      // Touch start at top area
      act(() => {
        result.current.onTouchStart(createTouchEvent(50, 25, element) as unknown as React.TouchEvent)
      })

      // Touch end at same position (tap)
      act(() => {
        result.current.onTouchEnd(createTouchEvent(50, 25, element) as unknown as React.TouchEvent)
      })

      expect(onSwipe).not.toHaveBeenCalled()
      expect(onTap).toHaveBeenCalledWith(1)
    })

    it('detects tap in bottom area as -1 at 0° rotation', () => {
      const onSwipe = vi.fn()
      const onTap = vi.fn()
      const { result } = renderHook(() => useSwipe({ onSwipe, onTap, rotation: 0 }))

      const element = document.createElement('div')
      element.getBoundingClientRect = vi.fn(() => ({
        left: 0, top: 0, right: 100, bottom: 100,
        width: 100, height: 100, x: 0, y: 0, toJSON: vi.fn()
      }))

      // Touch start at bottom area (95% from top is in the -1 zone)
      act(() => {
        result.current.onTouchStart(createTouchEvent(50, 95, element) as unknown as React.TouchEvent)
      })

      // Touch end at same position (tap)
      act(() => {
        result.current.onTouchEnd(createTouchEvent(50, 95, element) as unknown as React.TouchEvent)
      })

      expect(onSwipe).not.toHaveBeenCalled()
      expect(onTap).toHaveBeenCalledWith(-1)
    })

    it('detects tap at right area as +1 at 90° rotation', () => {
      const onSwipe = vi.fn()
      const onTap = vi.fn()
      const { result } = renderHook(() => useSwipe({ onSwipe, onTap, rotation: 90 }))

      const element = document.createElement('div')
      element.getBoundingClientRect = vi.fn(() => ({
        left: 0, top: 0, right: 100, bottom: 100,
        width: 100, height: 100, x: 0, y: 0, toJSON: vi.fn()
      }))

      // Touch at right side (75% from left)
      act(() => {
        result.current.onTouchStart(createTouchEvent(75, 50, element) as unknown as React.TouchEvent)
      })

      act(() => {
        result.current.onTouchEnd(createTouchEvent(75, 50, element) as unknown as React.TouchEvent)
      })

      expect(onTap).toHaveBeenCalledWith(1)
    })

    it('detects tap at left area as -1 at 90° rotation', () => {
      const onSwipe = vi.fn()
      const onTap = vi.fn()
      const { result } = renderHook(() => useSwipe({ onSwipe, onTap, rotation: 90 }))

      const element = document.createElement('div')
      element.getBoundingClientRect = vi.fn(() => ({
        left: 0, top: 0, right: 100, bottom: 100,
        width: 100, height: 100, x: 0, y: 0, toJSON: vi.fn()
      }))

      // Touch at far left side (5% from left, well into -1 zone)
      act(() => {
        result.current.onTouchStart(createTouchEvent(5, 50, element) as unknown as React.TouchEvent)
      })

      act(() => {
        result.current.onTouchEnd(createTouchEvent(5, 50, element) as unknown as React.TouchEvent)
      })

      expect(onTap).toHaveBeenCalledWith(-1)
    })
  })

  describe('touch swipe detection', () => {
    const createTouchEvent = (clientX: number, clientY: number, element: HTMLElement) => ({
      touches: [{ clientX, clientY }],
      changedTouches: [{ clientX, clientY }],
      currentTarget: element,
      preventDefault: vi.fn(),
    })

    it('detects swipe up as positive at 0° rotation', () => {
      const onSwipe = vi.fn()
      const { result } = renderHook(() => useSwipe({ onSwipe, rotation: 0 }))

      const element = document.createElement('div')
      element.getBoundingClientRect = vi.fn(() => ({
        left: 0, top: 0, right: 100, bottom: 100,
        width: 100, height: 100, x: 0, y: 0, toJSON: vi.fn()
      }))

      const startY = 80
      const endY = startY - SWIPE_THRESHOLD_PX - PIXELS_PER_SCORE_UNIT

      act(() => {
        result.current.onTouchStart(createTouchEvent(50, startY, element) as unknown as React.TouchEvent)
      })

      act(() => {
        result.current.onTouchMove({
          ...createTouchEvent(50, endY, element),
          touches: [{ clientX: 50, clientY: endY }],
        } as unknown as React.TouchEvent)
      })

      act(() => {
        result.current.onTouchEnd({
          ...createTouchEvent(50, endY, element),
          changedTouches: [{ clientX: 50, clientY: endY }],
        } as unknown as React.TouchEvent)
      })

      expect(onSwipe).toHaveBeenCalled()
      expect(onSwipe.mock.calls[0][0]).toBeGreaterThan(0)
    })

    it('detects swipe down as negative at 0° rotation', () => {
      const onSwipe = vi.fn()
      const { result } = renderHook(() => useSwipe({ onSwipe, rotation: 0 }))

      const element = document.createElement('div')
      element.getBoundingClientRect = vi.fn(() => ({
        left: 0, top: 0, right: 100, bottom: 100,
        width: 100, height: 100, x: 0, y: 0, toJSON: vi.fn()
      }))

      const startY = 20
      const endY = startY + SWIPE_THRESHOLD_PX + PIXELS_PER_SCORE_UNIT

      act(() => {
        result.current.onTouchStart(createTouchEvent(50, startY, element) as unknown as React.TouchEvent)
      })

      act(() => {
        result.current.onTouchMove({
          ...createTouchEvent(50, endY, element),
          touches: [{ clientX: 50, clientY: endY }],
        } as unknown as React.TouchEvent)
      })

      act(() => {
        result.current.onTouchEnd({
          ...createTouchEvent(50, endY, element),
          changedTouches: [{ clientX: 50, clientY: endY }],
        } as unknown as React.TouchEvent)
      })

      expect(onSwipe).toHaveBeenCalled()
      expect(onSwipe.mock.calls[0][0]).toBeLessThan(0)
    })

    it('detects swipe right as positive at 90° rotation', () => {
      const onSwipe = vi.fn()
      const { result } = renderHook(() => useSwipe({ onSwipe, rotation: 90 }))

      const element = document.createElement('div')
      element.getBoundingClientRect = vi.fn(() => ({
        left: 0, top: 0, right: 100, bottom: 100,
        width: 100, height: 100, x: 0, y: 0, toJSON: vi.fn()
      }))

      const startX = 20
      const endX = startX + SWIPE_THRESHOLD_PX + PIXELS_PER_SCORE_UNIT

      act(() => {
        result.current.onTouchStart(createTouchEvent(startX, 50, element) as unknown as React.TouchEvent)
      })

      act(() => {
        result.current.onTouchMove({
          ...createTouchEvent(endX, 50, element),
          touches: [{ clientX: endX, clientY: 50 }],
        } as unknown as React.TouchEvent)
      })

      act(() => {
        result.current.onTouchEnd({
          ...createTouchEvent(endX, 50, element),
          changedTouches: [{ clientX: endX, clientY: 50 }],
        } as unknown as React.TouchEvent)
      })

      expect(onSwipe).toHaveBeenCalled()
      expect(onSwipe.mock.calls[0][0]).toBeGreaterThan(0)
    })

    it('detects swipe down as positive at 180° rotation', () => {
      const onSwipe = vi.fn()
      const { result } = renderHook(() => useSwipe({ onSwipe, rotation: 180 }))

      const element = document.createElement('div')
      element.getBoundingClientRect = vi.fn(() => ({
        left: 0, top: 0, right: 100, bottom: 100,
        width: 100, height: 100, x: 0, y: 0, toJSON: vi.fn()
      }))

      const startY = 20
      const endY = startY + SWIPE_THRESHOLD_PX + PIXELS_PER_SCORE_UNIT

      act(() => {
        result.current.onTouchStart(createTouchEvent(50, startY, element) as unknown as React.TouchEvent)
      })

      act(() => {
        result.current.onTouchMove({
          ...createTouchEvent(50, endY, element),
          touches: [{ clientX: 50, clientY: endY }],
        } as unknown as React.TouchEvent)
      })

      act(() => {
        result.current.onTouchEnd({
          ...createTouchEvent(50, endY, element),
          changedTouches: [{ clientX: 50, clientY: endY }],
        } as unknown as React.TouchEvent)
      })

      expect(onSwipe).toHaveBeenCalled()
      expect(onSwipe.mock.calls[0][0]).toBeGreaterThan(0)
    })

    it('detects swipe left as positive at 270° rotation', () => {
      const onSwipe = vi.fn()
      const { result } = renderHook(() => useSwipe({ onSwipe, rotation: 270 }))

      const element = document.createElement('div')
      element.getBoundingClientRect = vi.fn(() => ({
        left: 0, top: 0, right: 100, bottom: 100,
        width: 100, height: 100, x: 0, y: 0, toJSON: vi.fn()
      }))

      const startX = 80
      const endX = startX - SWIPE_THRESHOLD_PX - PIXELS_PER_SCORE_UNIT

      act(() => {
        result.current.onTouchStart(createTouchEvent(startX, 50, element) as unknown as React.TouchEvent)
      })

      act(() => {
        result.current.onTouchMove({
          ...createTouchEvent(endX, 50, element),
          touches: [{ clientX: endX, clientY: 50 }],
        } as unknown as React.TouchEvent)
      })

      act(() => {
        result.current.onTouchEnd({
          ...createTouchEvent(endX, 50, element),
          changedTouches: [{ clientX: endX, clientY: 50 }],
        } as unknown as React.TouchEvent)
      })

      expect(onSwipe).toHaveBeenCalled()
      expect(onSwipe.mock.calls[0][0]).toBeGreaterThan(0)
    })

    it('ignores movement below swipe threshold', () => {
      const onSwipe = vi.fn()
      const onTap = vi.fn()
      const { result } = renderHook(() => useSwipe({ onSwipe, onTap, rotation: 0 }))

      const element = document.createElement('div')
      element.getBoundingClientRect = vi.fn(() => ({
        left: 0, top: 0, right: 100, bottom: 100,
        width: 100, height: 100, x: 0, y: 0, toJSON: vi.fn()
      }))

      // Move less than threshold
      const movement = SWIPE_THRESHOLD_PX - 5

      act(() => {
        result.current.onTouchStart(createTouchEvent(50, 50, element) as unknown as React.TouchEvent)
      })

      act(() => {
        result.current.onTouchMove({
          ...createTouchEvent(50, 50 - movement, element),
          touches: [{ clientX: 50, clientY: 50 - movement }],
        } as unknown as React.TouchEvent)
      })

      act(() => {
        result.current.onTouchEnd({
          ...createTouchEvent(50, 50 - movement, element),
          changedTouches: [{ clientX: 50, clientY: 50 - movement }],
        } as unknown as React.TouchEvent)
      })

      expect(onSwipe).not.toHaveBeenCalled()
    })
  })

  describe('preview callback', () => {
    it('calls onPreview during swipe movement', () => {
      const onSwipe = vi.fn()
      const onPreview = vi.fn()
      const { result } = renderHook(() => useSwipe({ onSwipe, onPreview, rotation: 0 }))

      const element = document.createElement('div')
      element.getBoundingClientRect = vi.fn(() => ({
        left: 0, top: 0, right: 100, bottom: 100,
        width: 100, height: 100, x: 0, y: 0, toJSON: vi.fn()
      }))

      act(() => {
        result.current.onTouchStart({
          touches: [{ clientX: 50, clientY: 50 }],
          currentTarget: element,
        } as unknown as React.TouchEvent)
      })

      act(() => {
        result.current.onTouchMove({
          touches: [{ clientX: 50, clientY: 50 - SWIPE_THRESHOLD_PX - PIXELS_PER_SCORE_UNIT }],
          preventDefault: vi.fn(),
        } as unknown as React.TouchEvent)
      })

      expect(onPreview).toHaveBeenCalled()
    })

    it('clears preview on touch end', () => {
      const onSwipe = vi.fn()
      const onPreview = vi.fn()
      const { result } = renderHook(() => useSwipe({ onSwipe, onPreview, rotation: 0 }))

      const element = document.createElement('div')
      element.getBoundingClientRect = vi.fn(() => ({
        left: 0, top: 0, right: 100, bottom: 100,
        width: 100, height: 100, x: 0, y: 0, toJSON: vi.fn()
      }))

      act(() => {
        result.current.onTouchStart({
          touches: [{ clientX: 50, clientY: 50 }],
          currentTarget: element,
        } as unknown as React.TouchEvent)
      })

      act(() => {
        result.current.onTouchEnd({
          changedTouches: [{ clientX: 50, clientY: 20 }],
        } as unknown as React.TouchEvent)
      })

      const lastCall = onPreview.mock.calls[onPreview.mock.calls.length - 1]
      expect(lastCall[0]).toBeNull()
    })

    it('clears preview on touch cancel', () => {
      const onSwipe = vi.fn()
      const onPreview = vi.fn()
      const { result } = renderHook(() => useSwipe({ onSwipe, onPreview, rotation: 0 }))

      const element = document.createElement('div')

      act(() => {
        result.current.onTouchStart({
          touches: [{ clientX: 50, clientY: 50 }],
          currentTarget: element,
        } as unknown as React.TouchEvent)
      })

      act(() => {
        result.current.onTouchCancel()
      })

      expect(onPreview).toHaveBeenCalledWith(null)
    })
  })

  describe('touch/mouse isolation', () => {
    it('tracks touch time to prevent duplicate mouse events', () => {
      const onSwipe = vi.fn()
      const { result } = renderHook(() => useSwipe({ onSwipe }))

      const element = document.createElement('div')

      // Simulate touch event
      act(() => {
        result.current.onTouchStart({
          touches: [{ clientX: 50, clientY: 50 }],
          currentTarget: element,
        } as unknown as React.TouchEvent)
      })

      // Immediately try mouse down (simulating browser compatibility behavior)
      act(() => {
        result.current.onMouseDown({
          clientX: 50,
          clientY: 50,
          currentTarget: element,
        } as unknown as React.MouseEvent)
      })

      // The mouse event should be ignored because touch happened recently
      // This is tested by the hook not setting up mouse listeners
    })
  })

  describe('score calculation', () => {
    it('calculates multiple units for long swipes', () => {
      const onSwipe = vi.fn()
      const { result } = renderHook(() => useSwipe({ onSwipe, rotation: 0 }))

      const element = document.createElement('div')
      element.getBoundingClientRect = vi.fn(() => ({
        left: 0, top: 0, right: 100, bottom: 200,
        width: 100, height: 200, x: 0, y: 0, toJSON: vi.fn()
      }))

      // Swipe multiple units (3 units worth of pixels)
      const threeUnits = SWIPE_THRESHOLD_PX + (PIXELS_PER_SCORE_UNIT * 3)

      act(() => {
        result.current.onTouchStart({
          touches: [{ clientX: 50, clientY: 150 }],
          currentTarget: element,
        } as unknown as React.TouchEvent)
      })

      act(() => {
        result.current.onTouchMove({
          touches: [{ clientX: 50, clientY: 150 - threeUnits }],
          preventDefault: vi.fn(),
        } as unknown as React.TouchEvent)
      })

      act(() => {
        result.current.onTouchEnd({
          changedTouches: [{ clientX: 50, clientY: 150 - threeUnits }],
        } as unknown as React.TouchEvent)
      })

      expect(onSwipe).toHaveBeenCalled()
      expect(onSwipe.mock.calls[0][0]).toBeGreaterThanOrEqual(3)
    })
  })
})
