// Whether this device has clicked through the first-run "invite your family"
// screen. Not database state on purpose: it's just so the wizard doesn't pop
// back up on every visit, and People + Invite stay reachable from the Home tab
// either way. Re-showing it once on a new device is harmless.
import { useCallback, useState } from 'react'

function storageKey(householdId: string): string {
  return `homefood.onboarded.${householdId}`
}

function readOnboarded(householdId: string): boolean {
  try {
    return localStorage.getItem(storageKey(householdId)) === '1'
  } catch {
    return false
  }
}

export function useOnboarded(householdId: string) {
  const [onboarded, setOnboarded] = useState(() => readOnboarded(householdId))
  const markDone = useCallback(() => {
    try {
      localStorage.setItem(storageKey(householdId), '1')
    } catch {
      /* private mode or storage disabled — just keep it in memory for this visit */
    }
    setOnboarded(true)
  }, [householdId])
  return [onboarded, markDone] as const
}
