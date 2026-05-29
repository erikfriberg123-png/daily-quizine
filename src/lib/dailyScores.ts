import { supabase, anonSupabase } from './supabase'
import { getParisWeekBounds, getWeekStartForDate, getWeekEndForStart } from './dailyUtils'
import { SEGMENT } from '../config/segments'

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
  last_played_date: string
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
  // Write requires the user's auth token — keep using supabase-js.
  const { error } = await supabase.from('daily_scores').upsert(
    {
      user_id: params.userId,
      username: params.username,
      date: params.date,
      score: params.score,
      correct: params.correct,
      segment: SEGMENT,
    },
    { onConflict: 'user_id,date,segment' }
  )
  if (error) throw error
}

export async function getWeeklyLeaderboard(): Promise<LeaderboardEntry[]> {
  const { start, end } = getParisWeekBounds()

  const { data, error } = await anonSupabase
    .from('daily_scores')
    .select('username, score, date')
    .eq('segment', SEGMENT)
    .gte('date', start)
    .lte('date', end)
    .not('user_id', 'is', null)
    .order('score', { ascending: false })

  const rows = (error ? [] : data) as { username: string; score: number; date: string }[]

  const map = new Map<string, { total: number; days: number; lastPlayed: string }>()
  for (const row of rows) {
    const prev = map.get(row.username) ?? { total: 0, days: 0, lastPlayed: '' }
    map.set(row.username, {
      total: prev.total + row.score,
      days: prev.days + 1,
      lastPlayed: row.date > prev.lastPlayed ? row.date : prev.lastPlayed,
    })
  }

  return Array.from(map.entries())
    .map(([username, { total, days, lastPlayed }]) => ({
      username,
      total_score: total,
      days_played: days,
      last_played_date: lastPlayed,
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
    .eq('segment', SEGMENT)
    .maybeSingle()
  if (!data) return null
  return { score: data.score, correct: data.correct }
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

  const { data, error } = await anonSupabase
    .from('daily_scores')
    .select('username, score, date')
    .eq('segment', SEGMENT)
    .gte('date', yearStart)
    .not('user_id', 'is', null)
    .order('date', { ascending: true })

  const rows = (error ? [] : data) as { username: string; score: number; date: string }[]

  const yearMap = new Map<string, { total: number; days: number }>()
  for (const row of rows) {
    const prev = yearMap.get(row.username) ?? { total: 0, days: 0 }
    yearMap.set(row.username, { total: prev.total + row.score, days: prev.days + 1 })
  }
  const yearlyTop: LeaderboardEntry[] = Array.from(yearMap.entries())
    .map(([username, { total, days }]) => ({ username, total_score: total, days_played: days, last_played_date: '', rank: 0 }))
    .sort((a, b) => b.total_score - a.total_score)
    .slice(0, 20)
    .map((e, i) => ({ ...e, rank: i + 1 }))

  const pastRows = rows.filter(r => r.date < currentWeekStart)
  const weekMap = new Map<string, Map<string, number>>()
  for (const row of pastRows) {
    const weekKey = getWeekStartForDate(row.date)
    if (!weekMap.has(weekKey)) weekMap.set(weekKey, new Map())
    weekMap.get(weekKey)!.set(row.username, (weekMap.get(weekKey)!.get(row.username) ?? 0) + row.score)
  }

  const weeklyWinners: WeeklyWinner[] = Array.from(weekMap.entries())
    .map(([weekStart, userMap]) => {
      let topUser = ''
      let topScore = 0
      userMap.forEach((score, username) => { if (score > topScore) { topScore = score; topUser = username } })
      return { week_start: weekStart, week_end: getWeekEndForStart(weekStart), username: topUser, total_score: topScore }
    })
    .sort((a, b) => b.week_start.localeCompare(a.week_start))
    .slice(0, 20)

  return { weeklyWinners, yearlyTop }
}

export async function getUserWeekScore(userId: string): Promise<number> {
  const { start, end } = getParisWeekBounds()
  const { data } = await supabase
    .from('daily_scores')
    .select('score')
    .eq('user_id', userId)
    .eq('segment', SEGMENT)
    .gte('date', start)
    .lte('date', end)
  return (data ?? []).reduce((sum: number, row: { score: number }) => sum + row.score, 0)
}
