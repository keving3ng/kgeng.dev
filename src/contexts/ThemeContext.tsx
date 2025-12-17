import { createContext, useState, useEffect, useCallback, useContext, ReactNode } from 'react'
import type { ThemeId } from '../config/themes'
import { themes, getSystemTheme } from '../config/themes'

interface ThemeContextValue {
  theme: ThemeId
  setTheme: (theme: ThemeId) => void
  cycleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<ThemeId>(getSystemTheme)

  useEffect(() => {
    const root = document.documentElement

    // Remove all theme classes
    themes.forEach(t => {
      if (t.cssClass) {
        root.classList.remove(t.cssClass)
      }
    })

    // Apply the current theme class
    root.classList.add(theme)
  }, [theme])

  const cycleTheme = useCallback(() => {
    const currentIndex = themes.findIndex(t => t.id === theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex].id)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
