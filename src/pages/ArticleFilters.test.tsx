// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import Home from './Home'
import Blog from './Blog'
import { MobilePostFilters } from '../components/Sidebar'

vi.mock('../hooks/usePosts', () => ({
  usePosts: () => ({
    posts: [
      { id: 'dev', title: 'building things', slug: 'building', tags: ['dev'], date: null },
      { id: 'thoughts', title: 'a thought', slug: 'thought', tags: ['thoughts'], date: null },
    ],
    loading: false,
    error: null,
  }),
}))
vi.mock('../services/posts', () => ({
  getPost: vi.fn().mockResolvedValue({ blocks: [] }),
}))
vi.mock('../components/ThemeToggle', () => ({ default: () => null }))

afterEach(cleanup)

describe('article feed filters', () => {
  it.each(['/', '/blog'])('filters the feed on %s and closes after selection', async (path) => {
    render(<MemoryRouter initialEntries={[path]}><Routes>
      <Route path="/" element={<Home />} />
      <Route path="/blog" element={<Blog />} />
    </Routes></MemoryRouter>)
    await screen.findAllByText('No content')
    const trigger = screen.getByRole('button', { name: /filter: all posts/ })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('group', { name: 'article filters' })).not.toBeInTheDocument()
    fireEvent.click(trigger)
    const menu = screen.getByRole('group', { name: 'article filters' })
    expect(within(menu).queryAllByRole('link')).toHaveLength(0)
    fireEvent.click(within(menu).getByRole('button', { name: 'dev' }))
    expect(screen.getByRole('heading', { name: 'building things' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'a thought' })).not.toBeInTheDocument()
    expect(screen.queryByRole('group', { name: 'article filters' })).not.toBeInTheDocument()
    expect(trigger).toHaveTextContent('filter: dev')
    expect(trigger).toHaveFocus()
    fireEvent.click(trigger)
    fireEvent.click(within(screen.getByRole('group', { name: 'article filters' })).getByRole('button', { name: 'all posts' }))
    expect(screen.getByRole('heading', { name: 'a thought' })).toBeInTheDocument()
  })

  it.each(['/cv', '/post/building'])('does not show a feed filter on %s', async (path) => {
    render(<MemoryRouter initialEntries={[path]}><Routes>
      <Route path="/cv" element={<Home />} />
      <Route path="/post/:slug" element={<Home />} />
    </Routes></MemoryRouter>)
    if (path.startsWith('/post/')) await screen.findByText('No content')
    expect(screen.queryByRole('button', { name: /filter:/ })).not.toBeInTheDocument()
  })

  it('dismisses the menu with Escape and outside pointer input', () => {
    render(<MobilePostFilters filters={['All Posts', 'dev']} activeFilter={null} onFilterChange={vi.fn()} />)
    const trigger = screen.getByRole('button', { name: /filter:/ })
    fireEvent.click(trigger)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveFocus()
    fireEvent.click(trigger)
    fireEvent.pointerDown(document.body)
    expect(screen.queryByRole('group', { name: 'article filters' })).not.toBeInTheDocument()
  })
})
