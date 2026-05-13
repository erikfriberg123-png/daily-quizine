import { useEffect, useState } from 'react'
import { getWeeklyLeaderboard, LeaderboardEntry } from '../lib/dailyScores'

interface Props {
  highlightUsername?: string | null
}

const MEDALS = ['🥇', '🥈', '🥉']

export function Leaderboard({ highlightUsername }: Props) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getWeeklyLeaderboard()
      .then(setEntries)
      .catch(() => setEntries([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 18,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span style={{ fontSize: 18 }}>🏆</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--white)' }}>
            Veckans topplista
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            Återställs varje måndag
          </div>
        </div>
      </div>

      {loading && (
        <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
          Laddar...
        </div>
      )}

      {!loading && entries.length === 0 && (
        <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
          Ingen har spelat den här veckan än. Var först!
        </div>
      )}

      {!loading && entries.length > 0 && (
        <div>
          {entries.slice(0, 20).map((entry) => {
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
                  transition: 'background 0.2s',
                }}
              >
                <span
                  style={{
                    width: 28,
                    fontSize: medal ? 18 : 13,
                    fontWeight: medal ? 400 : 700,
                    color: medal ? undefined : 'var(--text-dim)',
                    flexShrink: 0,
                  }}
                >
                  {medal ?? `${entry.rank}.`}
                </span>

                <span
                  style={{
                    flex: 1,
                    fontSize: 14,
                    fontWeight: isMe ? 700 : 500,
                    color: isMe ? 'var(--blue-light)' : 'var(--white)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {entry.username}
                  {isMe && (
                    <span
                      style={{
                        marginLeft: 6,
                        fontSize: 10,
                        fontWeight: 700,
                        color: 'var(--blue)',
                        background: 'rgba(29,111,232,0.15)',
                        padding: '2px 6px',
                        borderRadius: 4,
                        letterSpacing: 0.5,
                      }}
                    >
                      DU
                    </span>
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
        </div>
      )}
    </div>
  )
}
