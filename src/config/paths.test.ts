import { describe, expect, it } from 'vitest'
import { gamePath, paths, postPath } from './paths'

describe('paths', () => {
  it('uses root for home', () => {
    expect(paths.home).toBe('/')
  })

  it('keeps tool routes under /tools', () => {
    expect(paths.tools.splits).toBe('/tools/splits')
    expect(paths.tools.boba).toBe('/tools/boba')
  })

  it('exposes games hub path', () => {
    expect(paths.games).toBe('/games')
  })
})

describe('postPath', () => {
  it('builds a permalink and encodes the slug', () => {
    expect(postPath('hello-world')).toBe('/post/hello-world')
    expect(postPath('a b')).toBe('/post/a%20b')
  })
})

describe('gamePath', () => {
  it('builds games subpaths and encodes the slug', () => {
    expect(gamePath('hello')).toBe('/games/hello')
    expect(gamePath('a b')).toBe('/games/a%20b')
  })
})
