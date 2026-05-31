import { useState, useEffect } from 'react'
import { anonSupabase } from '../lib/supabase'

const ALL_SECTORS = [
  { id: 'restaurang', label: 'Restaurang & Krog', emoji: '🍽️' },
  { id: 'handel', label: 'Handel & Detaljhandel', emoji: '🛒' },
  { id: 'bygg', label: 'Bygg & Anläggning', emoji: '🏗️' },
  { id: 'it', label: 'IT & Teknik', emoji: '💻' },
  { id: 'hr_lon', label: 'HR & Lön', emoji: '👔' },
  { id: 'sjukvard', label: 'Sjukvård & Omsorg', emoji: '🏥' },
  { id: 'transport', label: 'Transport & Logistik', emoji: '🚛' },
  { id: 'industri', label: 'Industri & Tillverkning', emoji: '🏭' },
  { id: 'utbildning', label: 'Utbildning & Skola', emoji: '📚' },
  { id: 'fastighet', label: 'Fastighet & Mäkleri', emoji: '🏠' },
  { id: 'juridik', label: 'Juridik & Finans', emoji: '⚖️' },
  { id: 'fordon', label: 'Fordon & Mekanik', emoji: '🔧' },
  { id: 'sakerhet', label: 'Säkerhet & Bevakning', emoji: '🔒' },
  { id: 'energi', label: 'Energi & Miljö', emoji: '⚡' },
  { id: 'skog', label: 'Skog & Lantbruk', emoji: '🌲' },
  { id: 'media', label: 'Media & Kommunikation', emoji: '📡' },
  { id: 'kultur', label: 'Kultur & Event', emoji: '🎭' },
  { id: 'offentlig', label: 'Offentlig Förvaltning', emoji: '🏛️' },
  { id: 'halsa', label: 'Friskvård & Skönhet', emoji: '💆' },
  { id: 'marknad', label: 'Marknad & Reklam', emoji: '📣' },
]

const TOTAL_POINTS = 5
const STORAGE_PREFIX = 'quizine_poll_v'
const SESSION_KEY = 'quizine_session_id'

function getOrCreateSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(SESSION_KEY, id)
  }
  return id
}

interface PollConfig {
  version: number
  removed_segments: string[]
}

const FALLBACK_CONFIG: PollConfig = { version: 1, removed_segments: [] }

