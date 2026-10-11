import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Both values are public by design: they ship inside every copy of the app.
// Data is protected by the row-level security rules in supabase/migrations.
// Never put the service_role / secret key or the database password here.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isConfigured = Boolean(url && anonKey)

const real: SupabaseClient | null = isConfigured
  ? createClient(url!, anonKey!, {
      auth: {
        persistSession: true, // stay signed in on this device
        autoRefreshToken: true, // renew the session in the background
        detectSessionInUrl: false, // we use 6-digit codes, not magic links
      },
    })
  : null

// While the demo home is open this points at an in-memory stand-in (src/demo) instead of the real project, so every
// query hook and screen runs unchanged against made-up data and nothing is sent anywhere.
let demo: SupabaseClient | null = null
export function setDemoClient(client: SupabaseClient | null) {
  demo = client
}

export const supabase: SupabaseClient | null = real
  ? new Proxy(real, {
      get(target, prop) {
        const active = demo ?? target
        const value = Reflect.get(active, prop, active)
        return typeof value === 'function' ? value.bind(active) : value
      },
    })
  : null
