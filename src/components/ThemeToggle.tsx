import { useTheme } from '../contexts/ThemeContext'
import { themes } from '../config/themes'

export default function ThemeToggle() {
  const { theme, cycleTheme } = useTheme()

  const currentTheme = themes.find(t => t.id === theme)

  return (
    <button
      onClick={cycleTheme}
      className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors text-sm"
      aria-label={`Current theme: ${currentTheme?.label}. Click to change.`}
      title={`Theme: ${currentTheme?.label}`}
    >
      {currentTheme?.icon || '◐'}
    </button>
  )
}
