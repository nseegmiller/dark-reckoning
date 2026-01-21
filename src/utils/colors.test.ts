import { describe, it, expect, vi } from 'vitest'
import { PLAYER_COLORS, getNextAvailableColor } from './colors'

describe('PLAYER_COLORS', () => {
  it('has 8 colors', () => {
    expect(PLAYER_COLORS).toHaveLength(8)
  })

  it('each color has name and hex', () => {
    PLAYER_COLORS.forEach(color => {
      expect(color).toHaveProperty('name')
      expect(color).toHaveProperty('hex')
      expect(typeof color.name).toBe('string')
      expect(typeof color.hex).toBe('string')
    })
  })

  it('each hex is valid color format', () => {
    const hexPattern = /^#[0-9A-Fa-f]{6}$/
    PLAYER_COLORS.forEach(color => {
      expect(color.hex).toMatch(hexPattern)
    })
  })

  it('all colors are unique', () => {
    const hexes = PLAYER_COLORS.map(c => c.hex)
    const uniqueHexes = new Set(hexes)
    expect(uniqueHexes.size).toBe(PLAYER_COLORS.length)
  })
})

describe('getNextAvailableColor', () => {
  it('returns first color when no colors used', () => {
    const result = getNextAvailableColor([])
    expect(result).toEqual(PLAYER_COLORS[0])
  })

  it('returns first color when undefined passed', () => {
    const result = getNextAvailableColor(undefined as unknown as string[])
    expect(result).toEqual(PLAYER_COLORS[0])
  })

  it('returns first color when non-array passed', () => {
    const result = getNextAvailableColor('not an array' as unknown as string[])
    expect(result).toEqual(PLAYER_COLORS[0])
  })

  it('returns second color when first is used', () => {
    const result = getNextAvailableColor([PLAYER_COLORS[0].hex])
    expect(result).toEqual(PLAYER_COLORS[1])
  })

  it('skips used colors', () => {
    const usedColors = [PLAYER_COLORS[0].hex, PLAYER_COLORS[1].hex]
    const result = getNextAvailableColor(usedColors)
    expect(result).toEqual(PLAYER_COLORS[2])
  })

  it('handles case-insensitive color matching', () => {
    const usedColors = [PLAYER_COLORS[0].hex.toLowerCase()]
    const result = getNextAvailableColor(usedColors)
    expect(result).toEqual(PLAYER_COLORS[1])
  })

  it('handles uppercase input', () => {
    const usedColors = [PLAYER_COLORS[0].hex.toUpperCase()]
    const result = getNextAvailableColor(usedColors)
    expect(result).toEqual(PLAYER_COLORS[1])
  })

  it('handles mixed case input', () => {
    // Mix up the case of the hex
    const mixedCase = PLAYER_COLORS[0].hex.split('').map((c, i) =>
      i % 2 === 0 ? c.toUpperCase() : c.toLowerCase()
    ).join('')

    const usedColors = [mixedCase]
    const result = getNextAvailableColor(usedColors)
    expect(result).toEqual(PLAYER_COLORS[1])
  })

  it('returns first available color in order', () => {
    // Use colors 0, 1, 3 (skip 2)
    const usedColors = [
      PLAYER_COLORS[0].hex,
      PLAYER_COLORS[1].hex,
      PLAYER_COLORS[3].hex,
    ]
    const result = getNextAvailableColor(usedColors)
    expect(result).toEqual(PLAYER_COLORS[2])
  })

  it('returns first color when all colors used', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const usedColors = PLAYER_COLORS.map(c => c.hex)
    const result = getNextAvailableColor(usedColors)

    expect(result).toEqual(PLAYER_COLORS[0])
    expect(consoleSpy).toHaveBeenCalledWith('All player colors in use')

    consoleSpy.mockRestore()
  })

  it('filters out falsy values from used colors', () => {
    const usedColors = [
      PLAYER_COLORS[0].hex,
      '',
      null as unknown as string,
      undefined as unknown as string,
      PLAYER_COLORS[1].hex,
    ]
    const result = getNextAvailableColor(usedColors)
    expect(result).toEqual(PLAYER_COLORS[2])
  })

  it('handles empty strings in used colors array', () => {
    const usedColors = ['', '', '']
    const result = getNextAvailableColor(usedColors)
    expect(result).toEqual(PLAYER_COLORS[0])
  })

  it('works with 7 colors used', () => {
    const usedColors = PLAYER_COLORS.slice(0, 7).map(c => c.hex)
    const result = getNextAvailableColor(usedColors)
    expect(result).toEqual(PLAYER_COLORS[7])
  })

  it('correctly identifies available colors regardless of order', () => {
    // Use colors in reverse order, leaving the first one available
    const usedColors = PLAYER_COLORS.slice(1).map(c => c.hex)
    const result = getNextAvailableColor(usedColors)
    expect(result).toEqual(PLAYER_COLORS[0])
  })
})
