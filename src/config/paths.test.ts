import { describe, expect, it } from 'vitest'
import { legacyRedirects, paths, postPath } from './paths'

describe('route paths and permalink builders', () => {
  it('defines canonical static routes and encodes dynamic post slugs', () => {
    expect(paths.home).toBe('/')
    expect(paths.cv).toBe('/cv')
    expect(paths.work).toBe('/work')
    expect(paths.writing).toBe('/writing')
    expect(paths.recipes).toBe('/picks/recipes')
    expect(paths.tools.splits).toBe('/tools/splits')
    expect(paths.tools.recipeer).toBe('/tools/recipeer')
    expect(postPath('hello-world')).toBe('/post/hello-world')
    expect(postPath('a b')).toBe('/post/a%20b')
  })

  it('redirects legacy paths to their new homes', () => {
    expect(legacyRedirects['/blog']).toBe('/writing')
    expect(legacyRedirects['/projects']).toBe('/work')
    expect(legacyRedirects['/recipes']).toBe('/picks/recipes')
  })
})
