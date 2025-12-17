import { createContext, useState, useEffect, useCallback, useContext, ReactNode } from 'react'
import type { ThemeId } from '../config/themes'
import { themes, defaultTheme } from '../config/themes'

interface ThemeContextValue {
  theme: ThemeId
  setTheme: (theme: ThemeId) => void
  resolvedTheme: 'light' | 'dark'
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
  const [theme, setTheme] = useState<ThemeId>(defaultTheme)
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  const getSystemTheme = useCallback((): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }, [])

  useEffect(() => {
    const root = document.documentElement

    // Remove all theme classes
    themes.forEach(t => {
      if (t.cssClass) {
        root.classList.remove(t.cssClass)
      }
    })

    // Determine which class to apply
    let appliedTheme: 'light' | 'dark'
    if (theme === 'system') {
      appliedTheme = getSystemTheme()
    } else {
      appliedTheme = theme as 'light' | 'dark'
    }

    // Apply the class
    root.classList.add(appliedTheme)
    setResolvedTheme(appliedTheme)
  }, [theme, getSystemTheme])

  // Listen for system preference changes when theme is 'system'
  useEffect(() => {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      const systemTheme = getSystemTheme()
      document.documentElement.classList.remove('light', 'dark')
      document.documentElement.classList.add(systemTheme)
      setResolvedTheme(systemTheme)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme, getSystemTheme])

  const cycleTheme = useCallback(() => {
    const currentIndex = themes.findIndex(t => t.id === theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex].id)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
