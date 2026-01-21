import { useState } from 'react'
import { MAX_PLAYER_NAME_LENGTH } from '../constants'
import type { AddPlayerFormProps } from '../types'

export function AddPlayerForm({ canAddPlayer, onAddPlayer }: AddPlayerFormProps) {
  const [newPlayerName, setNewPlayerName] = useState('')

  const handleSubmit = () => {
    onAddPlayer(newPlayerName.trim())
    setNewPlayerName('')
  }

  if (!canAddPlayer) {
    return null
  }

  return (
    <div className="flex gap-2 items-stretch">
      <input
        type="text"
        value={newPlayerName}
        onChange={(e) => setNewPlayerName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        placeholder="Player name..."
        className="flex-1 min-w-0 px-3 py-2 bg-transparent border dr-border dr-text placeholder:dr-text-dim uppercase tracking-wide outline-none focus:border-[var(--dr-green)]"
        maxLength={MAX_PLAYER_NAME_LENGTH}
      />
      <button onClick={handleSubmit} className="dr-btn shrink-0 px-4">
        Add
      </button>
    </div>
  )
}
