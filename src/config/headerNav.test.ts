import { describe, expect, it } from 'vitest'
import { parentPath, promptPath, promptSegments } from './headerNav'

describe('header navigation helpers', () => {
  it('builds shell-style prompt paths', () => {
    expect(promptPath('/')).toBe('~')
    expect(promptPath('/work')).toBe('~/work')
    expect(promptPath('/post/hi')).toBe('~/writing/hi')
    expect(promptPath('/cv')).toBe('~/about/cv')
    expect(promptPath('/picks/recipes')).toBe('~/picks/recipes')
  })

  it('builds clickable breadcrumb segments', () => {
    expect(promptSegments('/')).toEqual([{ label: '~', to: null }])
    expect(promptSegments('/picks/recipes')).toEqual([
      { label: '~', to: '/' },
      { label: 'picks', to: '/picks' },
      { label: 'recipes', to: null },
    ])
    expect(promptSegments('/tools/splits')).toEqual([
      { label: '~', to: '/' },
      { label: 'tools', to: '/?type=tool' },
      { label: 'splits', to: null },
    ])
  })

  it('resolves parent paths for seamless back navigation', () => {
    expect(parentPath('/')).toBeNull()
    expect(parentPath('/picks')).toBe('/')
    expect(parentPath('/picks/recipes')).toBe('/picks')
    expect(parentPath('/post/hi')).toBe('/writing')
    expect(parentPath('/cv')).toBe('/about')
  })
})
