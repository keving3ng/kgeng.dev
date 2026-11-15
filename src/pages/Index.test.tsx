// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '../contexts/ThemeContext'
import Index from './Index'

beforeAll(() => {
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

vi.mock('../hooks/usePosts', () => ({
  usePosts: () => ({
    posts: [{ id: '1', title: 'Hello World', slug: 'hello-world', tags: ['dev'], date: null }],
    loading: false,
    error: null,
  }),
}))

afterEach(() => cleanup())

function renderIndex(route = '/') {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[route]}>
        <Index />
      </MemoryRouter>
    </ThemeProvider>,
  )
}

describe('Index', () => {
  it('lists projects, tools and posts together', () => {
    renderIndex()
    expect(screen.getByRole('link', { name: 'matchamap' })).toHaveAttribute('href', '/work/matchamap')
    expect(screen.getByRole('link', { name: 'splits' })).toHaveAttribute('href', '/tools/splits')
    expect(screen.getByRole('link', { name: 'hello world' })).toHaveAttribute('href', '/post/hello-world')
  })

  it('filters by type from the url and via the filter buttons', () => {
    renderIndex('/?type=tool')
    expect(screen.queryByRole('link', { name: 'matchamap' })).toBeNull()
    expect(screen.getByRole('link', { name: 'splits' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'post' }))
    expect(screen.queryByRole('link', { name: 'splits' })).toBeNull()
    expect(screen.getByRole('link', { name: 'hello world' })).toBeInTheDocument()
  })

  it('runs terminal commands and hides the prompt on mobile via css', () => {
    renderIndex()
    const terminal = screen.getByRole('region', { name: 'terminal' })
    expect(terminal).toHaveClass('hidden', 'md:block')
    const input = screen.getByRole('textbox', { name: 'terminal command' })
    fireEvent.change(input, { target: { value: 'nope' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(screen.getByText('command not found: nope')).toBeInTheDocument()
  })

  it('selects rows with arrow keys and opens the selected row with enter', () => {
    renderIndex('/?type=tool')
    const items = screen.getAllByRole('listitem')
    fireEvent.keyDown(window, { key: 'ArrowDown' })
    expect(items[0]).toHaveAttribute('aria-current', 'true')
    fireEvent.keyDown(window, { key: 'ArrowDown' })
    expect(items[1]).toHaveAttribute('aria-current', 'true')
    fireEvent.keyDown(window, { key: 'ArrowDown' })
    expect(items[1]).toHaveAttribute('aria-current', 'true')
    fireEvent.keyDown(window, { key: 'ArrowUp' })
    expect(items[0]).toHaveAttribute('aria-current', 'true')
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(items[0]).not.toHaveAttribute('aria-current')
  })

  it('leaves arrow keys to command history inside the terminal', () => {
    renderIndex()
    fireEvent.keyDown(screen.getByRole('textbox', { name: 'terminal command' }), { key: 'ArrowDown' })
    expect(screen.queryAllByRole('listitem').some((li) => li.hasAttribute('aria-current'))).toBe(false)
  })

  it('cycles filter options with left and right arrow keys', () => {
    renderIndex()
    const allBtn = screen.getByRole('button', { name: 'all' })
    const projectBtn = screen.getByRole('button', { name: 'project' })
    const toolBtn = screen.getByRole('button', { name: 'tool' })

    expect(allBtn).toHaveAttribute('aria-pressed', 'true')
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(projectBtn).toHaveAttribute('aria-pressed', 'true')
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(toolBtn).toHaveAttribute('aria-pressed', 'true')
    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    expect(projectBtn).toHaveAttribute('aria-pressed', 'true')
  })
})
