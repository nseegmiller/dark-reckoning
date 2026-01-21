// Action type definitions for the game reducer

import type { GameState } from './game'

/** Action type constants */
export const ACTIONS = {
  LOAD_STATE: 'LOAD_STATE',
  SET_THEME: 'SET_THEME',
  ADD_PLAYER: 'ADD_PLAYER',
  REMOVE_PLAYER: 'REMOVE_PLAYER',
  UPDATE_PLAYER: 'UPDATE_PLAYER',
  ROTATE_PLAYER: 'ROTATE_PLAYER',
  ADJUST_SCORE: 'ADJUST_SCORE',
  UNDO: 'UNDO',
  NEW_GAME: 'NEW_GAME',
  CLEAR_ALL: 'CLEAR_ALL',
} as const

/** Type for action names */
export type ActionType = typeof ACTIONS[keyof typeof ACTIONS]

/** Player update payload */
export interface PlayerUpdatePayload {
  id: string
  updates: {
    name?: string
    color?: string
    score?: number
    rotation?: number
  }
}

/** Score adjustment payload */
export interface ScoreAdjustPayload {
  playerId: string
  change: number
}

/** Discriminated union of all game actions */
export type GameAction =
  | { type: typeof ACTIONS.LOAD_STATE; payload: Partial<GameState> }
  | { type: typeof ACTIONS.SET_THEME; payload: string }
  | { type: typeof ACTIONS.ADD_PLAYER; payload?: string }
  | { type: typeof ACTIONS.REMOVE_PLAYER; payload: string }
  | { type: typeof ACTIONS.UPDATE_PLAYER; payload: PlayerUpdatePayload }
  | { type: typeof ACTIONS.ROTATE_PLAYER; payload: string }
  | { type: typeof ACTIONS.ADJUST_SCORE; payload: ScoreAdjustPayload }
  | { type: typeof ACTIONS.UNDO }
  | { type: typeof ACTIONS.NEW_GAME }
  | { type: typeof ACTIONS.CLEAR_ALL }
