# Dark Reckoning

A board game score tracking web application. Built with React + Vite, featuring mobile-first touch interactions with swipe gestures to adjust scores. Works with any board game that needs score tracking.

Use it now at [darkreckoning.com](https://darkreckoning.com/)

## Features

- **Swipe to Score**: Swipe up/down on player cards to adjust scores
- **Tap to Adjust**: Single tap on top/bottom of player card for +1/-1
- **Rotation Support**: Rotate player cards for around-the-table play
- **Three Themes**: Atom Punk (terminal), Nebula (space), and Clear (high visibility)
- **Undo History**: Track and revert score changes
- **Offline Support**: All data stored locally in browser
- **Up to 8 Players**: Each with customizable name and color

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm (comes with Node.js)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/nseegmiller/dark-reckoning.git
   cd dark-reckoning
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install Playwright browsers (for E2E testing):
   ```bash
   npx playwright install
   ```

## Running the App

### Development Server

Start the development server with hot reload:

```bash
npm run dev
```

The app will be available at http://localhost:5173

### Production Build

Build the app for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Testing

### Unit Tests (Vitest)

Run unit tests in watch mode:

```bash
npm test
```

Run unit tests once:

```bash
npm run test:run
```

Run tests with coverage:

```bash
npm run test:coverage
```

### End-to-End Tests (Playwright)

E2E tests require the dev server to be running.

1. Start the dev server in one terminal:
   ```bash
   npm run dev
   ```

2. Run Playwright tests in another terminal:
   ```bash
   npx playwright test
   ```

Run tests in headed mode (see the browser):

```bash
npx playwright test --headed
```

Run tests for a specific browser:

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

View the HTML test report:

```bash
npx playwright show-report
```

## Linting

Run ESLint:

```bash
npm run lint
```

Auto-fix linting issues:

```bash
npm run lint:fix
```

## Project Structure

```
dark-reckoning/
├── src/
│   ├── components/      # React components
│   │   ├── App.tsx          # Root component
│   │   ├── PlayerGrid.tsx   # Dynamic grid layout
│   │   ├── PlayerCell.tsx   # Individual player card
│   │   ├── SettingsMenu.tsx # Settings overlay
│   │   └── ...
│   ├── context/         # React Context providers
│   │   └── GameContext.tsx  # Global state management
│   ├── hooks/           # Custom React hooks
│   │   └── useSwipe.ts      # Touch/mouse gesture handling
│   ├── types/           # TypeScript type definitions
│   │   ├── index.ts         # Type re-exports
│   │   ├── game.ts          # Game state types
│   │   ├── actions.ts       # Action types
│   │   └── components.ts    # Component prop types
│   ├── utils/           # Utility functions
│   │   └── colors.ts        # Player color palette
│   ├── index.css        # Global styles & themes
│   ├── main.tsx         # App entry point
│   └── version.ts       # App version constants
├── tests/               # Playwright E2E tests
├── public/              # Static assets
├── playwright.config.ts # Playwright configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── vite.config.ts       # Vite configuration
└── package.json
```

## How to Play

1. **Add Players**: Click the gear icon to open settings, enter player names and click "Add"
2. **Adjust Scores**:
   - Swipe up/down on a player card to change score (30px = 1 point)
   - Or tap the top half (+1) or bottom half (-1) of a card
3. **Rotate Cards**: Tap the ↻ button to rotate a player's card for around-the-table viewing
4. **Undo**: Click the undo button to revert the last score change
5. **New Game**: In settings, click "New Game" to reset all scores to 0
6. **Clear All**: In settings, click "Clear All" to remove all players

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Vitest** - Unit testing
- **Playwright** - E2E testing
- **ESLint** - Code linting

## License

MIT
