import { describe, expect, it } from 'vitest'
import { paths, postPath, postsIndexPath, projectPath, projectsIndexPath, recipePath } from './paths'

describe('route paths and permalink builders', () => {
  it('defines canonical static routes and encodes dynamic post/project/recipe slugs', () => {
    expect(paths.home).toBe('/')
    expect(paths.cv).toBe('/cv')
    expect(projectsIndexPath).toBe('/?type=project')
    expect(postsIndexPath).toBe('/?type=post')
    expect(paths.recipes).toBe('/picks/recipes')
    expect(paths.tools.splits).toBe('/tools/splits')
    expect(paths.tools.recipeer).toBe('/tools/recipeer')
    expect(postPath('hello-world')).toBe('/post/hello-world')
    expect(postPath('a b')).toBe('/post/a%20b')
    expect(projectPath('matchamap')).toBe('/work/matchamap')
    expect(recipePath('ramen-1')).toBe('/picks/recipes/ramen-1')
  })
})
