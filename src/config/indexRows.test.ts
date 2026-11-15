import { describe, expect, it } from 'vitest'
import { buildIndexRows, formatShortDate } from './indexRows'

describe('formatShortDate', () => {
  it('formats YYYY-MM and YYYY-MM-DD as lowercase mmm yyyy without timezone drift', () => {
    expect(formatShortDate('2026-11')).toBe('nov 2026')
    expect(formatShortDate('2025-01-01')).toBe('jan 2025')
    expect(formatShortDate('2024-10-01T00:00:00Z')).toBe('oct 2024')
  })

  it('returns em-dash for missing or invalid dates', () => {
    expect(formatShortDate(null)).toBe('—')
    expect(formatShortDate(undefined)).toBe('—')
    expect(formatShortDate('not-a-date')).toBe('—')
  })
})

describe('buildIndexRows', () => {
  it('includes dates on projects, tools and posts', () => {
    const rows = buildIndexRows([
      { id: '1', title: 'Test Post', slug: 'test-post', tags: ['dev'], date: '2026-04-12' },
    ])
    const post = rows.find((r) => r.id === 'post:test-post')
    const tool = rows.find((r) => r.id === 'tool:splits')
    const project = rows.find((r) => r.id === 'project:kgeng.dev')

    expect(formatShortDate(post?.date)).toBe('apr 2026')
    expect(formatShortDate(tool?.date)).toBe('jan 2025')
    expect(formatShortDate(project?.date)).toBe('nov 2026')
  })
})
