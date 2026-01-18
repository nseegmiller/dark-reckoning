# Change History

## v0.8

**Features:**
- Add clickable version number in header to view change history
- Create change history popup showing all versions with categorized changes

**Bug Fixes:**
- None

**Code Quality:**
- Refactor ChangeHistory to use Vite raw import (single source of truth)
- Extract changelog parsing logic to utils/changelog.js
- Create reusable ChangelogSection component (eliminate code duplication)
- Add comprehensive error handling to changelog parsing
- Add JSDoc documentation and constants for section types
- Remove all "Co-Authored-By" references from codebase and workflow
- Simplify commit workflow (no manual changelog syncing needed)

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

**Code Quality:**
- Delete unused Actions.jsx and Multiplier.jsx components
- Extract FLUSH_DELAY_MS to shared constants file
- Add documentation for dual state tracking in PlayerCell
- Add aria-labels to color picker buttons for accessibility
- Update CLAUDE.md with explicit versioning workflow
