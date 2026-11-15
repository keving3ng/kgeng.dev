// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter, useLocation } from 'react-router-dom'
import Layout from './Layout'
import ThemeToggle from './ThemeToggle'
import NotionRenderer from './NotionRenderer'
import { ThemeProvider } from '../contexts/ThemeContext'
import { mainNav, socialLinks, tools } from '../config/navigation'
import { paths } from '../config/paths'

beforeAll(() => {
  // jsdom does not implement native modal dialog methods.
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
  vi.unstubAllGlobals()
})

function CurrentRoute() {
  return <output data-testid="route">{useLocation().pathname}</output>
}

describe('mobile site navigation', () => {
  it.each([paths.home, paths.cv, paths.tools.splits])('is available independently on %s', (route) => {
    render(<MemoryRouter initialEntries={[route]}><Layout><CurrentRoute /></Layout></MemoryRouter>)
    const trigger = screen.getByRole('button', { name: 'menu' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    fireEvent.click(trigger)
    const dialog = screen.getByRole('dialog', { name: 'navigation' })
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    for (const link of [...mainNav.filter((l) => l.label !== 'tools'), ...tools]) {
      expect(within(dialog).getByRole('link', { name: link.label.toLowerCase() })).toHaveAttribute('href', link.url)
    }
    for (const link of socialLinks) {
      const anchor = within(dialog).getByRole('link', { name: `${link.label.toLowerCase()} ↗` })
      expect(anchor).toHaveAttribute('href', link.url)
      expect(anchor).toHaveAttribute('target', '_blank')
      expect(anchor).toHaveAttribute('rel', 'noopener noreferrer')
    }
  })

  it('routes internal selections and closes the menu', () => {
    render(<MemoryRouter><Layout><CurrentRoute /></Layout></MemoryRouter>)
    const trigger = screen.getByRole('button', { name: 'menu' })
    fireEvent.click(trigger)
    fireEvent.click(screen.getByRole('link', { name: 'picks' }))
    expect(screen.getByTestId('route')).toHaveTextContent(paths.picks)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes with the close control or backdrop', () => {
    render(<MemoryRouter><Layout>content</Layout></MemoryRouter>)
    const trigger = screen.getByRole('button', { name: 'menu' })
    fireEvent.click(trigger)
    fireEvent.click(screen.getByRole('button', { name: 'close' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    fireEvent.click(trigger)
    fireEvent.click(screen.getByRole('dialog'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes when the viewport switches to desktop so the page stays usable', () => {
    let changeViewport: (() => void) | undefined
    const media = {
      matches: false,
      addEventListener: (_event: string, listener: () => void) => { changeViewport = listener },
      removeEventListener: vi.fn(),
    }
    vi.stubGlobal('matchMedia', () => media)
    render(<MemoryRouter><Layout>content</Layout></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: 'menu' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    act(() => {
      media.matches = true
      changeViewport?.()
    })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('enforces 44px touch targets on controls and responsive code blocks', () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <Layout>
            <ThemeToggle />
            <NotionRenderer
              blocks={[
                {
                  id: '1',
                  type: 'code',
                  code: {
                    rich_text: [
                      {
                        type: 'text',
                        text: { content: 'const a = 1;', link: null },
                        plain_text: 'const a = 1;',
                        annotations: { bold: false, italic: false, strikethrough: false, underline: false, code: false, color: 'default' },
                        href: null,
                      },
                    ],
                    language: 'javascript',
                  },
                },
              ]}
            />
          </Layout>
        </MemoryRouter>
      </ThemeProvider>,
    )
    expect(screen.getByRole('button', { name: 'menu' })).toHaveClass('min-h-[44px]', 'min-w-[44px]')
    expect(screen.getByRole('button', { name: /Current theme:/ })).toHaveClass('min-h-[44px]', 'min-w-[44px]')
    expect(document.querySelector('pre')).toHaveClass('overflow-x-auto', 'max-w-full')
  })
})
