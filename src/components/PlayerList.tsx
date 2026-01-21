import { PLAYER_COLORS } from '../utils/colors'
import { MAX_PLAYER_NAME_LENGTH } from '../constants'
import type { PlayerListProps } from '../types'

export function PlayerList({
  players,
  editingPlayerId,
  usedColors,
  onEditPlayer,
  onColorChange,
  onRemovePlayer,
  onUpdatePlayerName,
}: PlayerListProps) {
  return (
    <div className="space-y-2 mb-3">
      {players.map((player) => (
        <div key={player.id} className="flex items-center gap-2 p-2 border dr-border">
          {/* Color selector */}
          <div className="relative shrink-0">
            <button
              className="w-8 h-8 border dr-border touch-manipulation"
              style={{ backgroundColor: player.color, borderRadius: 'var(--theme-border-radius)' }}
              onClick={() => onEditPlayer(editingPlayerId === player.id ? null : player.id)}
              aria-label={`Change color for ${player.name}`}
            />
            {editingPlayerId === player.id && (
              <div className="absolute top-full left-0 mt-1 p-2 dr-panel z-10 flex flex-wrap gap-1.5 w-36">
                {PLAYER_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => {
                      onColorChange(player.id, c.hex)
                      onEditPlayer(null)
                    }}
                    disabled={usedColors.includes(c.hex) && c.hex !== player.color}
                    className={`w-8 h-8 touch-manipulation ${usedColors.includes(c.hex) && c.hex !== player.color ? 'opacity-30' : ''}`}
                    style={{ backgroundColor: c.hex, borderRadius: 'var(--theme-border-radius)' }}
                    aria-label={`Select ${c.name} color`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Name input */}
          <input
            type="text"
            value={player.name}
            onChange={(e) => onUpdatePlayerName(player.id, e.target.value)}
            className="flex-1 min-w-0 bg-transparent border-none outline-none dr-text uppercase tracking-wide"
            maxLength={MAX_PLAYER_NAME_LENGTH}
            aria-label={`Name for ${player.name}`}
          />

          {/* Score display */}
          <span className="dr-text-dim text-sm shrink-0 w-10 text-right tabular-nums">{player.score}</span>

          {/* Remove button */}
          <button
            onClick={() => onRemovePlayer(player.id)}
            className="shrink-0 w-8 h-8 flex items-center justify-center dr-text-dim hover:text-red-400 text-xl touch-manipulation"
            aria-label={`Remove ${player.name}`}
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  )
}
