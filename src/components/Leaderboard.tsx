import { useEffect, useRef, useState } from 'react'
import { getWeeklyLeaderboard, LeaderboardEntry } from '../lib/dailyScores'
import { getParisDate } from '../lib/dailyUtils'
import { HallOfFameModal } from './HallOfFameModal'

function lastPlayedLabel(lastPlayedDate: string): string {
  const today = getParisDate()
  if (!lastPlayedDate) return ''
  if (lastPlayedDate === today) return 'idag'
  const todayMs = new Date(today).getTime()
  const playedMs = new Date(lastPlayedDate).getTime()
  const days = Math.round((todayMs - playedMs) / 86400000)
  if (days === 1) return 'igår'
  return `${days} dagar sedan`
}

interface Props {
  highlightUsername?: string | null
  refreshTrigger?: number
}

const MEDALS = ['🥇', '🥈', '🥉']

const COLLAPSED_COUNT = 3

function EntryRow({ entry, highlightUsername }: { entry: LeaderboardEntry; highlightUsername?: string | null }) {
  const isMe = entry.username === highlightUsername
  const medal = MEDALS[entry.rank - 1]
  return (
    <div
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
          {lastPlayedLabel(entry.last_played_date)}
        </div>
      </div>
    </div>
  )
}

export function Leaderboard({ highlightUsername, refreshTrigger = 0 }: Props) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showHallOfFame, setShowHallOfFame] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const hasFetchedOnce = useRef(false)

  useEffect(() => {
    let cancelled = false
    const isInitial = !hasFetchedOnce.current
    if (isInitial) setLoading(true)

    getWeeklyLeaderboard()
      .then(data => {
        if (!cancelled) {
          setEntries(data)
          if (isInitial) setLoading(false)
          hasFetchedOnce.current = true
        }
      })
      .catch(() => {
        if (!cancelled) {
          setEntries([])
          if (isInitial) setLoading(false)
          hasFetchedOnce.current = true
        }
      })

    return () => { cancelled = true }
  }, [refreshTrigger])

  const top3 = entries.slice(0, COLLAPSED_COUNT)
  const rest = entries.slice(COLLAPSED_COUNT)
  const myEntry = highlightUsername ? rest.find(e => e.username === highlightUsername) : undefined

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
          {top3.map(entry => (
            <EntryRow key={entry.username} entry={entry} highlightUsername={highlightUsername} />
          ))}

          {expanded && rest.map(entry => (
            <EntryRow key={entry.username} entry={entry} highlightUsername={highlightUsername} />
          ))}

          {/* Show the user's own row when collapsed and they're outside top 3 */}
          {!expanded && myEntry && (
            <>
              <div style={{ padding: '6px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ flex: 1, borderTop: '1px dashed var(--border)', opacity: 0.6 }} />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>din placering</span>
                <div style={{ flex: 1, borderTop: '1px dashed var(--border)', opacity: 0.6 }} />
              </div>
              <EntryRow entry={myEntry} highlightUsername={highlightUsername} />
            </>
          )}

          {rest.length > 0 && (
            <button
              onClick={() => setExpanded(e => !e)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                width: '100%',
                padding: '11px 16px',
                background: 'transparent',
                color: 'var(--text-muted)',
                border: 'none',
                borderTop: '1px solid var(--border)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--white)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              {expanded ? '↑ Visa färre' : `↓ Visa fler (${rest.length} till)`}
            </button>
          )}
        </div>
      )}

      {/* Hall of Fame button */}
      <button
        onClick={() => setShowHallOfFame(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          width: '100%',
          padding: '13px 16px',
          background: 'transparent',
          color: 'var(--text-muted)',
          border: 'none',
          borderTop: '1px solid var(--border)',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'color 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--white)' }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}
      >
        <span style={{ fontSize: 16 }}>🏛️</span>
        Hall of Fame — vinnare &amp; årets topplista
      </button>

      {showHallOfFame && (
        <HallOfFameModal
          highlightUsername={highlightUsername}
          onClose={() => setShowHallOfFame(false)}
        />
      )}
    </div>
  )
}