export function VotePollCard() {
  const [config, setConfig] = useState<PollConfig>(FALLBACK_CONFIG)
  const [loading, setLoading] = useState(true)
  const [voted, setVoted] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [points, setPoints] = useState<Record<string, number>>({})
  const [totals, setTotals] = useState<Record<string, number>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    loadConfig()
  }, [])

  async function loadConfig() {
    try {
      const { data } = await anonSupabase
        .from('poll_config')
        .select('version, removed_segments')
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (data) {
        const cfg = data as PollConfig
        setConfig(cfg)
        const stored = localStorage.getItem(STORAGE_PREFIX + cfg.version)
        if (stored) {
          try { if (JSON.parse(stored).voted) setVoted(true) } catch {}
        }
      }
    } catch {
      // fall through — show card with fallback config
    } finally {
      setLoading(false)
    }
  }

  async function loadTotals(version: number) {
    const { data } = await anonSupabase
      .from('segment_votes')
      .select('segment_id, points')
      .eq('poll_version', version)
    if (!data) return
    const map: Record<string, number> = {}
    data.forEach(r => { map[r.segment_id] = (map[r.segment_id] ?? 0) + r.points })
    setTotals(map)
  }

  const handleOpenModal = () => {
    if (config && voted) loadTotals(config.version)
    setModalOpen(true)
  }

  const sectors = config
    ? ALL_SECTORS.filter(s => !config.removed_segments.includes(s.id))
    : ALL_SECTORS

  const spent = Object.values(points).reduce((a, b) => a + b, 0)
  const remaining = TOTAL_POINTS - spent

  const addPoint = (id: string) => {
    if (remaining <= 0) return
    setPoints(p => ({ ...p, [id]: (p[id] ?? 0) + 1 }))
  }

  const removePoint = (id: string) => {
    setPoints(p => {
      const cur = p[id] ?? 0
      if (cur <= 0) return p
      const next = { ...p }
      if (cur === 1) delete next[id]
      else next[id] = cur - 1
      return next
    })
  }

  const handleSubmit = async () => {
    if (!config || spent === 0) return
    setSubmitting(true)
    const sessionId = getOrCreateSessionId()
    const rows = Object.entries(points)
      .filter(([, v]) => v > 0)
      .map(([segment_id, pts]) => ({
        segment_id,
        points: pts,
        session_id: sessionId,
        poll_version: config.version,
      }))
    await anonSupabase.from('segment_votes').insert(rows)
    localStorage.setItem(STORAGE_PREFIX + config.version, JSON.stringify({ voted: true, sessionId }))
    setSubmitting(false)
    setSubmitted(true)
    setVoted(true)
    await loadTotals(config.version)
    setTimeout(() => setPoints({}), 300)
  }

  return (
    <>
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(29,111,232,0.07) 0%, rgba(201,146,42,0.07) 100%)',
          border: '1px solid rgba(29,111,232,0.2)',
          borderRadius: 20,
          padding: '18px 20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <img
            src={`${import.meta.env.BASE_URL}neon-question-mark.png`}
            alt="Nästa branch"
            style={{
              width: 44, height: 44, borderRadius: 12,
              objectFit: 'cover', flexShrink: 0,
              background: '#000',
            }}
          />
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--white)', lineHeight: 1.2 }}>
              Rösta på nästa branch
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3, lineHeight: 1.4 }}>
              {voted
                ? 'Du har röstat i den här omgången.'
                : 'Vilken yrkesgrupp ska vi bygga härnäst?'}
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenModal}
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            background: voted ? 'transparent' : 'rgba(29,111,232,0.12)',
            color: voted ? 'var(--text-muted)' : loading ? 'var(--text-muted)' : 'var(--blue-light)',
            border: `1px solid ${voted || loading ? 'var(--border)' : 'rgba(29,111,232,0.3)'}`,
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            cursor: loading ? 'default' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? '…' : voted ? '📊 Se aktuellt resultat' : '🗳️ Rösta nu — 5 poäng att fördela'}
        </button>
      </div>

      {modalOpen && (
        <VoteModal
          sectors={sectors}
          points={points}
          remaining={remaining}
          spent={spent}
          voted={voted}
          submitting={submitting}
          submitted={submitted}
          totals={totals}
          onAdd={addPoint}
          onRemove={removePoint}
          onSubmit={handleSubmit}
          onClose={() => { setModalOpen(false); setSubmitted(false) }}
        />
      )}
    </>
  )
}

