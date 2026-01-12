export const PLAYER_COLORS = [
  { name: 'Red', hex: '#E53935', tailwind: 'bg-player-red' },
  { name: 'Yellow', hex: '#FFB300', tailwind: 'bg-player-amber' },
  { name: 'Green', hex: '#43A047', tailwind: 'bg-player-green' },
  { name: 'Blue', hex: '#1E88E5', tailwind: 'bg-player-blue' },
  { name: 'Purple', hex: '#8E24AA', tailwind: 'bg-player-purple' },
  { name: 'Orange', hex: '#FB8C00', tailwind: 'bg-player-orange' },
  { name: 'Teal', hex: '#00ACC1', tailwind: 'bg-player-teal' },
  { name: 'Pink', hex: '#D81B60', tailwind: 'bg-player-pink' },
]

export const getNextAvailableColor = (usedColors) => {
  const available = PLAYER_COLORS.find(color => !usedColors.includes(color.hex))
  return available || PLAYER_COLORS[0]
}
