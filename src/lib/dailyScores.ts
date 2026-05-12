import { supabase } from './supabase'
import { getParisWeekBounds } from './dailyUtils'

export interface LeaderboardEntry {
  username: string
  total_score: number
  days_played: number
  rank: number
}

export async function submitDailyScore(params: {
  userId: string
  username: string
  date: string
  score: number
  correct: number
}): Promise<void> {
  const { error } = await supabase.from('daily_scores').upsert(
    {
      user_id: params.userId,
      username: params.username,
      date: params.date,
      score: params.score,
      correct: params.correct,
    },
    { onConflict: 'user_id,date' }
  )
  if (error) throw error
}

export async function getWeeklyLeaderboard(): Promise<LeaderboardEntry[]> {
  const { start, end } = getParisWeekBounds()

  const { data, error } = await supabase
    .from('daily_scores')
    .select('username, score, date')
    .gte('date', start)
    .lte('date', end)
    .not('user_id', 'is', null)
    .order('score', { ascending: false })

  if (error) throw error

  // Aggregate by username client-side
  const map = new Map<string, { total: number; days: number }>()
  for (const row of data ?? []) {
    const key = row.username as string
    const prev = map.get(key) ?? { total: 0, days: 0 }
    map.set(key, { total: prev.total + (row.score as number), days: prev.days + 1 })
  }

  return Array.from(map.entries())
    .map(([username, { total, days }]) => ({
      username,
      total_score: total,
      days_played: days,
      rank: 0,
    }))
    .sort((a, b) => b.total_score - a.total_score)
    .map((entry, i) => ({ ...entry, rank: i + 1 }))
}

export async function getMyTodayScore(
  userId: string,
  date: string,
): Promise<{ score: number; correct: number } | null> {
  const { data } = await supabase
    .from('daily_scores')
    .select('score, correct')
    .eq('user_id', userId)
    .eq('date', date)
    .maybeSingle()
  if (!data) return null
  return { score: data.score as number, correct: data.correct as number }
}

export async function getUserWeekScore(userId: string): Promise<number> {
  const { start, end } = getParisWeekBounds()
  const { data, error } = await supabase
    .from('daily_scores')
    .select('score')
    .eq('user_id', userId)
    .gte('date', start)
    .lte('date', end)

  if (error) return 0
  return (data ?? []).reduce((sum, row) => sum + (row.score as number), 0)
}
