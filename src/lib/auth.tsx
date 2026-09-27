import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

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
  const [session, setSession] = useState<Session | null>(null)
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
      await supabase?.auth.signOut()
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
