// @vitest-environment jsdom
import { describe, expect, it, vi, beforeAll, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '../contexts/ThemeContext'
import CV from './CV'
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

afterEach(() => {
  cleanup()
})

describe('CV', () => {
  it('renders terminal breadcrumb and CV sections on /cv', () => {
    render(
      <ThemeProvider>
        <MemoryRouter initialEntries={[paths.cv]}>
          <CV />
        </MemoryRouter>
      </ThemeProvider>,
    )

    expect(screen.getByRole('navigation', { name: 'breadcrumb' })).toHaveTextContent('kgeng@dev:~/about/cv$')
    expect(screen.getByText('experience')).toBeInTheDocument()
    expect(screen.getByText('education')).toBeInTheDocument()
    expect(screen.getByText('skills')).toBeInTheDocument()
    expect(screen.getByText('contact')).toBeInTheDocument()
    expect(screen.getByText('esc back')).toBeInTheDocument()
  })
})
