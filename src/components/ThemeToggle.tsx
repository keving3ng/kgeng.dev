import { useTheme } from '../contexts/ThemeContext'
import { themes } from '../config/themes'

export default function ThemeToggle() {
  const { theme, cycleTheme } = useTheme()

  const currentTheme = themes.find(t => t.id === theme)

  return (
    <button
      onClick={cycleTheme}
      className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center p-2 rounded -mr-2 text-content-muted hover:text-content-secondary transition-colors text-sm"
      aria-label={`Current theme: ${currentTheme?.label}. Click to change.`}
      title={`Theme: ${currentTheme?.label}`}
    >
      {currentTheme?.icon || '◐'}
    </button>
  )
}
