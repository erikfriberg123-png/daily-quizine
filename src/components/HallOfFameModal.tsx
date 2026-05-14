import { useEffect, useState } from 'react'
import { getHallOfFameData, HallOfFameData, LeaderboardEntry, WeeklyWinner } from '../lib/dailyScores'

interface Props {
  highlightUsername?: string | null
  onClose: () => void
}

const MEDALS = ['🥇', '🥈', '🥉']

function formatWeekLabel(start: string, end: string): string {
  const s = new Date(start + 'T12:00:00')
  const e = new Date(end + 'T12:00:00')
  const fmtDay = (d: Date) => d.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })
  return `${fmtDay(s)} – ${fmtDay(e)}`
}

export function HallOfFameModal({ highlightUsername, onClose }: Props) {
  const [tab, setTab] = useState<'weekly' | 'yearly'>('weekly')
  const [data, setData] = useState<HallOfFameData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getHallOfFameData()
      .then(setData)
      .catch(() => setData({ weeklyWinners: [], yearlyTop: [] }))
      .finally(() => setLoading(false))
  }, [])

  const year = new Date().getFullYear()

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        zIndex: 1000,
        padding: '0 0 0 0',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg)',
          border: '1px solid var(--border-light)',
          borderRadius: '24px 24px 0 0',
          width: '100%',
          maxWidth: 560,
          maxHeight: '85dvh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px 20px 0',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 22 }}>🏛️</span>
              <span style={{ fontSize: 17, fontWeight: 800, color: 'var(--white)' }}>Hall of Fame</span>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                color: 'var(--text-muted)',
                fontSize: 18,
                width: 36, height: 36,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-card)',
            borderRadius: 12,
            padding: 4,
            gap: 4,
            marginBottom: 4,
          }}>
            {([['weekly', '🏆 Veckans vinnare'], ['yearly', `⭐ Årets topplista ${year}`]] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                style={{
                  flex: 1,
                  padding: '9px 8px',
                  borderRadius: 9,
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: tab === key ? 'var(--orange)' : 'transparent',
                  color: tab === key ? '#fff' : 'var(--text-muted)',
                  transition: 'all 0.15s',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0 32px' }}>
          {loading && (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
              Laddar...
            </div>
          )}

          {!loading && tab === 'weekly' && (
            <>
              {(data?.weeklyWinners.length ?? 0) === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                  Inga tidigare vinnare än.
                </div>
              ) : data?.weeklyWinners.map((w: WeeklyWinner, i: number) => (
                <div
                  key={w.week_start}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '13px 20px',
                    borderBottom: '1px solid var(--border)',
                    background: i === 0 ? 'rgba(255,215,0,0.05)' : 'transparent',
                  }}
                >
                  <span style={{ width: 32, fontSize: i === 0 ? 22 : 16, flexShrink: 0 }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: w.username === highlightUsername ? 'var(--blue-light)' : 'var(--white)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {w.username}
                      {w.username === highlightUsername && (
                        <span style={{
                          marginLeft: 6, fontSize: 10, fontWeight: 700,
                          color: 'var(--blue)', background: 'rgba(29,111,232,0.15)',
                          padding: '2px 6px', borderRadius: 4,
                        }}>DU</span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {formatWeekLabel(w.week_start, w.week_end)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--orange)' }}>
                      {w.total_score.toLocaleString('sv-SE')}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>XP</div>
                  </div>
                </div>
              ))}
            </>
          )}

          {!loading && tab === 'yearly' && (
            <>
              <div style={{ padding: '4px 20px 12px', fontSize: 12, color: 'var(--text-muted)' }}>
                Summerad poäng sedan 1 jan {year} · Återställs 1 jan {year + 1}
              </div>
              {(data?.yearlyTop.length ?? 0) === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                  Ingen data än.
                </div>
              ) : data?.yearlyTop.map((entry: LeaderboardEntry) => {
                const isMe = entry.username === highlightUsername
                const medal = MEDALS[entry.rank - 1]
                return (
                  <div
                    key={entry.username}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 20px',
                      borderBottom: '1px solid var(--border)',
                      background: isMe ? 'rgba(29,111,232,0.1)' : 'transparent',
                      borderLeft: isMe ? '3px solid var(--blue)' : '3px solid transparent',
                    }}
                  >
                    <span style={{ width: 32, fontSize: medal ? 18 : 13, fontWeight: medal ? 400 : 700, color: medal ? undefined : 'var(--text-dim)', flexShrink: 0 }}>
                      {medal ?? `${entry.rank}.`}
                    </span>
                    <span style={{
                      flex: 1,
                      fontSize: 14,
                      fontWeight: isMe ? 700 : 500,
                      color: isMe ? 'var(--blue-light)' : 'var(--white)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {entry.username}
                      {isMe && (
                        <span style={{
                          marginLeft: 6, fontSize: 10, fontWeight: 700,
                          color: 'var(--blue)', background: 'rgba(29,111,232,0.15)',
                          padding: '2px 6px', borderRadius: 4,
                        }}>DU</span>
                      )}
                    </span>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--orange)' }}>
                        {entry.total_score.toLocaleString('sv-SE')}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>
                        {entry.days_played} dag{entry.days_played !== 1 ? 'ar' : ''}
                      </div>
                    </div>
                  </div>
                )
              })}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
