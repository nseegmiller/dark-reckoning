export const PLAYER_COLORS = [
  { name: 'Red', hex: '#E53935' },
  { name: 'Yellow', hex: '#FFB300' },
  { name: 'Green', hex: '#43A047' },
  { name: 'Blue', hex: '#1E88E5' },
  { name: 'Purple', hex: '#8E24AA' },
  { name: 'Orange', hex: '#FB8C00' },
  { name: 'Teal', hex: '#00ACC1' },
  { name: 'Pink', hex: '#D81B60' },
]

export const getNextAvailableColor = (usedColors = []) => {
  if (!Array.isArray(usedColors)) {
    return PLAYER_COLORS[0]
  }

  const normalizedUsed = usedColors.filter(Boolean).map(c => c.toUpperCase())
  const available = PLAYER_COLORS.find(
    color => !normalizedUsed.includes(color.hex.toUpperCase())
  )

  if (available) {
    return available
  }

  // All colors in use - shouldn't happen with 8 player limit
  console.warn('All player colors in use')
  return PLAYER_COLORS[0]
}
