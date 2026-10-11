import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { DEMO_USER_IDS, isDemoActive, useDemoState } from '../demo/demoState'
import { stopDemo } from '../demo/demo'

type AuthState = {
  session: Session | null
  loading: boolean
  sendCode: (email: string) => Promise<void>
  verifyCode: (email: string, code: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export class AuthError extends Error {
  kind: 'wrongCode' | 'tooMany' | 'generic'
  constructor(kind: AuthError['kind'], message?: string) {
    super(message ?? kind)
    this.kind = kind
  }
}

function toAuthError(err: { status?: number; message?: string }): AuthError {
  if (err.status === 429) return new AuthError('tooMany', err.message)
  if (err.status === 401 || err.status === 403 || /expired|invalid/i.test(err.message ?? '')) {
    return new AuthError('wrongCode', err.message)
  }
  return new AuthError('generic', err.message)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [realSession, setSession] = useState<Session | null>(null)
  const demo = useDemoState()
  // In the demo home there is no real login: a made-up session stands in, one per view (Admin / Planner / Member).
  const demoSession = useMemo(() => ({ user: { id: DEMO_USER_IDS[demo.role] } }) as unknown as Session, [demo.role])
  const session = demo.active ? demoSession : realSession
  const [loading, setLoading] = useState(Boolean(supabase))

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  const value: AuthState = {
    session,
    loading,
    async sendCode(email) {
      if (!supabase) throw new AuthError('generic')
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      })
      if (error) throw toAuthError(error)
    },
    async verifyCode(email, code) {
      if (!supabase) throw new AuthError('generic')
      const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' })
      if (error) throw toAuthError(error)
    },
    async signOut() {
      if (isDemoActive()) return stopDemo()
      await supabase?.auth.signOut({ scope: 'local' }) // this device only; "Sign out on all devices" is on the Home tab
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
