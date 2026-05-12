const PLAYED_PREFIX = 'dq_played_'

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

// Linear congruential generator — deterministic per date seed
function seededRandom(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 0x100000000
  }
}

function dateSeed(dateStr: string): number {
  return dateStr.split('').reduce((a, c) => Math.imul(a, 31) + c.charCodeAt(0), 0)
}

export function pickDailyQuestions<T>(items: T[], dateStr: string, count: number): T[] {
  if (items.length <= count) return [...items]
  const rand = seededRandom(dateSeed(dateStr))
  const shuffled = [...items].sort(() => rand() - 0.5)
  return shuffled.slice(0, count)
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
