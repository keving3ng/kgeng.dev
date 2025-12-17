import { useTheme } from '../contexts/ThemeContext'
import { themes } from '../config/themes'

export default function ThemeToggle() {
  const { theme, cycleTheme } = useTheme()

  const currentTheme = themes.find(t => t.id === theme)

  return (
    <button
      onClick={cycleTheme}
      className="text-content-muted hover:text-content-secondary transition-colors text-sm"
      aria-label={`Current theme: ${currentTheme?.label}. Click to change.`}
      title={`Theme: ${currentTheme?.label}`}
    >
      {currentTheme?.icon || '◐'}
    </button>
  )
}
