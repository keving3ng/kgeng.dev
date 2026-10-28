// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter, useLocation } from 'react-router-dom'
import Layout from './Layout'
import Sidebar, { MobilePostFilters } from './Sidebar'
import { lists, socialLinks, tools } from '../config/navigation'
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
    for (const link of [...lists, ...tools]) {
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
    fireEvent.click(screen.getByRole('link', { name: 'projects' }))
    expect(screen.getByTestId('route')).toHaveTextContent(paths.projects)
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

  it('keeps mobile article filters separate from site links', () => {
    const onFilterChange = vi.fn()
    render(<MobilePostFilters filters={['All Posts', 'dev']} activeFilter={null} onFilterChange={onFilterChange} />)
    fireEvent.click(screen.getByRole('button', { name: /filter:/ }))
    expect(screen.queryAllByRole('link')).toHaveLength(0)
    fireEvent.click(screen.getByRole('button', { name: 'dev' }))
    expect(onFilterChange).toHaveBeenCalledWith('dev')
  })

  it('retains desktop navigation and filters', () => {
    const onFilterChange = vi.fn()
    render(<MemoryRouter><Sidebar filters={['All Posts', 'dev']} activeFilter="dev" onFilterChange={onFilterChange} links={socialLinks} tools={tools} lists={lists} /></MemoryRouter>)
    expect(screen.getByRole('link', { name: 'games' })).toHaveAttribute('href', paths.games)
    expect(screen.getByRole('link', { name: 'splits' })).toHaveAttribute('href', paths.tools.splits)
    fireEvent.click(screen.getByRole('button', { name: 'all posts' }))
    expect(onFilterChange).toHaveBeenCalledWith(null)
  })
})
