import { useGame } from '../context/GameContext'
import { PlayerCell } from './PlayerCell'

export function PlayerGrid() {
  const { state } = useGame()

  if (state.players.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center pip-text-dim">
          <p className="text-xl uppercase tracking-widest mb-2">[ No Players ]</p>
          <p className="text-sm">Open settings to add players</p>
        </div>
      </div>
    )
  }

  // Determine grid layout based on player count
  const getGridClass = () => {
    const count = state.players.length
    if (count === 1) return 'grid-cols-1 grid-rows-1'
    if (count === 2) return 'grid-cols-1 grid-rows-2'
    if (count <= 4) return 'grid-cols-2 grid-rows-2'
    if (count <= 6) return 'grid-cols-2 grid-rows-3'
    return 'grid-cols-2 grid-rows-4'
  }

  return (
    <div className={`flex-1 grid ${getGridClass()} gap-px bg-[var(--theme-primary-dim)]`}>
      {state.players.map((player) => (
        <PlayerCell key={player.id} player={player} />
      ))}
    </div>
  )
}
