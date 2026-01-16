import { useGame, ACTIONS } from '../context/GameContext'

const MULTIPLIERS = [1, 5, 10]

export function Multiplier() {
  const { state, dispatch } = useGame()

  return (
    <div className="flex justify-center gap-3 py-2" role="group" aria-label="Score multiplier">
      {MULTIPLIERS.map((mult) => {
        const isActive = state.multiplier === mult
        return (
          <button
            key={mult}
            onClick={() => dispatch({ type: ACTIONS.SET_MULTIPLIER, payload: mult })}
            className={`
              relative px-6 py-2 font-bold text-lg uppercase tracking-wider
              transition-all duration-150 select-none
              ${isActive
                ? 'bg-game-accent text-white shadow-glow-lg scale-105'
                : 'bg-game-card border border-game-border text-gray-400 hover:border-game-accent hover:text-gray-200'
              }
            `}
            style={{
              clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)',
              fontFamily: 'Orbitron, monospace',
            }}
            aria-pressed={isActive}
            aria-label={`${mult}x multiplier`}
          >
            x{mult}
            {isActive && (
              <div className="absolute inset-0 bg-game-glow/20 animate-pulse-slow"
                   style={{ clipPath: 'inherit' }} aria-hidden="true" />
            )}
          </button>
        )
      })}
    </div>
  )
}
