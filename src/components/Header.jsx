import { useState } from 'react'
import { useGame } from '../context/GameContext'

export function Header({ onSettingsClick }) {
  const { state, dispatch } = useGame()
  const [showMultiplier, setShowMultiplier] = useState(false)

  const handleMultiplierSelect = (mult) => {
    dispatch({ type: 'SET_MULTIPLIER', payload: mult })
    setShowMultiplier(false)
  }

  return (
    <header className="flex-shrink-0 border-b pip-border px-4 py-2 flex items-center justify-between">
      <h1 className="text-lg uppercase tracking-widest pip-text">
        Dark Reckoning
      </h1>

      <div className="flex items-center gap-4">
        {/* Multiplier selector */}
        <div className="relative">
          <button
            onClick={() => setShowMultiplier(!showMultiplier)}
            className="pip-btn py-1 px-3"
          >
            x{state.multiplier}
          </button>

          {showMultiplier && (
            <>
              {/* Backdrop to close */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMultiplier(false)}
              />

              {/* Popup */}
              <div className="absolute top-full right-0 mt-2 pip-panel z-50 p-2 flex flex-col gap-1 min-w-[80px]">
                {[1, 5, 10, 25, 50, 100].map((mult) => (
                  <button
                    key={mult}
                    onClick={() => handleMultiplierSelect(mult)}
                    className={`pip-btn py-1 text-center ${state.multiplier === mult ? 'pip-btn-active' : ''}`}
                  >
                    x{mult}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Settings gear */}
        <button
          onClick={onSettingsClick}
          className="p-2 pip-text-dim hover:pip-text transition-colors"
          aria-label="Settings"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </header>
  )
}
