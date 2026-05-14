const KEY = 'auth_rate_limit'
const MAX_ATTEMPTS = 5
const LOCKOUT_SCHEDULE = [30, 60, 120, 300, 900, 3600] // seconds, escalates per lockout

interface RateLimitState {
  failures: number
  lockouts: number
  lockedUntil: number
}

function read(): RateLimitState {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : { failures: 0, lockouts: 0, lockedUntil: 0 }
  } catch {
    return { failures: 0, lockouts: 0, lockedUntil: 0 }
  }
}

function write(s: RateLimitState) {
  try { localStorage.setItem(KEY, JSON.stringify(s)) } catch {}
}

export function getLockedSeconds(): number {
  const s = read()
  if (s.lockedUntil > Date.now()) return Math.ceil((s.lockedUntil - Date.now()) / 1000)
  return 0
}

export function recordAuthFailure() {
  const s = read()
  s.failures = (s.failures || 0) + 1
  if (s.failures >= MAX_ATTEMPTS) {
    const idx = Math.min(s.lockouts || 0, LOCKOUT_SCHEDULE.length - 1)
    s.lockedUntil = Date.now() + LOCKOUT_SCHEDULE[idx] * 1000
    s.lockouts = (s.lockouts || 0) + 1
    s.failures = 0
  }
  write(s)
}

export function clearAuthRateLimit() {
  try { localStorage.removeItem(KEY) } catch {}
}
