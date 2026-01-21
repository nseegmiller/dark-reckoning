// Component prop type definitions

import type { ReactNode } from 'react'
import type { Player } from './game'

/** Props for PlayerCell component */
export interface PlayerCellProps {
  player: Player
}

/** Props for PlayerGrid component */
export interface PlayerGridProps {
  players: Player[]
}

/** Props for Header component */
export interface HeaderProps {
  onSettingsClick: () => void
}

/** Props for SettingsMenu component */
export interface SettingsMenuProps {
  onClose: () => void
}

/** Props for PlayerList component */
export interface PlayerListProps {
  players: Player[]
  editingPlayerId: string | null
  usedColors: string[]
  onEditPlayer: (playerId: string | null) => void
  onColorChange: (playerId: string, color: string) => void
  onRemovePlayer: (playerId: string) => void
  onUpdatePlayerName: (playerId: string, name: string) => void
}

/** Props for AddPlayerForm component */
export interface AddPlayerFormProps {
  canAddPlayer: boolean
  onAddPlayer: (name: string) => void
}

/** Props for ThemeSelector component */
export interface ThemeSelectorProps {
  currentTheme: string
  onThemeChange: (theme: string) => void
}

/** Props for ConfirmDialog component */
export interface ConfirmDialogProps {
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmText?: string
  cancelText?: string
  danger?: boolean
}

/** State for confirm dialog in components that use it */
export interface ConfirmDialogState {
  title: string
  message: string
  confirmText: string
  danger?: boolean
  onConfirm: () => void
}

/** Props for ChangelogSection component */
export interface ChangelogSectionProps {
  title: string
  items?: string[]
}

/** Props for ChangeHistory component */
export interface ChangeHistoryProps {
  onClose: () => void
}

/** Props for History component */
export interface HistoryProps {
  onClose: () => void
}

/** Props for ErrorBoundary component */
export interface ErrorBoundaryProps {
  children: ReactNode
}

/** State for ErrorBoundary component */
export interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/** Props for GameProvider component */
export interface GameProviderProps {
  children: ReactNode
}
