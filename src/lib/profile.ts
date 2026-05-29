import { supabase } from './supabase'

const USERNAME_RE = /^[A-Za-zÅÄÖåäö0-9 _-]+$/

export function validateUsername(value: string): string | null {
  const t = value.trim()
  if (t.length < 2) return 'Minst 2 tecken'
  if (t.length > 30) return 'Max 30 tecken'
  if (!USERNAME_RE.test(t)) return 'Bokstäver, siffror, mellanslag, - och _'
  return null
}

export async function checkUsernameAvailable(username: string, excludeUserId?: string): Promise<boolean> {
  let query = supabase.from('profiles').select('id').eq('username', username.trim())
  if (excludeUserId) query = query.neq('id', excludeUserId)
  const { data } = await query.maybeSingle()
  return !data
}

export async function saveUsername(userId: string, username: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: userId, username: username.trim() }, { onConflict: 'id' })
  if (error) throw error
}
