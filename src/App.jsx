import { useState } from 'react'
import { GameProvider } from './context/GameContext'
import { Header } from './components/Header'
import { PlayerGrid } from './components/PlayerGrid'
import { SettingsMenu } from './components/SettingsMenu'

function App() {
  const [showSettings, setShowSettings] = useState(false)

  return (
    <GameProvider>
      <div className="h-screen flex flex-col overflow-hidden">
        <Header onSettingsClick={() => setShowSettings(true)} />
        <PlayerGrid />
        {showSettings && <SettingsMenu onClose={() => setShowSettings(false)} />}
      </div>
    </GameProvider>
  )
}

export default App
