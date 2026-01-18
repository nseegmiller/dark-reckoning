# Change History

## v0.9

**Features:**
- Add tap-to-adjust score (tap above score for +1, below for -1, works with rotation)
- Remove double-tap to rotate (use rotation button in top-right corner instead)
- Improve rotation animation to always rotate clockwise, never backwards

**Bug Fixes:**
- Fix rotation button accidentally triggering score changes

## v0.8

**Features:**
- Add clickable version number in header to view change history
- Create change history popup showing all versions with categorized changes

## v0.7

**Features:**
- Add version number display in header (v0.7)
- Add History button and improved history view with per-player columns
- Move Undo button from settings to main header
- Remove score multiplier feature (x1, x5, x10)

**Bug Fixes:**
- Fix rotation normalization (explicitly reset to 0 at 360°)
- Fix memory leak in useSwipe hook (add cleanup for mouse listeners)
- Fix mouse drag issue crossing player boundaries
- Remove unused oldScore calculation in History component
