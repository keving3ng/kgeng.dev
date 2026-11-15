import { useCallback, useState } from 'react'
import { verifyTripAdmin } from '../services/trips'

const STORAGE_KEY = 'kgeng_trips_admin_token'

export function useTripAdmin() {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    return window.sessionStorage.getItem(STORAGE_KEY)
  })
  const [editMode, setEditMode] = useState(false)

  const unlock = useCallback(async (passcode: string): Promise<boolean> => {
    const ok = await verifyTripAdmin(passcode)
    if (ok) {
      window.sessionStorage.setItem(STORAGE_KEY, passcode)
      setToken(passcode)
      setEditMode(true)
    }
    return ok
  }, [])

  const lock = useCallback(() => {
    window.sessionStorage.removeItem(STORAGE_KEY)
    setToken(null)
    setEditMode(false)
  }, [])

  return {
    token,
    isAuthenticated: Boolean(token),
    editMode,
    setEditMode,
    unlock,
    lock,
  }
}
