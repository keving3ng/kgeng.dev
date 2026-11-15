import { describe, expect, it } from 'vitest'
import { runCommand } from './commands'
import type { IndexRow } from './indexRows'

const rows: IndexRow[] = [
  { id: 'p', name: 'matchamap', type: 'project', description: 'matcha.', href: 'https://matchamap.club', external: true },
  { id: 't', name: 'splits', type: 'tool', description: 'splits.', href: '/tools/splits' },
]

describe('runCommand', () => {
  it('reports unknown commands', () => {
    expect(runCommand('foo', { rows }).output).toEqual(['command not found: foo'])
  })
  it('cd navigates and rejects unknown dirs', () => {
    expect(runCommand('cd work', { rows }).navigate).toBe('/work')
    expect(runCommand('cd ~/picks', { rows }).navigate).toBe('/picks')
    expect(runCommand('cd', { rows }).navigate).toBe('/')
    expect(runCommand('cd nope', { rows }).output[0]).toContain('no such file')
  })
  it('ls lists rows by directory', () => {
    expect(runCommand('ls work', { rows }).output).toEqual(['matchamap'])
    expect(runCommand('ls tools', { rows }).output).toEqual(['splits'])
  })
  it('open handles external and internal rows', () => {
    expect(runCommand('open matchamap', { rows }).open).toBe('https://matchamap.club')
    expect(runCommand('open splits', { rows }).navigate).toBe('/tools/splits')
  })
  it('handles theme, clear and blank input', () => {
    expect(runCommand('theme dark', { rows }).theme).toBe('dark')
    expect(runCommand('clear', { rows }).clear).toBe(true)
    expect(runCommand('   ', { rows }).output).toEqual([])
  })
})
