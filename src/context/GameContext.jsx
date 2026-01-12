import { createContext, useContext, useReducer, useEffect, useState } from 'react'
import { getNextAvailableColor } from '../utils/colors'

const STORAGE_KEY = 'darkReckoning'

const initialState = {
  theme: 'dark',
  multiplier: 1,
  players: [],
  history: [],
}

function generateId() {
  return crypto.randomUUID()
}

function gameReducer(state, action) {
  switch (action.type) {
    case 'LOAD_STATE':
      return { ...initialState, ...action.payload }

    case 'SET_THEME':
      return { ...state, theme: action.payload }

    case 'SET_MULTIPLIER':
      return { ...state, multiplier: action.payload }

    case 'ADD_PLAYER': {
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

    case 'REMOVE_PLAYER':
      return {
        ...state,
        players: state.players.filter(p => p.id !== action.payload),
        history: state.history.filter(h => h.playerId !== action.payload),
      }

    case 'UPDATE_PLAYER':
      return {
        ...state,
        players: state.players.map(p =>
          p.id === action.payload.id ? { ...p, ...action.payload.updates } : p
        ),
      }

    case 'ROTATE_PLAYER':
      return {
        ...state,
        players: state.players.map(p =>
          p.id === action.payload
            ? { ...p, rotation: (p.rotation || 0) + 90 }
            : p
        ),
      }

    case 'ADJUST_SCORE': {
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
        history: [historyEntry, ...state.history].slice(0, 100), // Keep last 100 entries
      }
    }

    case 'UNDO': {
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

    case 'NEW_GAME':
      return {
        ...state,
        players: state.players.map(p => ({ ...p, score: 0 })),
        history: [],
      }

    case 'CLEAR_ALL':
      return { ...initialState, theme: state.theme }

    default:
      return state
  }
}

const GameContext = createContext(null)

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        dispatch({ type: 'LOAD_STATE', payload: parsed })
      }
    } catch (e) {
      console.error('Failed to load state:', e)
    }
    setIsLoaded(true)
  }, [])

  // Save state to localStorage on change (only after initial load)
  useEffect(() => {
    if (!isLoaded) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (e) {
      console.error('Failed to save state:', e)
    }
  }, [state, isLoaded])

  // Apply theme class to document
  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
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
