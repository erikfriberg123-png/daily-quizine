import { supabase } from './supabase'
import { getParisWeekBounds, getWeekStartForDate, getWeekEndForStart } from './dailyUtils'

const DAILY_QUESTIONS = 3
const POINTS_PER_CORRECT = 150
const ALL_CORRECT_BONUS = 50

function isValidScore(score: number, correct: number): boolean {
  if (!Number.isInteger(score) || !Number.isInteger(correct)) return false
  if (correct < 0 || correct > DAILY_QUESTIONS) return false
  if (score < 0) return false
  return score === correct * POINTS_PER_CORRECT + (correct === DAILY_QUESTIONS ? ALL_CORRECT_BONUS : 0)
}

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
  if (!isValidScore(params.score, params.correct)) {
    throw new Error('Ogiltig poäng.')
  }

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

export interface WeeklyWinner {
  week_start: string
  week_end: string
  username: string
  total_score: number
}

export interface HallOfFameData {
  weeklyWinners: WeeklyWinner[]
  yearlyTop: LeaderboardEntry[]
}

export async function getHallOfFameData(): Promise<HallOfFameData> {
  const year = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Paris' })).getFullYear()
  const yearStart = `${year}-01-01`
  const { start: currentWeekStart } = getParisWeekBounds()

  const { data, error } = await supabase
    .from('daily_scores')
    .select('username, score, date')
    .gte('date', yearStart)
    .not('user_id', 'is', null)
    .order('date', { ascending: true })

  if (error) throw error
  const rows = (data ?? []) as { username: string; score: number; date: string }[]

  // Yearly top — aggregate all rows in the year by username
  const yearMap = new Map<string, { total: number; days: number }>()
  for (const row of rows) {
    const prev = yearMap.get(row.username) ?? { total: 0, days: 0 }
    yearMap.set(row.username, { total: prev.total + row.score, days: prev.days + 1 })
  }
  const yearlyTop: LeaderboardEntry[] = Array.from(yearMap.entries())
    .map(([username, { total, days }]) => ({ username, total_score: total, days_played: days, rank: 0 }))
    .sort((a, b) => b.total_score - a.total_score)
    .slice(0, 20)
    .map((e, i) => ({ ...e, rank: i + 1 }))

  // Weekly winners — only past weeks (exclude current week)
  const pastRows = rows.filter(r => r.date < currentWeekStart)
  const weekMap = new Map<string, Map<string, number>>()
  for (const row of pastRows) {
    const weekKey = getWeekStartForDate(row.date)
    if (!weekMap.has(weekKey)) weekMap.set(weekKey, new Map())
    const userMap = weekMap.get(weekKey)!
    userMap.set(row.username, (userMap.get(row.username) ?? 0) + row.score)
  }

  const weeklyWinners: WeeklyWinner[] = Array.from(weekMap.entries())
    .map(([weekStart, userMap]) => {
      let topUser = ''
      let topScore = 0
      userMap.forEach((score, username) => {
        if (score > topScore) { topScore = score; topUser = username }
      })
      return { week_start: weekStart, week_end: getWeekEndForStart(weekStart), username: topUser, total_score: topScore }
    })
    .sort((a, b) => b.week_start.localeCompare(a.week_start))
    .slice(0, 20)

  return { weeklyWinners, yearlyTop }
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
