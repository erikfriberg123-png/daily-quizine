import { supabase, anonSupabase, supabaseUrl, supabaseAnonKey } from './supabase'

const USERNAME_RE = /^[A-Za-zÅÄÖåäö0-9 _-]+$/

export function validateUsername(value: string): string | null {
  const t = value.trim()
  if (t.length < 2) return 'Minst 2 tecken'
  if (t.length > 30) return 'Max 30 tecken'
  if (!USERNAME_RE.test(t)) return 'Bokstäver, siffror, mellanslag, - och _'
  return null
}

// Availability is a public check — use anonSupabase to avoid the auth lock.
export async function checkUsernameAvailable(username: string, excludeUserId?: string): Promise<boolean> {
  let query = anonSupabase.from('profiles').select('id').eq('username', username.trim())
  if (excludeUserId) query = query.neq('id', excludeUserId)
  const { data } = await query.maybeSingle()
  return !data
}

// Use raw fetch + session JWT so we never wait on the supabase-js auth lock.
export async function saveUsername(userId: string, username: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Inte inloggad.')

  const res = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
    method: 'POST',
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify({ id: userId, username: username.trim() }),
  })
  if (!res.ok) throw new Error(`Kunde inte spara smeknamnet (${res.status})`)
}
