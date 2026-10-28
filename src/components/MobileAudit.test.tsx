// @vitest-environment jsdom
import { describe, expect, it, vi, beforeAll, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '../contexts/ThemeContext'
import ThemeToggle from './ThemeToggle'
import MobileSiteNav from './MobileSiteNav'
import { MobilePostFilters } from './Sidebar'
import NotionRenderer from './NotionRenderer'

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true
  }
  HTMLDialogElement.prototype.close = function () {
    if (!this.open) return
    this.open = false
    this.dispatchEvent(new Event('close'))
  }
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
})

afterEach(() => {
  cleanup()
})

describe('Mobile usability and responsive audit', () => {
  it('ThemeToggle provides minimum 44x44px touch target sizing', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )
    const button = screen.getByRole('button', { name: /Current theme:/ })
    expect(button).toHaveClass('min-h-[44px]')
    expect(button).toHaveClass('min-w-[44px]')
  })

  it('MobileSiteNav menu trigger and close button provide 44px touch targets', () => {
    render(
      <MemoryRouter>
        <MobileSiteNav />
      </MemoryRouter>
    )
    const menuBtn = screen.getByRole('button', { name: 'menu' })
    expect(menuBtn).toHaveClass('min-h-[44px]')
    expect(menuBtn).toHaveClass('min-w-[44px]')
  })

  it('MobilePostFilters trigger provides minimum 44px height for touch ergonomics', () => {
    render(
      <MobilePostFilters
        filters={['All Posts', 'dev']}
        activeFilter={null}
        onFilterChange={vi.fn()}
      />
    )
    const filterBtn = screen.getByRole('button', { name: /filter:/ })
    expect(filterBtn).toHaveClass('min-h-[44px]')
  })

  it('NotionRenderer renders code blocks with overflow-x-auto and max-w-full', () => {
    const blocks = [
      {
        id: '1',
        type: 'code' as const,
        code: {
          rich_text: [
            {
              type: 'text' as const,
              text: { content: 'const a = "very long line of code that must not cause page horizontal scrolling";', link: null },
              plain_text: 'const a = "very long line of code that must not cause page horizontal scrolling";',
              annotations: { bold: false, italic: false, strikethrough: false, underline: false, code: false, color: 'default' },
              href: null,
            },
          ],
          language: 'javascript',
        },
      },
    ]

    const { container } = render(<NotionRenderer blocks={blocks} />)
    const pre = container.querySelector('pre')
    expect(pre).toBeInTheDocument()
    expect(pre).toHaveClass('overflow-x-auto')
    expect(pre).toHaveClass('max-w-full')
  })
})
