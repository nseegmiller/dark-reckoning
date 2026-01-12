import { PLAYER_COLORS } from '../utils/colors'

export function ColorPicker({ currentColor, usedColors, onSelect, onClose }) {
  return (
    <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-game-card border border-game-border z-20"
         style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}>
      <div className="flex flex-wrap gap-3 justify-center">
        {PLAYER_COLORS.map((color) => {
          const isUsed = usedColors.includes(color.hex) && color.hex !== currentColor
          const isSelected = color.hex === currentColor

          return (
            <button
              key={color.hex}
              onClick={() => !isUsed && onSelect(color.hex)}
              disabled={isUsed}
              className={`
                w-10 h-10 rounded-sm transition-all border-2
                ${isUsed ? 'opacity-30 cursor-not-allowed border-transparent' : 'cursor-pointer hover:scale-110 border-transparent hover:border-white/50'}
                ${isSelected ? 'ring-2 ring-game-accent ring-offset-2 ring-offset-game-card scale-110' : ''}
              `}
              style={{
                backgroundColor: color.hex,
                boxShadow: isUsed ? 'none' : `0 0 15px ${color.hex}60`
              }}
              aria-label={`${color.name}${isUsed ? ' (in use)' : ''}`}
            />
          )
        })}
      </div>
      <button
        onClick={onClose}
        className="mt-4 w-full py-2 text-sm uppercase tracking-wider text-gray-500 hover:text-gray-300 transition-colors"
      >
        Cancel
      </button>
    </div>
  )
}
