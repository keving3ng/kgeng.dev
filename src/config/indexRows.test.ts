import { describe, expect, it } from 'vitest'
import { MAX_DESCRIPTION_LENGTH, buildIndexRows, formatShortDate } from './indexRows'

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
  it('includes dates on projects, tools, posts and pages', () => {
    const rows = buildIndexRows([
      { id: '1', title: 'Test Post', slug: 'test-post', tags: ['dev'], date: '2026-04-12' },
    ])
    const post = rows.find((r) => r.id === 'post:test-post')
    const tool = rows.find((r) => r.id === 'tool:splits')
    const project = rows.find((r) => r.id === 'project:kgeng-dev')
    const page = rows.find((r) => r.id === 'page:picks')

    expect(formatShortDate(post?.date)).toBe('apr 2026')
    expect(post?.description).toBe('#dev')
    expect(formatShortDate(tool?.date)).toBe('jan 2025')
    expect(formatShortDate(project?.date)).toBe('nov 2026')
    expect(formatShortDate(page?.date)).toBe('nov 2026')
  })

  it('sorts rows by date descending by default with undated rows last', () => {
    const rows = buildIndexRows([
      { id: '1', title: 'Future Post', slug: 'future-post', tags: ['dev'], date: '2099-05-01' },
      { id: '2', title: 'Old Post', slug: 'old-post', tags: ['dev'], date: '2020-01-01' },
      { id: '3', title: 'Undated Post', slug: 'undated-post', tags: ['dev'], date: null },
    ])

    expect(rows[0]?.id).toBe('post:future-post')
    const oldIdx = rows.findIndex((r) => r.id === 'post:old-post')
    const splitsIdx = rows.findIndex((r) => r.id === 'tool:splits')
    const undatedIdx = rows.findIndex((r) => r.id === 'post:undated-post')

    expect(splitsIdx).toBeLessThan(oldIdx)
    expect(oldIdx).toBeLessThan(undatedIdx)
    expect(rows[rows.length - 1]?.id).toBe('post:undated-post')
  })

  it('keeps static descriptions within MAX_DESCRIPTION_LENGTH', () => {
    const rows = buildIndexRows([])
    for (const row of rows) {
      expect(row.description.length).toBeLessThanOrEqual(MAX_DESCRIPTION_LENGTH)
    }
  })
})
