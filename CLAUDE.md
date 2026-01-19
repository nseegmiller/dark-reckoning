# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Dark Reckoning is a board game score tracking web application. It works with any board game that needs score tracking. It's a React + Vite application with two themes (Atom Punk terminal and Nebula space), designed for mobile-first touch interactions with swipe gestures to adjust scores.

## Development Commands

```bash
npm run dev      # Start development server (Vite)
npm run build    # Build for production
npm run preview  # Preview production build
```

## Development Guidelines

**IMPORTANT: Do not create temporary files in the project directory.** All temporary files (such as tmpclaude-* or similar) should be created in the system temp directory, not in the project root or any subdirectories. Keep the project directory clean and only include files that are part of the application.

### Version Management

The app version is managed in `src/version.js` with separate `VERSION_MAJOR` and `VERSION_MINOR` constants.

**Version Update Rules:**
- **IMPORTANT**: Update the version number in `src/version.js` BEFORE making each commit
- **Update MINOR version**: Increment `VERSION_MINOR` by 1 before every commit with changes
- **Update MAJOR version**: Only when explicitly requested by the user (increment `VERSION_MAJOR` by 1, reset `VERSION_MINOR` to 0), then commit
- Current version is displayed in the header next to "Dark Reckoning"

**Commit Workflow:**
1. Make code changes
2. Update version in `src/version.js` (increment MINOR by 1)
3. Generate commit message and add it to `CHANGELOG.md`:
   - Add new version section at the top (e.g., `## v0.8`)
   - ONLY include sections: **Features:** and/or **Bug Fixes:**
   - NEVER include **Code Quality:** in CHANGELOG.md (that's only for commit messages)
   - Only include a section if it has content (skip empty sections)
   - List changes as bullet points (`- Change description`)
4. Create the git commit with updated version and changelog included
   - Commit message can include all three sections: Features, Bug Fixes, Code Quality
   - Use the version number as the first line (e.g., "v0.8: Brief summary")
   - Only include sections that have content

**Section Rules:**
- **Features** and **Bug Fixes**: Go in CHANGELOG.md (shown to users) and commit messages
- **Code Quality**: Only in commit messages, NEVER in CHANGELOG.md (internal development only)

**Important Notes:**
- CHANGELOG.md is automatically imported by ChangeHistory.jsx - no manual syncing needed
- Never include any "Co-Authored-By" lines anywhere (commits or changelog)
- Empty sections should be omitted entirely (don't write "None" or leave them empty)

## Architecture

### State Management Pattern

The app uses React Context + useReducer for global state management centered in `src/context/GameContext.jsx`. All game state (players, scores, history, theme, multiplier) flows through the `GameContext`.

**Key state operations:**
- State automatically persists to localStorage (key: `'darkReckoning'`)
- All mutations go through reducer actions (LOAD_STATE, ADD_PLAYER, ADJUST_SCORE, UNDO, etc.)
- History is maintained for undo functionality (last 100 entries)

### Component Structure

- **App.jsx**: Root component that wraps everything in GameProvider
- **PlayerGrid.jsx**: Dynamic grid layout (1-8 players) that calculates grid-cols/rows based on player count
- **PlayerCell.jsx**: Individual player display with swipe gesture handling
- **SettingsMenu.jsx**: Full-screen overlay for managing players and game settings

### Touch Interaction System

The core interaction is swipe-to-score implemented in `src/hooks/useSwipe.js`:

1. **Rotation-aware gestures**: Swipe direction transforms based on player.rotation (0°, 90°, 180°, 270°) so "up from player's perspective" always increases score
2. **Delta calculation**: 30 pixels = 1 unit, scaled by global multiplier
3. **Preview feedback**: Shows tentative score change during swipe
4. **Dual input**: Supports both touch (mobile) and mouse (desktop)

**Important:** The swipe hook handles rotation transformation via `transformDelta()` function that maps physical swipe direction to logical score change based on how the player card is rotated.

### Styling System

Uses Tailwind CSS with extensive custom properties:

- **Theming**: CSS variables in `src/index.css` (`--theme-primary`, `--theme-bg`, etc.) with `dr-` prefixed utility classes
- **CRT effects**: Scanline overlay and vignette applied via body pseudo-elements
- **Custom colors**: 8 player colors defined in `tailwind.config.js` and `src/utils/colors.js`
- **Responsive fonts**: `score-text` class uses clamp() for viewport-based sizing

### Data Persistence

localStorage is the single source of truth:
- Saved on every state change (via useEffect in GameContext)
- Loaded once on mount
- Includes all players, scores, history, settings

## Key Files

- `src/context/GameContext.jsx` - State management reducer and localStorage sync
- `src/hooks/useSwipe.js` - Touch/mouse gesture handling with rotation support
- `src/components/PlayerCell.jsx` - Individual player rendering and interaction
- `src/utils/colors.js` - Player color palette (8 colors)
- `tailwind.config.js` - Custom theme colors and game styling

## Important Constraints

- **Max 8 players** (enforced in ADD_PLAYER action)
- **Rotation states**: 0°, 90°, 180°, 270° only (increments of 90°)
- **History limit**: 100 entries max
- **No backend**: Everything is client-side with localStorage
- **Mobile-first**: Primary interaction is touch swipe, mouse is secondary

## Testing

### Unit Tests (Vitest)

Unit tests use Vitest with React Testing Library. Run with:

```bash
npm test           # Watch mode
npm run test:run   # Single run
npm run test:coverage  # With coverage
```

### End-to-End Tests (Playwright)

E2E tests are located in `tests/` and use Playwright to test the full application in real browsers.

**Configuration:** `playwright.config.ts`
- Test directory: `./tests`
- Browsers: Chromium, Firefox, WebKit
- Parallel execution enabled
- HTML reporter for test results
- Traces collected on first retry

**Running E2E Tests:**

```bash
# Start dev server first (in separate terminal)
npm run dev

# Run all tests
npx playwright test

# Run in headed mode (visible browser)
npx playwright test --headed

# Run specific test file
npx playwright test tests/score-tap-adjustment.spec.ts

# Run for specific browser
npx playwright test --project=chromium

# View HTML report
npx playwright show-report
```

**Test Files:**
- `tests/score-tap-adjustment.spec.ts` - Tests tap-to-adjust score functionality

**Writing E2E Tests:**

Tests should:
1. Navigate to `http://localhost:5173`
2. Use Settings to create players before testing interactions
3. Account for the 2-second score debounce (`COMMIT_DEBOUNCE_MS`) when verifying score changes
4. Use appropriate timeouts for assertions (3000ms recommended for score changes)

**Key Selectors:**
- Settings button: `getByLabel('Settings')`
- Close settings: `getByLabel('Close settings')`
- Add player input: `getByPlaceholder('Player name...')`
- Add button: `getByRole('button', { name: 'Add' })`
- Score display: `.score-text` class within player cell

**Tap Detection:**
- Taps in top half of player cell increase score
- Taps in bottom half decrease score
- Movement < 5px in both directions qualifies as a tap
