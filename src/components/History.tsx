import { useMemo } from 'react'
import { useGame } from '../context/GameContext'
import type { Player, HistoryProps } from '../types'

interface ProcessedEntry {
  id: string
  change: number
  newScore: number
  timestamp: number
}

interface PlayerHistory {
  player: Player
  entries: ProcessedEntry[]
}

export function History({ onClose }: HistoryProps) {
  const { state } = useGame()

  // Organize history by player with calculated scores
  const playerHistories = useMemo(() => {
    // Create a map of player histories
    const histories: Record<string, PlayerHistory> = {}

    // Initialize each player's history array
    state.players.forEach(player => {
      histories[player.id] = {
        player,
        entries: []
      }
    })

    // Build history entries with new scores
    // History is stored [newest, ..., oldest], so we work backwards
    const currentScores: Record<string, number> = {}
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
      className="dr-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-title"
    >
      <div className="dr-panel w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b dr-border">
          <h2 id="history-title" className="text-lg uppercase tracking-widest dr-text">Score History</h2>
          <button onClick={onClose} className="dialog-close dr-text-dim hover:dr-text" aria-label="Close history">&times;</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-3 sm:p-4">
          {state.history.length === 0 ? (
            <p className="text-center dr-text-dim uppercase tracking-wider py-8">
              No changes yet
            </p>
          ) : (
            <>
              {/* Scroll hint for mobile */}
              {state.players.length > 2 && (
                <p className="text-xs dr-text-dim text-center mb-3 sm:hidden">
                  ← Swipe to see all players →
                </p>
              )}
              <div className="flex gap-3 sm:gap-4 min-w-min pb-2 overflow-x-auto scrollbar-thin">
                {state.players.map(player => {
                  const history = playerHistories[player.id]
                  return (
                    <div key={player.id} className="flex-1 min-w-[100px] sm:min-w-[120px]">
                      {/* Player header */}
                      <div className="mb-3 pb-2 border-b dr-border">
                        <div
                          className="text-xs sm:text-sm uppercase tracking-wider font-bold mb-1 truncate"
                          style={{ color: player.color, textShadow: `0 0 10px ${player.color}80` }}
                        >
                          {player.name}
                        </div>
                        <div className="text-xs dr-text-dim">
                          {history.entries.length} {history.entries.length === 1 ? 'change' : 'changes'}
                        </div>
                      </div>

                      {/* History entries */}
                      <div className="space-y-2">
                        {history.entries.length === 0 ? (
                          <div className="text-xs dr-text-dim text-center py-4">
                            No changes
                          </div>
                        ) : (
                          history.entries.map(entry => (
                            <div
                              key={entry.id}
                              className="p-2 border dr-border bg-[var(--dr-bg)]"
                              style={{ borderRadius: 'var(--theme-border-radius)' }}
                            >
                              {/* Delta */}
                              <div
                                className={`text-center text-sm font-bold mb-1 ${entry.change > 0 ? 'text-positive glow-positive' : 'text-negative glow-negative'}`}
                              >
                                {entry.change > 0 ? '+' : ''}{entry.change}
                              </div>

                              {/* New score */}
                              <div
                                className="text-center text-lg font-bold tabular-nums"
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
            </>
          )}
        </div>
      </div>
    </div>
  )
}
