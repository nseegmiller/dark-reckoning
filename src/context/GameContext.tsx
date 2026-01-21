import { createContext, useContext, useReducer, useEffect, useState, useRef } from 'react'
import { getNextAvailableColor } from '../utils/colors'
import {
  STORAGE_KEY,
  SAVE_DEBOUNCE_MS,
  MAX_PLAYERS,
  MAX_HISTORY_ENTRIES,
  VALID_THEMES,
  DEFAULT_THEME,
} from '../constants'
import { ACTIONS } from '../types'
import type { GameState, GameContextValue, GameAction, Player, HistoryEntry, Theme, GameProviderProps } from '../types'

const initialState: GameState = {
  theme: DEFAULT_THEME,
  players: [],
  history: [],
}

function generateId(): string {
  return crypto.randomUUID()
}

function validatePlayer(player: unknown): player is Player {
  return (
    player !== null &&
    typeof player === 'object' &&
    typeof (player as Player).id === 'string' &&
    typeof (player as Player).name === 'string' &&
    typeof (player as Player).color === 'string' &&
    typeof (player as Player).score === 'number'
  )
}

function validateHistoryEntry(entry: unknown): entry is HistoryEntry {
  return (
    entry !== null &&
    typeof entry === 'object' &&
    typeof (entry as HistoryEntry).id === 'string' &&
    typeof (entry as HistoryEntry).playerId === 'string' &&
    typeof (entry as HistoryEntry).change === 'number' &&
    typeof (entry as HistoryEntry).timestamp === 'number'
  )
}

function validateTheme(value: unknown, fallback: Theme): Theme {
  return (VALID_THEMES as readonly string[]).includes(value as string)
    ? (value as Theme)
    : fallback
}

function validateRotation(value: unknown): number {
  if (typeof value === 'number') {
    // Normalize to 0-270 range and snap to valid rotation (multiple of 90)
    const normalized = ((value % 360) + 360) % 360
    return Math.round(normalized / 90) * 90 % 360
  }
  return 0
}

function validateLoadedState(payload: unknown): GameState | null {
  if (!payload || typeof payload !== 'object') {
    return null
  }

  const data = payload as Record<string, unknown>

  // Validate theme - must be one of the valid themes
  const theme = validateTheme(data.theme, DEFAULT_THEME)

  const validatedState: GameState = {
    theme,
    players: [],
    history: [],
  }

  if (Array.isArray(data.players)) {
    validatedState.players = data.players
      .filter(validatePlayer)
      .map(p => ({
        id: p.id,
        name: p.name,
        color: p.color,
        score: p.score,
        rotation: validateRotation(p.rotation),
      }))
  }

  if (Array.isArray(data.history)) {
    validatedState.history = data.history
      .filter(validateHistoryEntry)
      .slice(0, MAX_HISTORY_ENTRIES)
  }

  return validatedState
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case ACTIONS.LOAD_STATE: {
      const validated = validateLoadedState(action.payload)
      if (!validated) {
        console.warn('Invalid state in localStorage, using defaults')
        return initialState
      }
      return validated
    }

    case ACTIONS.SET_THEME: {
      const newTheme = validateTheme(action.payload, state.theme)
      return { ...state, theme: newTheme }
    }

    case ACTIONS.ADD_PLAYER: {
      if (state.players.length >= MAX_PLAYERS) return state
      const usedColors = state.players.map(p => p.color)
      const color = getNextAvailableColor(usedColors)
      const newPlayer: Player = {
        id: generateId(),
        name: action.payload || `Player ${state.players.length + 1}`,
        color: color.hex,
        score: 0,
        rotation: 0,
      }
      return { ...state, players: [...state.players, newPlayer] }
    }

    case ACTIONS.REMOVE_PLAYER:
      return {
        ...state,
        players: state.players.filter(p => p.id !== action.payload),
        history: state.history.filter(h => h.playerId !== action.payload),
      }

    case ACTIONS.UPDATE_PLAYER:
      return {
        ...state,
        players: state.players.map(p =>
          p.id === action.payload.id ? { ...p, ...action.payload.updates } : p
        ),
      }

    case ACTIONS.ROTATE_PLAYER: {
      return {
        ...state,
        players: state.players.map(p => {
          if (p.id === action.payload) {
            // Add 90 degrees. Value may exceed 270 for smooth CSS animation.
            // PlayerCell handles normalization for visual display.
            return { ...p, rotation: p.rotation + 90 }
          }
          return p
        }),
      }
    }

    case ACTIONS.ADJUST_SCORE: {
      const { playerId, change } = action.payload
      const historyEntry: HistoryEntry = {
        id: generateId(),
        playerId,
        change,
        timestamp: Date.now(),
      }
      return {
        ...state,
        players: state.players.map(p =>
          p.id === playerId ? { ...p, score: p.score + change } : p
        ),
        history: [historyEntry, ...state.history].slice(0, MAX_HISTORY_ENTRIES),
      }
    }

    case ACTIONS.UNDO: {
      if (state.history.length === 0) return state
      const [lastEntry, ...remainingHistory] = state.history
      return {
        ...state,
        players: state.players.map(p =>
          p.id === lastEntry.playerId
            ? { ...p, score: p.score - lastEntry.change }
            : p
        ),
        history: remainingHistory,
      }
    }

    case ACTIONS.NEW_GAME:
      return {
        ...state,
        players: state.players.map(p => ({ ...p, score: 0 })),
        history: [],
      }

    case ACTIONS.CLEAR_ALL:
      return { ...initialState, theme: state.theme }

    default:
      return state
  }
}

const GameContext = createContext<GameContextValue | null>(null)

function saveToLocalStorage(state: GameState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    return true
  } catch (e) {
    if (e instanceof Error && e.name === 'QuotaExceededError') {
      // Try saving with truncated history
      const truncatedState = {
        ...state,
        history: state.history.slice(0, 20),
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(truncatedState))
        console.warn('localStorage quota exceeded, saved with truncated history')
        return true
      } catch (e2) {
        console.error('Failed to save state even with truncation:', e2)
      }
    } else {
      console.error('Failed to save state:', e)
    }
    return false
  }
}

export function GameProvider({ children }: GameProviderProps) {
  const [state, dispatch] = useReducer(gameReducer, initialState)
  const [isLoaded, setIsLoaded] = useState(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        dispatch({ type: ACTIONS.LOAD_STATE, payload: parsed })
      }
    } catch (e) {
      console.error('Failed to load state:', e)
    }
    setIsLoaded(true)
  }, [])

  // Debounced save to localStorage on change (only after initial load)
  useEffect(() => {
    if (!isLoaded) return

    // Clear any pending save
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
    }

    // Debounce the save
    saveTimerRef.current = setTimeout(() => {
      saveToLocalStorage(state)
    }, SAVE_DEBOUNCE_MS)

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
      }
    }
  }, [state, isLoaded])

  // Apply theme class to document
  useEffect(() => {
    // Remove all theme classes
    VALID_THEMES.forEach(theme => {
      document.documentElement.classList.remove(`theme-${theme}`)
    })
    // Add current theme class
    document.documentElement.classList.add(`theme-${state.theme}`)
  }, [state.theme])

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame(): GameContextValue {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}

// Re-export ACTIONS for convenience
export { ACTIONS }
