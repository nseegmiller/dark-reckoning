import { useGame, ACTIONS } from '../context/GameContext'
import { useDialog } from '../hooks/useDialog'
import { History } from './History'
import { ChangeHistory } from './ChangeHistory'
import { VERSION } from '../version'
import { flushAndExecute } from '../constants'
import type { HeaderProps } from '../types'

export function Header({ onSettingsClick }: HeaderProps) {
  const { state, dispatch } = useGame()
  const historyDialog = useDialog()
  const changeHistoryDialog = useDialog()

  const handleUndo = () => {
    // Flush any pending score changes before undo
    flushAndExecute(() => {
      dispatch({ type: ACTIONS.UNDO })
    })
  }

  const handleShowHistory = () => {
    // Flush any pending score changes before opening history
    flushAndExecute(() => {
      historyDialog.open()
    })
  }

  return (
    <>
      <header className="flex-shrink-0 border-b dr-border px-3 sm:px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <h1 className="text-base sm:text-lg uppercase tracking-widest dr-text">
            <span className="sm:hidden">DR</span>
            <span className="hidden sm:inline">Dark Reckoning</span>
          </h1>
          <span
            onClick={changeHistoryDialog.open}
            className="text-xs dr-text-dim cursor-pointer hover:dr-text transition-colors"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && changeHistoryDialog.open()}
            aria-label="View change history"
          >
            {VERSION}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Undo button */}
          <button
            onClick={handleUndo}
            disabled={state.history.length === 0}
            className="dr-btn p-2 sm:py-1 sm:px-3 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Undo last score change"
          >
            <svg className="w-5 h-5 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a5 5 0 015 5v2M3 10l4-4m-4 4l4 4" />
            </svg>
            <span className="hidden sm:inline">Undo</span>
          </button>

          {/* History button */}
          <button
            onClick={handleShowHistory}
            className="dr-btn p-2 sm:py-1 sm:px-3"
            aria-label="View score history"
          >
            <svg className="w-5 h-5 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hidden sm:inline">History</span>
          </button>

          {/* Settings gear */}
          <button
            onClick={onSettingsClick}
            className="p-2 dr-text-dim hover:dr-text transition-colors"
            aria-label="Settings"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>

      {/* History popup */}
      {historyDialog.isOpen && <History onClose={historyDialog.close} />}

      {/* Change History popup */}
      {changeHistoryDialog.isOpen && <ChangeHistory onClose={changeHistoryDialog.close} />}
    </>
  )
}
