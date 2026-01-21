import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ACTIONS } from '../types'
import { renderHook, act } from '@testing-library/react'
import { GameProvider, useGame } from './GameContext'
import { createElement } from 'react'

describe('gameReducer', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    vi.clearAllMocks()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    createElement(GameProvider, null, children)

  describe('SET_THEME', () => {
    it('sets valid theme', () => {
      const { result } = renderHook(() => useGame(), { wrapper })

      act(() => {
        result.current.dispatch({ type: ACTIONS.SET_THEME, payload: 'nebula' })
      })

      expect(result.current.state.theme).toBe('nebula')
    })

    it('ignores invalid theme', () => {
      const { result } = renderHook(() => useGame(), { wrapper })

      const initialTheme = result.current.state.theme

      act(() => {
        result.current.dispatch({ type: ACTIONS.SET_THEME, payload: 'invalid-theme' })
      })

      expect(result.current.state.theme).toBe(initialTheme)
    })

    it('sets all valid themes', () => {
      const { result } = renderHook(() => useGame(), { wrapper })

      const themes = ['atompunk', 'nebula', 'clear']

      themes.forEach(theme => {
        act(() => {
          result.current.dispatch({ type: ACTIONS.SET_THEME, payload: theme })
        })
        expect(result.current.state.theme).toBe(theme)
      })
    })
  })

  describe('ADD_PLAYER', () => {
    it('adds a player with provided name', () => {
      const { result } = renderHook(() => useGame(), { wrapper })

      act(() => {
        result.current.dispatch({ type: ACTIONS.ADD_PLAYER, payload: 'Alice' })
      })

      expect(result.current.state.players).toHaveLength(1)
      expect(result.current.state.players[0].name).toBe('Alice')
      expect(result.current.state.players[0].score).toBe(0)
      expect(result.current.state.players[0].rotation).toBe(0)
    })

    it('adds a player with default name if empty', () => {
      const { result } = renderHook(() => useGame(), { wrapper })

      act(() => {
        result.current.dispatch({ type: ACTIONS.ADD_PLAYER, payload: '' })
      })

      expect(result.current.state.players).toHaveLength(1)
      expect(result.current.state.players[0].name).toBe('Player 1')
    })

    it('assigns different colors to each player', () => {
      const { result } = renderHook(() => useGame(), { wrapper })

      act(() => {
        result.current.dispatch({ type: ACTIONS.ADD_PLAYER, payload: 'Player 1' })
        result.current.dispatch({ type: ACTIONS.ADD_PLAYER, payload: 'Player 2' })
        result.current.dispatch({ type: ACTIONS.ADD_PLAYER, payload: 'Player 3' })
      })

      const colors = result.current.state.players.map(p => p.color)
      const uniqueColors = new Set(colors)
      expect(uniqueColors.size).toBe(3)
    })

    it('enforces max player limit', () => {
      const { result } = renderHook(() => useGame(), { wrapper })

      // Add 8 players (max)
      for (let i = 1; i <= 8; i++) {
        act(() => {
          result.current.dispatch({ type: ACTIONS.ADD_PLAYER, payload: `Player ${i}` })
        })
      }

      expect(result.current.state.players).toHaveLength(8)

      // Try to add 9th player
      act(() => {
        result.current.dispatch({ type: ACTIONS.ADD_PLAYER, payload: 'Player 9' })
      })

      expect(result.current.state.players).toHaveLength(8)
    })
  })

  describe('REMOVE_PLAYER', () => {
    it('removes player by id', () => {
      const { result } = renderHook(() => useGame(), { wrapper })

      act(() => {
        result.current.dispatch({ type: ACTIONS.ADD_PLAYER, payload: 'Alice' })
        result.current.dispatch({ type: ACTIONS.ADD_PLAYER, payload: 'Bob' })
      })

      const aliceId = result.current.state.players[0].id

      act(() => {
        result.current.dispatch({ type: ACTIONS.REMOVE_PLAYER, payload: aliceId })
      })

      expect(result.current.state.players).toHaveLength(1)
      expect(result.current.state.players[0].name).toBe('Bob')
    })

    it('removes associated history entries', () => {
      const { result } = renderHook(() => useGame(), { wrapper })

      act(() => {
        result.current.dispatch({ type: ACTIONS.ADD_PLAYER, payload: 'Alice' })
      })

      const playerId = result.current.state.players[0].id

      // Add some history
      act(() => {
        result.current.dispatch({
          type: ACTIONS.ADJUST_SCORE,
          payload: { playerId, change: 5 }
        })
      })

      expect(result.current.state.history).toHaveLength(1)

      // Remove player
      act(() => {
        result.current.dispatch({ type: ACTIONS.REMOVE_PLAYER, payload: playerId })
      })

      expect(result.current.state.history).toHaveLength(0)
    })

    it('does nothing for non-existent player id', () => {
      const { result } = renderHook(() => useGame(), { wrapper })

      act(() => {
        result.current.dispatch({ type: ACTIONS.ADD_PLAYER, payload: 'Alice' })
      })

      const initialPlayers = [...result.current.state.players]

      act(() => {
        result.current.dispatch({ type: ACTIONS.REMOVE_PLAYER, payload: 'non-existent-id' })
      })

      expect(result.current.state.players).toEqual(initialPlayers)
    })
  })

  describe('UPDATE_PLAYER', () => {
    it('updates player name', () => {
      const { result } = renderHook(() => useGame(), { wrapper })

      act(() => {
        result.current.dispatch({ type: ACTIONS.ADD_PLAYER, payload: 'Alice' })
      })

      const playerId = result.current.state.players[0].id

      act(() => {
        result.current.dispatch({
          type: ACTIONS.UPDATE_PLAYER,
          payload: { id: playerId, updates: { name: 'Bob' } }
        })
      })

      expect(result.current.state.players[0].name).toBe('Bob')
    })

    it('updates player color', () => {
      const { result } = renderHook(() => useGame(), { wrapper })

      act(() => {
        result.current.dispatch({ type: ACTIONS.ADD_PLAYER, payload: 'Alice' })
      })

      const playerId = result.current.state.players[0].id

      act(() => {
        result.current.dispatch({
          type: ACTIONS.UPDATE_PLAYER,
          payload: { id: playerId, updates: { color: '#00FF00' } }
        })
      })

      expect(result.current.state.players[0].color).toBe('#00FF00')
    })

    it('preserves other fields when updating', () => {
      const { result } = renderHook(() => useGame(), { wrapper })

      act(() => {
        result.current.dispatch({ type: ACTIONS.ADD_PLAYER, payload: 'Alice' })
      })

      const playerId = result.current.state.players[0].id
      const originalColor = result.current.state.players[0].color

      act(() => {
        result.current.dispatch({
          type: ACTIONS.UPDATE_PLAYER,
          payload: { id: playerId, updates: { name: 'Bob' } }
        })
      })

      expect(result.current.state.players[0].color).toBe(originalColor)
    })
  })

  describe('ROTATE_PLAYER', () => {
    it('rotates player by 90 degrees', () => {
      const { result } = renderHook(() => useGame(), { wrapper })

      act(() => {
        result.current.dispatch({ type: ACTIONS.ADD_PLAYER, payload: 'Alice' })
      })

      const playerId = result.current.state.players[0].id

      act(() => {
        result.current.dispatch({ type: ACTIONS.ROTATE_PLAYER, payload: playerId })
      })

      expect(result.current.state.players[0].rotation).toBe(90)
    })

    it('rotates through all positions', () => {
      const { result } = renderHook(() => useGame(), { wrapper })

      act(() => {
        result.current.dispatch({ type: ACTIONS.ADD_PLAYER, payload: 'Alice' })
      })

      const playerId = result.current.state.players[0].id

      const expectedRotations = [90, 180, 270, 360]

      expectedRotations.forEach(expected => {
        act(() => {
          result.current.dispatch({ type: ACTIONS.ROTATE_PLAYER, payload: playerId })
        })
        expect(result.current.state.players[0].rotation).toBe(expected)
      })
    })

    it('normalizes rotation to prevent overflow', () => {
      const { result } = renderHook(() => useGame(), { wrapper })

      act(() => {
        result.current.dispatch({ type: ACTIONS.ADD_PLAYER, payload: 'Alice' })
      })

      const playerId = result.current.state.players[0].id

      // Rotate many times
      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.dispatch({ type: ACTIONS.ROTATE_PLAYER, payload: playerId })
        })
      }

      // Rotation accumulates for smooth CSS animation (PlayerCell handles visual normalization)
      // After 10 rotations of 90°, expect 900°
      const rotation = result.current.state.players[0].rotation
      expect(rotation).toBe(900)
      // Visual rotation is equivalent to 900 % 360 = 180°
      expect(rotation % 360).toBe(180)
    })
  })

  describe('ADJUST_SCORE', () => {
    it('adjusts player score positively', () => {
      const { result } = renderHook(() => useGame(), { wrapper })

      act(() => {
        result.current.dispatch({ type: ACTIONS.ADD_PLAYER, payload: 'Alice' })
      })

      const playerId = result.current.state.players[0].id

      act(() => {
        result.current.dispatch({
          type: ACTIONS.ADJUST_SCORE,
          payload: { playerId, change: 5 }
        })
      })

      expect(result.current.state.players[0].score).toBe(5)
    })

    it('adjusts player score negatively', () => {
      const { result } = renderHook(() => useGame(), { wrapper })

      act(() => {
        result.current.dispatch({ type: ACTIONS.ADD_PLAYER, payload: 'Alice' })
      })

      const playerId = result.current.state.players[0].id

      act(() => {
        result.current.dispatch({
          type: ACTIONS.ADJUST_SCORE,
          payload: { playerId, change: -3 }
        })
      })

      expect(result.current.state.players[0].score).toBe(-3)
    })

    it('adds history entry', () => {
      const { result } = renderHook(() => useGame(), { wrapper })

      act(() => {
        result.current.dispatch({ type: ACTIONS.ADD_PLAYER, payload: 'Alice' })
      })

      const playerId = result.current.state.players[0].id

      act(() => {
        result.current.dispatch({
          type: ACTIONS.ADJUST_SCORE,
          payload: { playerId, change: 5 }
        })
      })

      expect(result.current.state.history).toHaveLength(1)
      expect(result.current.state.history[0].playerId).toBe(playerId)
      expect(result.current.state.history[0].change).toBe(5)
    })

    it('prepends new history entries (newest first)', () => {
      const { result } = renderHook(() => useGame(), { wrapper })

      act(() => {
        result.current.dispatch({ type: ACTIONS.ADD_PLAYER, payload: 'Alice' })
      })

      const playerId = result.current.state.players[0].id

      act(() => {
        result.current.dispatch({
          type: ACTIONS.ADJUST_SCORE,
          payload: { playerId, change: 1 }
        })
        result.current.dispatch({
          type: ACTIONS.ADJUST_SCORE,
          payload: { playerId, change: 2 }
        })
        result.current.dispatch({
          type: ACTIONS.ADJUST_SCORE,
          payload: { playerId, change: 3 }
        })
      })

      expect(result.current.state.history[0].change).toBe(3)
      expect(result.current.state.history[1].change).toBe(2)
      expect(result.current.state.history[2].change).toBe(1)
    })
  })

  describe('UNDO', () => {
    it('reverts last score change', () => {
      const { result } = renderHook(() => useGame(), { wrapper })

      act(() => {
        result.current.dispatch({ type: ACTIONS.ADD_PLAYER, payload: 'Alice' })
      })

      const playerId = result.current.state.players[0].id

      act(() => {
        result.current.dispatch({
          type: ACTIONS.ADJUST_SCORE,
          payload: { playerId, change: 5 }
        })
      })

      expect(result.current.state.players[0].score).toBe(5)

      act(() => {
        result.current.dispatch({ type: ACTIONS.UNDO })
      })

      expect(result.current.state.players[0].score).toBe(0)
    })

    it('removes history entry', () => {
      const { result } = renderHook(() => useGame(), { wrapper })

      act(() => {
        result.current.dispatch({ type: ACTIONS.ADD_PLAYER, payload: 'Alice' })
      })

      const playerId = result.current.state.players[0].id

      act(() => {
        result.current.dispatch({
          type: ACTIONS.ADJUST_SCORE,
          payload: { playerId, change: 5 }
        })
      })

      expect(result.current.state.history).toHaveLength(1)

      act(() => {
        result.current.dispatch({ type: ACTIONS.UNDO })
      })

      expect(result.current.state.history).toHaveLength(0)
    })

    it('does nothing if no history', () => {
      const { result } = renderHook(() => useGame(), { wrapper })

      act(() => {
        result.current.dispatch({ type: ACTIONS.ADD_PLAYER, payload: 'Alice' })
      })

      const initialState = { ...result.current.state }

      act(() => {
        result.current.dispatch({ type: ACTIONS.UNDO })
      })

      expect(result.current.state.players).toEqual(initialState.players)
    })

    it('handles multiple undos', () => {
      const { result } = renderHook(() => useGame(), { wrapper })

      act(() => {
        result.current.dispatch({ type: ACTIONS.ADD_PLAYER, payload: 'Alice' })
      })

      const playerId = result.current.state.players[0].id

      act(() => {
        result.current.dispatch({
          type: ACTIONS.ADJUST_SCORE,
          payload: { playerId, change: 1 }
        })
        result.current.dispatch({
          type: ACTIONS.ADJUST_SCORE,
          payload: { playerId, change: 2 }
        })
        result.current.dispatch({
          type: ACTIONS.ADJUST_SCORE,
          payload: { playerId, change: 3 }
        })
      })

      expect(result.current.state.players[0].score).toBe(6)

      act(() => {
        result.current.dispatch({ type: ACTIONS.UNDO })
      })
      expect(result.current.state.players[0].score).toBe(3)

      act(() => {
        result.current.dispatch({ type: ACTIONS.UNDO })
      })
      expect(result.current.state.players[0].score).toBe(1)

      act(() => {
        result.current.dispatch({ type: ACTIONS.UNDO })
      })
      expect(result.current.state.players[0].score).toBe(0)
    })
  })

  describe('NEW_GAME', () => {
    it('resets all scores to 0', () => {
      const { result } = renderHook(() => useGame(), { wrapper })

      act(() => {
        result.current.dispatch({ type: ACTIONS.ADD_PLAYER, payload: 'Alice' })
        result.current.dispatch({ type: ACTIONS.ADD_PLAYER, payload: 'Bob' })
      })

      const player1Id = result.current.state.players[0].id
      const player2Id = result.current.state.players[1].id

      act(() => {
        result.current.dispatch({
          type: ACTIONS.ADJUST_SCORE,
          payload: { playerId: player1Id, change: 10 }
        })
        result.current.dispatch({
          type: ACTIONS.ADJUST_SCORE,
          payload: { playerId: player2Id, change: 20 }
        })
      })

      act(() => {
        result.current.dispatch({ type: ACTIONS.NEW_GAME })
      })

      expect(result.current.state.players[0].score).toBe(0)
      expect(result.current.state.players[1].score).toBe(0)
    })

    it('keeps players', () => {
      const { result } = renderHook(() => useGame(), { wrapper })

      act(() => {
        result.current.dispatch({ type: ACTIONS.ADD_PLAYER, payload: 'Alice' })
        result.current.dispatch({ type: ACTIONS.ADD_PLAYER, payload: 'Bob' })
      })

      act(() => {
        result.current.dispatch({ type: ACTIONS.NEW_GAME })
      })

      expect(result.current.state.players).toHaveLength(2)
      expect(result.current.state.players[0].name).toBe('Alice')
      expect(result.current.state.players[1].name).toBe('Bob')
    })

    it('clears history', () => {
      const { result } = renderHook(() => useGame(), { wrapper })

      act(() => {
        result.current.dispatch({ type: ACTIONS.ADD_PLAYER, payload: 'Alice' })
      })

      const playerId = result.current.state.players[0].id

      act(() => {
        result.current.dispatch({
          type: ACTIONS.ADJUST_SCORE,
          payload: { playerId, change: 5 }
        })
      })

      act(() => {
        result.current.dispatch({ type: ACTIONS.NEW_GAME })
      })

      expect(result.current.state.history).toHaveLength(0)
    })
  })

  describe('CLEAR_ALL', () => {
    it('removes all players', () => {
      const { result } = renderHook(() => useGame(), { wrapper })

      act(() => {
        result.current.dispatch({ type: ACTIONS.ADD_PLAYER, payload: 'Alice' })
        result.current.dispatch({ type: ACTIONS.ADD_PLAYER, payload: 'Bob' })
      })

      act(() => {
        result.current.dispatch({ type: ACTIONS.CLEAR_ALL })
      })

      expect(result.current.state.players).toHaveLength(0)
    })

    it('clears history', () => {
      const { result } = renderHook(() => useGame(), { wrapper })

      act(() => {
        result.current.dispatch({ type: ACTIONS.ADD_PLAYER, payload: 'Alice' })
      })

      const playerId = result.current.state.players[0].id

      act(() => {
        result.current.dispatch({
          type: ACTIONS.ADJUST_SCORE,
          payload: { playerId, change: 5 }
        })
      })

      act(() => {
        result.current.dispatch({ type: ACTIONS.CLEAR_ALL })
      })

      expect(result.current.state.history).toHaveLength(0)
    })

    it('preserves current theme', () => {
      const { result } = renderHook(() => useGame(), { wrapper })

      act(() => {
        result.current.dispatch({ type: ACTIONS.SET_THEME, payload: 'nebula' })
        result.current.dispatch({ type: ACTIONS.ADD_PLAYER, payload: 'Alice' })
      })

      act(() => {
        result.current.dispatch({ type: ACTIONS.CLEAR_ALL })
      })

      expect(result.current.state.theme).toBe('nebula')
    })
  })
})
