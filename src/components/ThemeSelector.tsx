import { THEME_OPTIONS } from '../constants'
import type { ThemeSelectorProps } from '../types'

export function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
  return (
    <div>
      <label className="block text-sm uppercase tracking-wider dr-text-dim mb-2">
        Theme
      </label>
      <div className="grid grid-cols-3 gap-2">
        {THEME_OPTIONS.map((theme) => (
          <button
            key={theme.id}
            onClick={() => onThemeChange(theme.id)}
            className={`dr-btn py-3 ${currentTheme === theme.id ? 'dr-btn-active' : ''}`}
          >
            <div className="text-center">
              <div className="text-sm mb-1">{theme.name}</div>
              <div className="text-xs dr-text-dim">{theme.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
