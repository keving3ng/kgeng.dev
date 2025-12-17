export type ThemeId = 'system' | 'light' | 'dark'

export interface Theme {
  id: ThemeId
  label: string
  icon: string
  cssClass: string
}

export const themes: Theme[] = [
  { id: 'system', label: 'System', icon: '◐', cssClass: '' },
  { id: 'light', label: 'Light', icon: '☀', cssClass: 'light' },
  { id: 'dark', label: 'Dark', icon: '☽', cssClass: 'dark' },
  // Future wacky themes:
  // { id: 'retro', label: 'Retro', icon: '📺', cssClass: 'theme-retro' },
  // { id: 'neon', label: 'Neon', icon: '💜', cssClass: 'theme-neon' },
  // { id: 'forest', label: 'Forest', icon: '🌲', cssClass: 'theme-forest' },
]

export const defaultTheme: ThemeId = 'system'
