// Whether the demo home is open, and whose view it shows. Kept in memory only: closing the tab ends the demo,
// reloading starts from the normal app, and nothing about it is written to the device.
import { useSyncExternalStore } from 'react'

export type DemoRole = 'admin' | 'planner' | 'member'
export type DemoState = { active: boolean; role: DemoRole }

let state: DemoState = { active: false, role: 'admin' }
const listeners = new Set<() => void>()

function set(next: DemoState) {
  state = next
  listeners.forEach((l) => l())
}

export const getDemoState = () => state
export const isDemoActive = () => state.active

export function subscribeDemo(l: () => void) {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}

export function useDemoState(): DemoState {
  return useSyncExternalStore(subscribeDemo, getDemoState)
}

export function setDemoActive(active: boolean) {
  set({ active, role: 'admin' })
}

export function setDemoRole(role: DemoRole) {
  set({ ...state, role })
}

/** The fake login ids the demo uses for the three views (see demoData.ts). */
export const DEMO_USER_IDS: Record<DemoRole, string> = {
  admin: 'demo-user-amma',
  planner: 'demo-user-appa',
  member: 'demo-user-kavi',
}
