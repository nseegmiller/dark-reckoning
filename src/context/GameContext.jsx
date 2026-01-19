import { createContext, useContext, useReducer, useEffect, useState, useRef } from 'react'
import { getNextAvailableColor } from '../utils/colors'

const STORAGE_KEY = 'darkReckoning'
const SAVE_DEBOUNCE_MS = 500

// Action type constants
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
}

const initialState = {
  theme: 'atompunk',
  players: [],
  history: [],
}

function generateId() {
  return crypto.randomUUID()
}

function validatePlayer(player) {
  return (
    player &&
    typeof player === 'object' &&
    typeof player.id === 'string' &&
    typeof player.name === 'string' &&
    typeof player.color === 'string' &&
    typeof player.score === 'number'
  )
}

function validateHistoryEntry(entry) {
  return (
    entry &&
    typeof entry === 'object' &&
    typeof entry.id === 'string' &&
    typeof entry.playerId === 'string' &&
    typeof entry.change === 'number' &&
    typeof entry.timestamp === 'number'
  )
}

function validateLoadedState(payload) {
  if (!payload || typeof payload !== 'object') {
    return null
  }

  // Validate theme - must be one of the valid themes
  const validThemes = ['atompunk', 'nebula', 'clear']
  const theme = validThemes.includes(payload.theme) ? payload.theme : 'atompunk'

  const validatedState = {
    theme,
    players: [],
    history: [],
  }

  if (Array.isArray(payload.players)) {
    validatedState.players = payload.players
      .filter(validatePlayer)
      .map(p => ({
        id: p.id,
        name: p.name,
        color: p.color,
        score: p.score,
        rotation: typeof p.rotation === 'number' ? p.rotation : 0,
      }))
  }

  if (Array.isArray(payload.history)) {
    validatedState.history = payload.history
      .filter(validateHistoryEntry)
      .slice(0, 100)
  }

  return validatedState
}

function gameReducer(state, action) {
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
      const validThemes = ['atompunk', 'nebula', 'clear']
      const newTheme = validThemes.includes(action.payload) ? action.payload : state.theme
      return { ...state, theme: newTheme }
    }

    case ACTIONS.ADD_PLAYER: {
      if (state.players.length >= 8) return state
      const usedColors = state.players.map(p => p.color)
      const color = getNextAvailableColor(usedColors)
      const newPlayer = {
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
            // Normalize to 0-270 range first (visually identical), then add 90
            // This prevents backwards animation when values get high
            const currentRotation = (p.rotation || 0) % 360
            const newRotation = currentRotation + 90
            return { ...p, rotation: newRotation }
          }
          return p
        }),
      }
    }

    case ACTIONS.ADJUST_SCORE: {
      const { playerId, change } = action.payload
      const historyEntry = {
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
        history: [historyEntry, ...state.history].slice(0, 100),
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

const GameContext = createContext(null)

function saveToLocalStorage(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    return true
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
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

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState)
  const [isLoaded, setIsLoaded] = useState(false)
  const saveTimerRef = useRef(null)

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
    document.documentElement.classList.remove('theme-atompunk', 'theme-nebula', 'theme-clear')
    // Add current theme class
    document.documentElement.classList.add(`theme-${state.theme}`)
  }, [state.theme])

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}
