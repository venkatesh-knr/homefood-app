// Small per-device flags kept in localStorage, not the database — for things that
// only need to survive on this device (a phone, a laptop) and are harmless to lose
// or re-show once on a new one, unlike real household state.
import { useCallback, useState } from 'react'

function readFlag(key: string): boolean {
  try {
    return localStorage.getItem(key) === '1'
  } catch {
    return false
  }
}

function useDeviceFlag(key: string) {
  const [on, setOn] = useState(() => readFlag(key))
  const markDone = useCallback(() => {
    try {
      localStorage.setItem(key, '1')
    } catch {
      /* private mode or storage disabled — just keep it in memory for this visit */
    }
    setOn(true)
  }, [key])
  return [on, markDone] as const
}

/** Whether this device has clicked through the first-run "invite your family" screen.
 * People + Invite stay reachable from the Home tab either way — re-showing the wizard
 * once on a new device is harmless, so this isn't database state. */
export function useOnboarded(householdId: string) {
  return useDeviceFlag(`homefood.onboarded.${householdId}`)
}

/** Whether this device has opened Week at a glance — the last item on the getting-
 * started checklist. Real "did the family see the poster" tracking would need a
 * shared, per-household signal; this is just enough for one Admin's own checklist. */
export function usePosterOpened(householdId: string) {
  return useDeviceFlag(`homefood.posterOpened.${householdId}`)
}
