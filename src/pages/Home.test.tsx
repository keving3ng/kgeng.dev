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

describe('Home header navigation tabs', () => {
  it('highlights blog tab as active on / and renders feed', () => {
    renderHome(paths.home)

    const blogLink = screen.getByRole('link', { name: 'blog' })
    const cvLink = screen.getByRole('link', { name: 'cv' })
    const projectsLink = screen.getByRole('link', { name: 'projects' })

    expect(blogLink).toHaveClass('text-content font-medium')
    expect(cvLink).toHaveClass('text-content-muted')
    expect(projectsLink).toHaveClass('text-content-muted')
  })

  it('highlights cv tab as active on /cv and renders CVList', () => {
    renderHome(paths.cv)

    const blogLink = screen.getByRole('link', { name: 'blog' })
    const cvLink = screen.getByRole('link', { name: 'cv' })
    const projectsLink = screen.getByRole('link', { name: 'projects' })

    expect(blogLink).toHaveClass('text-content-muted')
    expect(cvLink).toHaveClass('text-content font-medium')
    expect(projectsLink).toHaveClass('text-content-muted')
    expect(screen.getByText('education')).toBeInTheDocument()
  })

  it('highlights projects tab as active on /projects and renders ProjectsList', () => {
    renderHome(paths.projects)

    const blogLink = screen.getByRole('link', { name: 'blog' })
    const cvLink = screen.getByRole('link', { name: 'cv' })
    const projectsLink = screen.getByRole('link', { name: 'projects' })

    expect(blogLink).toHaveClass('text-content-muted')
    expect(cvLink).toHaveClass('text-content-muted')
    expect(projectsLink).toHaveClass('text-content font-medium')
    expect(screen.getByText('matchamap ↗')).toBeInTheDocument()
  })
})
