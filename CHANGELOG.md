# Change History

## v0.16

**Features**
- Auto-close settings menu after confirming New Game score reset
- Shorten "Atom Punk" to "Atom" on theme button to prevent text wrapping on mobile

## v0.15

**Features**
- Centralize all constants in src/constants.js for better maintainability
- Add useScoreAccumulator hook to manage debounced score changes
- Add useDialog hook for consistent dialog state management
- Add CSS variables for feedback colors (positive/negative)
- Add overlay CSS classes (dr-overlay, dr-overlay-heavy) for dialogs
- Add PropTypes to all components for runtime type checking
- Add aria-live attribute to score displays for accessibility
- Extract tap detection logic in useSwipe to eliminate code duplication
- Add flushAndExecute utility for consistent flush-before-action pattern
- Document custom event system and constants with JSDoc comments

**Bug Fixes**
- Fix Clear theme scanline overlay by using content: none instead of display: none
- Make theme visual tests more robust to handle browser rendering artifacts

## v0.14

**Features**
- Update app description to reflect multiple themes and swipe gestures

## v0.13

**Features**
- Add "Clear" high-visibility theme with clean typography and no glow effects
- Uses system font stack for optimal readability across platforms
- Add E2E tests for theme switching, persistence, and visual characteristics

**Bug Fixes**
- Fix theme validation to properly persist Clear theme after page reload

## v0.12

**Features**
- Expand E2E test suite with comprehensive tap, drag, and player scaling tests
- Add shared test utilities for consistent test writing
- Auto-start dev server via Playwright webServer config

## v0.11

**Features**
- Bias tap detection toward +1 (only bottom ~30% triggers -1)

**Bug Fixes**
- Fix tap detection using wrong axis for threshold calculation with different cell dimensions

## v0.10

**Features**
- Add Playwright E2E testing infrastructure with tap-to-adjust score test
- Add comprehensive README with installation, usage, and testing instructions
- Add testing documentation to CLAUDE.md

## v0.9

**Features**
- Add tap-to-adjust score (tap above score for +1, below for -1, works with rotation)
- Remove double-tap to rotate (use rotation button in top-right corner instead)
- Improve rotation animation to always rotate clockwise, never backwards

**Bug Fixes**
- Fix rotation button accidentally triggering score changes

## v0.8

**Features**
- Add clickable version number in header to view change history
- Create change history popup showing all versions with categorized changes

## v0.7

**Features**
- Add version number display in header (v0.7)
- Add History button and improved history view with per-player columns
- Move Undo button from settings to main header
- Remove score multiplier feature (x1, x5, x10)

**Bug Fixes**
- Fix rotation normalization (explicitly reset to 0 at 360°)
- Fix memory leak in useSwipe hook (add cleanup for mouse listeners)
- Fix mouse drag issue crossing player boundaries
- Remove unused oldScore calculation in History component