function VoteModal({
  sectors,
  points,
  remaining,
  spent,
  voted,
  submitting,
  submitted,
  totals,
  onAdd,
  onRemove,
  onSubmit,
  onClose,
}: {
  sectors: typeof ALL_SECTORS
  points: Record<string, number>
  remaining: number
  spent: number
  voted: boolean
  submitting: boolean
  submitted: boolean
  totals: Record<string, number>
  onAdd: (id: string) => void
  onRemove: (id: string) => void
  onSubmit: () => void
  onClose: () => void
}) {
  const showResults = voted

  const maxVotes = showResults
    ? Math.max(...Object.values(totals), 1)
    : 1

  const sortedSectors = showResults
    ? [...sectors].sort((a, b) => (totals[b.id] ?? 0) - (totals[a.id] ?? 0))
    : sectors

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 100 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)' }}
        onClick={onClose}
      />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        display: 'flex', justifyContent: 'center',
      }}>
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '20px 20px 0 0',
          border: '1px solid var(--border)',
          width: '100%',
          maxWidth: 560,
          maxHeight: '88dvh',
          overflowY: 'auto',
          padding: '20px 20px 0',
          paddingBottom: 'max(28px, env(safe-area-inset-bottom))',
          position: 'relative',
          zIndex: 1,
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--white)' }}>
              {showResults ? '📊 Röstningsresultat' : '🗳️ Rösta på nästa branch'}
            </div>
            <button
              onClick={onClose}
              style={{ background: 'none', color: 'var(--text-muted)', fontSize: 20, lineHeight: 1, padding: 4, cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>

          {!showResults && (
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5 }}>
              Fördela dina 5 poäng fritt — du kan ge allt till ett alternativ eller sprida dem.
            </div>
          )}
          {showResults && (
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5 }}>
              Toppen! Ny omröstning öppnar när vi lanserar nästa branch.
            </div>
          )}

          {/* Points indicator (voting mode) */}
          {!showResults && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 14px',
              background: remaining === 0
                ? 'rgba(76,175,80,0.1)'
                : 'rgba(201,146,42,0.08)',
              border: `1px solid ${remaining === 0 ? 'rgba(76,175,80,0.3)' : 'rgba(201,146,42,0.2)'}`,
              borderRadius: 10, marginBottom: 16,
            }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {Array.from({ length: TOTAL_POINTS }).map((_, i) => (
                  <div key={i} style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: i < spent
                      ? (remaining === 0 ? 'var(--success)' : 'var(--gold)')
                      : 'var(--border)',
                    transition: 'background 0.15s',
                  }} />
                ))}
              </div>
              <div style={{ fontSize: 12, color: remaining === 0 ? 'var(--success)' : 'var(--gold-light)', fontWeight: 700 }}>
                {remaining === 0 ? 'Alla poäng fördelade!' : `${remaining} poäng kvar`}
              </div>
            </div>
          )}

          {/* Sector list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
            {sortedSectors.map(s => {
              const allocated = points[s.id] ?? 0
              const voteCount = totals[s.id] ?? 0
              const pct = showResults ? Math.round((voteCount / maxVotes) * 100) : 0

              return (
                <div key={s.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px',
                  background: allocated > 0 ? 'rgba(201,146,42,0.08)' : 'var(--bg-card-2)',
                  border: `1px solid ${allocated > 0 ? 'rgba(201,146,42,0.25)' : 'var(--border)'}`,
                  borderRadius: 12,
                  transition: 'all 0.15s',
                }}>
                  <div style={{ fontSize: 20, flexShrink: 0 }}>{s.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--white)', lineHeight: 1.2 }}>
                      {s.label}
                    </div>
                    {showResults && (
                      <div style={{ marginTop: 5 }}>
                        <div style={{
                          height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden',
                        }}>
                          <div style={{
                            height: '100%', width: `${pct}%`,
                            background: 'var(--blue-light)',
                            borderRadius: 2,
                            transition: 'width 0.4s ease',
                          }} />
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                          {voteCount} {voteCount === 1 ? 'poäng' : 'poäng'}
                        </div>
                      </div>
                    )}
                  </div>
                  {!showResults && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <button
                        onClick={() => onRemove(s.id)}
                        disabled={allocated === 0}
                        style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: allocated > 0 ? 'rgba(201,146,42,0.15)' : 'transparent',
                          border: `1px solid ${allocated > 0 ? 'rgba(201,146,42,0.3)' : 'var(--border)'}`,
                          color: allocated > 0 ? 'var(--gold-light)' : 'var(--text-muted)',
                          fontSize: 16, fontWeight: 700, cursor: allocated > 0 ? 'pointer' : 'default',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        −
                      </button>
                      <div style={{
                        width: 20, textAlign: 'center',
                        fontSize: 14, fontWeight: 800,
                        color: allocated > 0 ? 'var(--gold-light)' : 'var(--text-muted)',
                      }}>
                        {allocated}
                      </div>
                      <button
                        onClick={() => onAdd(s.id)}
                        disabled={remaining === 0}
                        style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: remaining > 0 ? 'rgba(29,111,232,0.15)' : 'transparent',
                          border: `1px solid ${remaining > 0 ? 'rgba(29,111,232,0.3)' : 'var(--border)'}`,
                          color: remaining > 0 ? 'var(--blue-light)' : 'var(--text-muted)',
                          fontSize: 16, fontWeight: 700, cursor: remaining > 0 ? 'pointer' : 'default',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Submit button (voting mode) */}
          {!showResults && (
            <div style={{ position: 'sticky', bottom: 0, background: 'var(--bg-card)', paddingBottom: 'max(20px, env(safe-area-inset-bottom))', paddingTop: 8 }}>
              {submitted ? (
                <div style={{ textAlign: 'center', padding: '14px', fontSize: 15, color: 'var(--success)', fontWeight: 700 }}>
                  ✓ Tack för din röst!
                </div>
              ) : (
                <button
                  onClick={onSubmit}
                  disabled={spent === 0 || submitting}
                  style={{
                    width: '100%', padding: '14px',
                    background: spent > 0
                      ? 'linear-gradient(135deg, var(--gold) 0%, var(--rust) 100%)'
                      : 'var(--bg-card-2)',
                    color: spent > 0 ? 'var(--cream)' : 'var(--text-muted)',
                    border: 'none', borderRadius: 14,
                    fontSize: 15, fontWeight: 800, cursor: spent > 0 ? 'pointer' : 'default',
                    transition: 'all 0.15s',
                  }}
                >
                  {submitting ? '…' : 'Skicka in röst'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
