import { useGame } from '../context/GameContext'
import { PlayerCard } from './PlayerCard'

export function PlayerList() {
  const { state } = useGame()

  if (state.players.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-xl text-gray-600 uppercase tracking-widest mb-2">No Players</p>
        <p className="text-sm text-gray-700">Add players to begin</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {state.players.map((player) => (
        <PlayerCard key={player.id} player={player} />
      ))}
    </div>
  )
}
