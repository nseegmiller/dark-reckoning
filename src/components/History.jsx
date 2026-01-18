import { useMemo } from 'react'
import { useGame } from '../context/GameContext'

export function History({ onClose }) {
  const { state } = useGame()

  // Organize history by player with calculated scores
  const playerHistories = useMemo(() => {
    // Create a map of player histories
    const histories = {}

    // Initialize each player's history array
    state.players.forEach(player => {
      histories[player.id] = {
        player,
        entries: []
      }
    })

    // Build history entries with new scores
    // History is stored [newest, ..., oldest], so we work backwards
    const currentScores = {}
    state.players.forEach(p => {
      currentScores[p.id] = p.score
    })

    // Process history from newest to oldest
    state.history.forEach(entry => {
      if (histories[entry.playerId]) {
        const newScore = currentScores[entry.playerId]

        histories[entry.playerId].entries.push({
          id: entry.id,
          change: entry.change,
          newScore,
          timestamp: entry.timestamp
        })

        // Update current score for next iteration (subtract the change we just processed)
        currentScores[entry.playerId] = newScore - entry.change
      }
    })

    // Reverse entries so oldest is first
    Object.values(histories).forEach(h => {
      h.entries.reverse()
    })

    return histories
  }, [state.players, state.history])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-title"
    >
      <div className="pip-panel w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b pip-border">
          <h2 id="history-title" className="text-lg uppercase tracking-widest pip-text">Score History</h2>
          <button onClick={onClose} className="pip-text-dim hover:pip-text text-2xl" aria-label="Close history">&times;</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {state.history.length === 0 ? (
            <p className="text-center pip-text-dim uppercase tracking-wider py-8">
              No changes yet
            </p>
          ) : (
            <div className="flex gap-4 min-w-min">
              {state.players.map(player => {
                const history = playerHistories[player.id]
                return (
                  <div key={player.id} className="flex-1 min-w-[120px]">
                    {/* Player header */}
                    <div className="mb-3 pb-2 border-b pip-border">
                      <div
                        className="text-sm uppercase tracking-wider font-bold mb-1"
                        style={{ color: player.color, textShadow: `0 0 10px ${player.color}80` }}
                      >
                        {player.name}
                      </div>
                      <div className="text-xs pip-text-dim">
                        {history.entries.length} {history.entries.length === 1 ? 'change' : 'changes'}
                      </div>
                    </div>

                    {/* History entries */}
                    <div className="space-y-2">
                      {history.entries.length === 0 ? (
                        <div className="text-xs pip-text-dim text-center py-4">
                          No changes
                        </div>
                      ) : (
                        history.entries.map(entry => (
                          <div
                            key={entry.id}
                            className="p-2 border pip-border bg-[var(--pip-bg)]"
                          >
                            {/* Delta */}
                            <div
                              className="text-center text-sm font-bold mb-1"
                              style={{
                                color: entry.change > 0 ? '#4ade80' : '#f87171',
                                textShadow: entry.change > 0 ? '0 0 8px rgba(74, 222, 128, 0.6)' : '0 0 8px rgba(248, 113, 113, 0.6)'
                              }}
                            >
                              {entry.change > 0 ? '+' : ''}{entry.change}
                            </div>

                            {/* New score */}
                            <div
                              className="text-center text-lg font-bold"
                              style={{
                                color: player.color,
                                textShadow: `0 0 10px ${player.color}80`
                              }}
                            >
                              {entry.newScore}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
