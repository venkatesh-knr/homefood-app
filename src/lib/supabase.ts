import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Both values are public by design: they ship inside every copy of the app.
// Data is protected by the row-level security rules in supabase/migrations.
// Never put the service_role / secret key or the database password here.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isConfigured = Boolean(url && anonKey)

export const supabase: SupabaseClient | null = isConfigured
  ? createClient(url!, anonKey!, {
      auth: {
        persistSession: true, // stay signed in on this device
        autoRefreshToken: true, // renew the session in the background
        detectSessionInUrl: false, // we use 6-digit codes, not magic links
      },
    })
  : null
