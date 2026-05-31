import { getSegmentConfig } from '../config/segments'

const { localStoragePrefix } = getSegmentConfig()
const PLAYED_PREFIX = `${localStoragePrefix}played_`
const SESSION_PREFIX = `${localStoragePrefix}session_`
const SELECTION_PREFIX = `${localStoragePrefix}sel_`

export interface QuizSession {
  qIndex: number
  score: number
  correct: number
}

export function getActiveSession(): QuizSession | null {
  const raw = localStorage.getItem(SESSION_PREFIX + getParisDate())
  if (!raw) return null
  try { return JSON.parse(raw) as QuizSession } catch { return null }
}

export function saveActiveSession(data: QuizSession): void {
  localStorage.setItem(SESSION_PREFIX + getParisDate(), JSON.stringify(data))
}

export function clearActiveSession(): void {
  localStorage.removeItem(SESSION_PREFIX + getParisDate())
}

export function getParisDate(): string {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

export function isWeekend(): boolean {
  const parisMs = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'Europe/Paris' })
  ).getDay()
  return parisMs === 0 || parisMs === 6
}

export function getNextPlayDayLabel(): string {
  const day = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'Europe/Paris' })
  ).getDay()
  return day === 5 ? 'på måndag' : 'imorgon'  // 5 = Friday
}

export function getNextMondayLabel(): string {
  const now = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'Europe/Paris' })
  )
  const day = now.getDay() // 0=Sun, 6=Sat
  const daysUntilMonday = day === 0 ? 1 : 8 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + daysUntilMonday)
  return monday.toLocaleDateString('sv-SE', {
    timeZone: 'Europe/Paris',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

// Linear congruential generator — deterministic per seed
function seededRandom(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 0x100000000
  }
}

function dateSeed(str: string): number {
  return str.split('').reduce((a, c) => Math.imul(a, 31) + c.charCodeAt(0), 0)
}

// How many weekdays (Mon–Fri) have passed before `day` in that month (0-based index)
function weekdayIndexInMonth(dateStr: string): number {
  const [year, month, day] = dateStr.split('-').map(Number)
  let count = 0
  for (let d = 1; d < day; d++) {
    const dow = new Date(year, month - 1, d).getDay()
    if (dow !== 0 && dow !== 6) count++
  }
  return count
}

// Questions are shuffled once per month (seeded by YYYY-MM) then sliced in
// non-overlapping windows of `count` — no question repeats within the same month.
export function pickDailyQuestions<T>(items: T[], dateStr: string, count: number): T[] {
  if (items.length <= count) return [...items]
  const yearMonth = dateStr.slice(0, 7)           // "2026-05"
  const rand = seededRandom(dateSeed(yearMonth))
  const shuffled = [...items]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  const start = (weekdayIndexInMonth(dateStr) * count) % shuffled.length
  return Array.from({ length: count }, (_, i) => shuffled[(start + i) % shuffled.length])
}

export interface PlayedData {
  score: number
  correct: number
  total: number
}

export function getTodayPlayedData(): PlayedData | null {
  const raw = localStorage.getItem(PLAYED_PREFIX + getParisDate())
  if (!raw) return null
  try { return JSON.parse(raw) as PlayedData } catch { return null }
}

export function saveTodayPlayedData(data: PlayedData): void {
  localStorage.setItem(PLAYED_PREFIX + getParisDate(), JSON.stringify(data))
}

export function getWeekStartForDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  const dow = d.getDay()
  const diffToMonday = dow === 0 ? -6 : 1 - dow
  d.setDate(d.getDate() + diffToMonday)
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

export function getWeekEndForStart(weekStart: string): string {
  const [year, month, day] = weekStart.split('-').map(Number)
  const d = new Date(year, month - 1, day + 6)
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

export function getParisWeekBounds(): { start: string; end: string } {
  const now = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'Europe/Paris' })
  )
  const day = now.getDay()
  const diffToMonday = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + diffToMonday)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const fmt = (d: Date) =>
    new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Europe/Paris',
      year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(d)

  return { start: fmt(monday), end: fmt(sunday) }
}

export function getCachedDailySelection(dateStr: string): string[] | null {
  try {
    const raw = localStorage.getItem(SELECTION_PREFIX + dateStr)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) return null
    return parsed as string[]
  } catch {
    return null
  }
}

export function cacheDailySelection(dateStr: string, ids: string[]): void {
  try {
    localStorage.setItem(SELECTION_PREFIX + dateStr, JSON.stringify(ids))
  } catch { /* storage unavailable */ }
}
