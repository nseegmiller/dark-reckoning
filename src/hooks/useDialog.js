import { useState, useCallback } from 'react'

/**
 * Hook for managing dialog/modal open/close state.
 *
 * Provides a simple interface for controlling dialog visibility
 * with memoized callbacks to prevent unnecessary re-renders.
 *
 * @param {boolean} [initialOpen=false] - Initial open state
 * @returns {Object} Dialog state and control functions
 *
 * @example
 * function MyComponent() {
 *   const settingsDialog = useDialog()
 *
 *   return (
 *     <>
 *       <button onClick={settingsDialog.open}>Open Settings</button>
 *       {settingsDialog.isOpen && (
 *         <SettingsDialog onClose={settingsDialog.close} />
 *       )}
 *     </>
 *   )
 * }
 */
export function useDialog(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen)

  /** Open the dialog */
  const open = useCallback(() => setIsOpen(true), [])

  /** Close the dialog */
  const close = useCallback(() => setIsOpen(false), [])

  /** Toggle the dialog open/closed */
  const toggle = useCallback(() => setIsOpen(prev => !prev), [])

  return {
    /** Whether the dialog is currently open */
    isOpen,
    /** Function to open the dialog */
    open,
    /** Function to close the dialog */
    close,
    /** Function to toggle the dialog */
    toggle,
  }
}
