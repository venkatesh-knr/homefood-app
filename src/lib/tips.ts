// First-visit tips: one short pointer the first time each main screen opens on this device, dismissed with "Got it".
// Kept per device in localStorage (a harmless nudge, not household data). "Show tips again" on the Home tab clears them.
// While the demo home is open the tips live in memory only, so they start fresh each time and leave nothing behind.
import { useSyncExternalStore } from 'react'
import { isDemoActive } from '../demo/demoState'

export const TIP_IDS = ['today', 'week', 'slotEditor', 'dishes', 'dishDetail', 'glance', 'discussion', 'home'] as const
export type TipId = (typeof TIP_IDS)[number]

const KEY = (id: string) => `homefood.tip.${id}`

function readStored(): Set<string> {
  const seen = new Set<string>()
  try {
    for (const id of TIP_IDS) if (localStorage.getItem(KEY(id)) === '1') seen.add(id)
  } catch {
    /* storage unavailable (private mode): tips simply show again next visit */
  }
  return seen
}

let seen: Set<string> = readStored()
let snapshotKey = 0
const listeners = new Set<() => void>()
const emit = () => {
  snapshotKey++
  listeners.forEach((l) => l())
}

export function dismissTip(id: TipId) {
  if (seen.has(id)) return
  seen = new Set(seen).add(id)
  if (!isDemoActive()) {
    try {
      localStorage.setItem(KEY(id), '1')
    } catch {
      /* ignore */
    }
  }
  emit()
}

/** "Show tips again": every tip will appear the next time its screen opens. */
export function resetTips() {
  seen = new Set()
  if (!isDemoActive()) {
    try {
      for (const id of TIP_IDS) localStorage.removeItem(KEY(id))
    } catch {
      /* ignore */
    }
  }
  emit()
}

/** The demo starts with every tip unseen, in memory; when it ends the device's real choices come back. */
export function setTipsForDemo(on: boolean) {
  seen = on ? new Set() : readStored()
  emit()
}

export function isTipSeen(id: TipId) {
  return seen.has(id)
}

export function useTipVisible(id: TipId): boolean {
  useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => {
        listeners.delete(l)
      }
    },
    () => snapshotKey,
  )
  return !seen.has(id)
}
