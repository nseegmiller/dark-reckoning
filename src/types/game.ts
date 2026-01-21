// Game-related type definitions

/** Valid theme identifiers */
export type Theme = 'atompunk' | 'nebula' | 'clear'

/** Theme display option for UI */
export interface ThemeOption {
  id: Theme
  name: string
  description: string
}

/** Valid rotation values (degrees) */
export type Rotation = 0 | 90 | 180 | 270

/** Player color definition */
export interface PlayerColor {
  name: string
  hex: string
}

/** Player entity */
export interface Player {
  id: string
  name: string
  color: string
  score: number
  /** Rotation in degrees. Always a multiple of 90. May exceed 270 for smooth animation. */
  rotation: number
}

/** History entry for score changes */
export interface HistoryEntry {
  id: string
  playerId: string
  change: number
  timestamp: number
}

/** Complete game state */
export interface GameState {
  theme: Theme
  players: Player[]
  history: HistoryEntry[]
}

/** Game context value */
export interface GameContextValue {
  state: GameState
  dispatch: React.Dispatch<GameAction>
}

// Re-export action types for convenience
import type { GameAction } from './actions'
export type { GameAction }
