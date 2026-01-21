import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { GameProvider } from './context/GameContext'
import { ErrorBoundary } from './components/ErrorBoundary'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GameProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </GameProvider>
  </StrictMode>,
)
