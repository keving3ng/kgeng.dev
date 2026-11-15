// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useInitialMinLoading, resetInitialMinLoadingForTests } from './useInitialMinLoading'

describe('useInitialMinLoading', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    resetInitialMinLoadingForTests()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('holds initial loading for at least 1000ms then skips delay on subsequent loads', () => {
    const { result, rerender, unmount } = renderHook(
      ({ loading }) => useInitialMinLoading(loading, 'index', 1000),
      { initialProps: { loading: true } },
    )

    expect(result.current).toBe(true)

    // Fetch finishes after 200ms — should still hold loading until 1000ms total
    act(() => {
      vi.advanceTimersByTime(200)
    })
    rerender({ loading: false })
    expect(result.current).toBe(true)

    act(() => {
      vi.advanceTimersByTime(799)
    })
    expect(result.current).toBe(true)

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current).toBe(false)

    unmount()

    // Subsequent mount for the same key finishes immediately when loading becomes false
    const second = renderHook(
      ({ loading }) => useInitialMinLoading(loading, 'index', 1000),
      { initialProps: { loading: true } },
    )
    expect(second.result.current).toBe(true)

    second.rerender({ loading: false })
    expect(second.result.current).toBe(false)
  })
})
