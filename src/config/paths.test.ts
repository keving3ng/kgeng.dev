import { describe, expect, it } from 'vitest'
import { gamePath, paths, postPath } from './paths'

describe('route paths and permalink builders', () => {
  it('defines canonical static routes and encodes dynamic post/game slugs', () => {
    expect(paths.home).toBe('/')
    expect(paths.cv).toBe('/cv')
    expect(paths.projects).toBe('/projects')
    expect(paths.games).toBe('/games')
    expect(paths.tools.splits).toBe('/tools/splits')
    expect(paths.tools.recipeer).toBe('/tools/recipeer')
    expect(postPath('hello-world')).toBe('/post/hello-world')
    expect(postPath('a b')).toBe('/post/a%20b')
    expect(gamePath('hello')).toBe('/games/hello')
    expect(gamePath('a b')).toBe('/games/a%20b')
  })
})
