import { useState } from 'react'
import { useGame, ACTIONS } from '../context/GameContext'
import { History } from './History'
import { ChangeHistory } from './ChangeHistory'
import { VERSION } from '../version'
import { FLUSH_DELAY_MS } from '../constants'

export function Header({ onSettingsClick }) {
  const { state, dispatch } = useGame()
  const [showHistory, setShowHistory] = useState(false)
  const [showChangeHistory, setShowChangeHistory] = useState(false)

  const handleUndo = () => {
    // Flush any pending score changes before undo
    window.dispatchEvent(new CustomEvent('flushPendingScores'))
    // Small delay to ensure flush completes
    setTimeout(() => {
      dispatch({ type: ACTIONS.UNDO })
    }, FLUSH_DELAY_MS)
  }

  const handleShowHistory = () => {
    // Flush any pending score changes before opening history
    window.dispatchEvent(new CustomEvent('flushPendingScores'))
    setTimeout(() => {
      setShowHistory(true)
    }, FLUSH_DELAY_MS)
  }

  return (
    <>
      <header className="flex-shrink-0 border-b pip-border px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg uppercase tracking-widest pip-text">
            Dark Reckoning
          </h1>
          <span
            onClick={() => setShowChangeHistory(true)}
            className="text-xs pip-text-dim cursor-pointer hover:pip-text transition-colors"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setShowChangeHistory(true)}
            aria-label="View change history"
          >
            {VERSION}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Undo button */}
          <button
            onClick={handleUndo}
            disabled={state.history.length === 0}
            className="pip-btn py-1 px-3 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Undo last score change"
          >
            Undo
          </button>

          {/* History button */}
          <button
            onClick={handleShowHistory}
            className="pip-btn py-1 px-3"
            aria-label="View score history"
          >
            History
          </button>

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

      {/* History popup */}
      {showHistory && <History onClose={() => setShowHistory(false)} />}

      {/* Change History popup */}
      {showChangeHistory && <ChangeHistory onClose={() => setShowChangeHistory(false)} />}
    </>
  )
}
