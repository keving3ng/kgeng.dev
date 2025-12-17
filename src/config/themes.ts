export type ThemeId = 'light' | 'dark'

export interface Theme {
  id: ThemeId
  label: string
  icon: string
  cssClass: string
}

export const themes: Theme[] = [
  { id: 'light', label: 'Light', icon: '☀', cssClass: 'light' },
  { id: 'dark', label: 'Dark', icon: '☽', cssClass: 'dark' },
]

export function getSystemTheme(): ThemeId {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}
