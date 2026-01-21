// Shared constants used across the application

import type { Theme, ThemeOption } from './types'

// ============================================================================
// Player Limits
// ============================================================================

/** Maximum number of players allowed in a game */
export const MAX_PLAYERS = 8

/** Maximum character length for player names */
export const MAX_PLAYER_NAME_LENGTH = 12

// ============================================================================
// History
// ============================================================================

/** Maximum number of history entries to keep */
export const MAX_HISTORY_ENTRIES = 100

// ============================================================================
// Timing Constants
// ============================================================================

/** Delay in ms to wait for pending score changes to flush before actions */
export const FLUSH_DELAY_MS = 50

/** Debounce time in ms before committing accumulated score changes */
export const COMMIT_DEBOUNCE_MS = 2000

/** Debounce time in ms before saving state to localStorage */
export const SAVE_DEBOUNCE_MS = 500

// ============================================================================
// Swipe/Touch Interaction
// ============================================================================

/** Minimum pixels of movement to register as a swipe (vs tap) */
export const SWIPE_THRESHOLD_PX = 20

/** Number of pixels of swipe movement per score unit */
export const PIXELS_PER_SCORE_UNIT = 30

/** Maximum pixels of movement to still count as a tap */
export const TAP_THRESHOLD_PX = 5

// ============================================================================
// Themes
// ============================================================================

/** List of valid theme identifiers */
export const VALID_THEMES: Theme[] = ['atompunk', 'nebula', 'clear']

/** Default theme when none is set or invalid */
export const DEFAULT_THEME: Theme = 'atompunk'

/** Theme display options for UI components */
export const THEME_OPTIONS: ThemeOption[] = [
  { id: 'atompunk', name: 'Atom', description: 'Terminal' },
  { id: 'nebula', name: 'Nebula', description: 'Space' },
  { id: 'clear', name: 'Clear', description: 'Readable' },
]

// ============================================================================
// Storage
// ============================================================================

/** localStorage key for persisting game state */
export const STORAGE_KEY = 'darkReckoning'

// ============================================================================
// Custom Events
// ============================================================================

/**
 * Event name for flushing pending score changes.
 *
 * This custom event is dispatched before actions that need consistent state
 * (undo, history view, new game, clear all). PlayerCell components listen
 * for this event and immediately commit any accumulated score changes.
 *
 * Usage:
 *   window.dispatchEvent(new CustomEvent(FLUSH_SCORES_EVENT))
 *
 * After dispatching, wait FLUSH_DELAY_MS before proceeding to ensure
 * all listeners have processed the event.
 */
export const FLUSH_SCORES_EVENT = 'flushPendingScores'

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Dispatch flush event and execute callback after delay.
 * Use this before any action that requires all pending scores to be committed.
 *
 * @param callback - Function to execute after flush completes
 */
export function flushAndExecute(callback: () => void): void {
  window.dispatchEvent(new CustomEvent(FLUSH_SCORES_EVENT))
  setTimeout(callback, FLUSH_DELAY_MS)
}
