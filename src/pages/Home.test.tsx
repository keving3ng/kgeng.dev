// @vitest-environment jsdom
import { describe, expect, it, vi, beforeAll, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '../contexts/ThemeContext'
import Home from './Home'
import { paths } from '../config/paths'

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
  usePosts: () => ({ posts: [], loading: false, error: null }),
}))

vi.mock('../hooks/usePostFilters', () => ({
  usePostFilters: () => ['All Posts'],
}))

afterEach(() => {
  cleanup()
})

function renderHome(route: string) {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[route]}>
        <Home />
      </MemoryRouter>
    </ThemeProvider>
  )
}

describe('Home (writing / cv)', () => {
  it('renders writing prompt path on /writing', () => {
    renderHome(paths.writing)

    expect(screen.getByRole('navigation', { name: 'breadcrumb' })).toHaveTextContent('kgeng@dev:~/writing$')
  })

  it('renders CVList on /cv', () => {
    renderHome(paths.cv)

    expect(screen.getByRole('navigation', { name: 'breadcrumb' })).toHaveTextContent('kgeng@dev:~/about/cv$')
    expect(screen.getByText('education')).toBeInTheDocument()
  })
})
