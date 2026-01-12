import { useGame } from '../context/GameContext'

export function History({ onClose }) {
  const { state } = useGame()

  const getPlayerName = (playerId) => {
    const player = state.players.find(p => p.id === playerId)
    return player?.name || 'Unknown'
  }

  const getPlayerColor = (playerId) => {
    const player = state.players.find(p => p.id === playerId)
    return player?.color || '#888'
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div
        className="bg-game-card border border-game-border w-full max-w-md max-h-[80vh] flex flex-col"
        style={{ clipPath: 'polygon(16px 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%, 0 16px)' }}
      >
        {/* Header */}
        <div className="relative flex items-center justify-between p-4 border-b border-game-border">
          <div className="absolute top-0 left-4 right-4 h-0.5 bg-game-accent" style={{ boxShadow: '0 0 10px rgba(99, 102, 241, 0.5)' }} />
          <h2 className="text-lg font-bold uppercase tracking-widest text-game-glow pt-2"
              style={{ fontFamily: 'Orbitron, monospace' }}>
            History
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {state.history.length === 0 ? (
            <p className="text-center text-gray-600 uppercase tracking-wider py-8">
              No changes yet
            </p>
          ) : (
            <ul className="space-y-2">
              {state.history.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center gap-3 p-3 bg-game-bg/50 border border-game-border/50"
                  style={{ clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)' }}
                >
                  <div
                    className="w-2 h-8 flex-shrink-0"
                    style={{ backgroundColor: getPlayerColor(entry.playerId), boxShadow: `0 0 8px ${getPlayerColor(entry.playerId)}` }}
                  />
                  <span className="flex-1 font-semibold uppercase tracking-wide text-sm">
                    {getPlayerName(entry.playerId)}
                  </span>
                  <span
                    className={`font-bold tabular-nums ${entry.change > 0 ? 'text-green-400' : 'text-red-400'}`}
                    style={{ fontFamily: 'Orbitron, monospace' }}
                  >
                    {entry.change > 0 ? '+' : ''}{entry.change}
                  </span>
                  <span className="text-xs text-gray-600 tabular-nums">
                    {formatTime(entry.timestamp)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
