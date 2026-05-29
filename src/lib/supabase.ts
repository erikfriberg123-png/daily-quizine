import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// Clear any expired auth sessions before creating the client.
// supabase-js can hang indefinitely trying to refresh an expired token via its
// internal auth lock, which blocks all data requests with no visible error.
try {
  for (const key of Object.keys(localStorage)) {
    if (!key.startsWith('sb-') || !key.endsWith('-auth-token')) continue
    const session = JSON.parse(localStorage.getItem(key) ?? 'null')
    if (session?.expires_at && session.expires_at < Date.now() / 1000) {
      localStorage.removeItem(key)
    }
  }
} catch { /* storage unavailable */ }

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})
