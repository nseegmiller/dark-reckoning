import { useState } from 'react'
import { useGame } from '../context/GameContext'

export function AddPlayer() {
  const { state, dispatch } = useGame()
  const [isAdding, setIsAdding] = useState(false)
  const [name, setName] = useState('')

  const canAddMore = state.players.length < 8

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch({ type: 'ADD_PLAYER', payload: name.trim() })
    setName('')
    setIsAdding(false)
  }

  const handleQuickAdd = () => {
    dispatch({ type: 'ADD_PLAYER' })
  }

  if (!canAddMore) {
    return (
      <p className="text-center text-sm text-gray-600 uppercase tracking-wider py-2">
        Maximum 8 players
      </p>
    )
  }

  if (isAdding) {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Player name"
          autoFocus
          className="flex-1 px-4 py-2 bg-game-card border border-game-border
                     text-white uppercase tracking-wide placeholder:text-gray-600
                     focus:outline-none focus:border-game-accent focus:shadow-glow"
          style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}
          maxLength={20}
        />
        <button type="submit" className="btn-game-primary">
          Add
        </button>
        <button
          type="button"
          onClick={() => setIsAdding(false)}
          className="btn-game"
        >
          Cancel
        </button>
      </form>
    )
  }

  return (
    <div className="flex gap-3 justify-center">
      <button onClick={handleQuickAdd} className="btn-game-primary">
        + Add Player
      </button>
      <button onClick={() => setIsAdding(true)} className="btn-game">
        + Named
      </button>
    </div>
  )
}
