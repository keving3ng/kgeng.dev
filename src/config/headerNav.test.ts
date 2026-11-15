import { describe, expect, it } from 'vitest'
import { promptPath } from './headerNav'

describe('header navigation helpers', () => {
  it('builds shell-style prompt paths', () => {
    expect(promptPath('/')).toBe('~')
    expect(promptPath('/work')).toBe('~/work')
    expect(promptPath('/post/hi')).toBe('~/writing/hi')
    expect(promptPath('/cv')).toBe('~/about/cv')
    expect(promptPath('/picks/recipes')).toBe('~/picks/recipes')
  })
})
