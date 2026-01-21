// Re-export all types from a single entry point

export type {
  Theme,
  ThemeOption,
  Rotation,
  PlayerColor,
  Player,
  HistoryEntry,
  GameState,
  GameContextValue,
  GameAction,
} from './game'

export type {
  ActionType,
  PlayerUpdatePayload,
  ScoreAdjustPayload,
} from './actions'

export { ACTIONS } from './actions'

export type {
  UseSwipeOptions,
  SwipeHandlers,
  ScoreAccumulatorState,
  DialogState,
} from './hooks'

export type {
  PlayerCellProps,
  PlayerGridProps,
  HeaderProps,
  SettingsMenuProps,
  PlayerListProps,
  AddPlayerFormProps,
  ThemeSelectorProps,
  ConfirmDialogProps,
  ConfirmDialogState,
  ChangelogSectionProps,
  ChangeHistoryProps,
  HistoryProps,
  ErrorBoundaryProps,
  ErrorBoundaryState,
  GameProviderProps,
} from './components'

export type {
  SectionType,
  VersionEntry,
} from './changelog'

export { SECTION_TYPES, SECTION_HEADERS, HEADER_TO_SECTION } from './changelog'
