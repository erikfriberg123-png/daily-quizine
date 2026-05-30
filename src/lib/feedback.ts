import { supabase } from './supabase'
import { getSegmentConfig } from '../config/segments'

export async function submitFeedback(
  message: string,
  userId: string | null,
  username: string | null,
): Promise<{ error?: string }> {
  const { tablePrefix } = getSegmentConfig()
  const table = `${tablePrefix}feedback`

  if (userId) {
    const cooldownStart = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count } = await supabase
      .from(table)
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gt('created_at', cooldownStart)
    if ((count ?? 0) >= 3) {
      return { error: 'Du har skickat för mycket feedback nyligen. Försök igen om en stund.' }
    }
  }

  const { error } = await supabase.from(table).insert({
    user_id: userId ?? null,
    username: username ?? null,
    message: message.trim(),
    source: 'daily',
  })
  return error ? { error: error.message } : {}
}
