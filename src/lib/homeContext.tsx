import { createContext, useContext, type ReactNode } from 'react'
import type { Household, Profile } from './people'

type HomeState = { profile: Profile; household: Household }

const HomeCtx = createContext<HomeState | null>(null)

export function HomeProvider({ value, children }: { value: HomeState; children: ReactNode }) {
  return <HomeCtx.Provider value={value}>{children}</HomeCtx.Provider>
}

/** My profile + household, loaded once by <AppShell> and shared with every tab. */
export function useHome(): HomeState {
  const ctx = useContext(HomeCtx)
  if (!ctx) throw new Error('useHome must be used inside <AppShell>')
  return ctx
}
