import { useState, useEffect, useRef } from 'react'
import { User } from '@supabase/supabase-js'
import { submitDailyScore } from '../lib/dailyScores'
import { Leaderboard } from '../components/Leaderboard'
import { getSegmentConfig } from '../config/segments'
import { LoginModal } from '../components/LoginModal'
import { CreateQuestionModal } from '../components/CreateQuestionModal'
import { FeedbackModal } from '../components/FeedbackModal'
import { StoryModal } from '../components/StoryModal'
import { UserMenu } from '../components/UserMenu'
import { BellMenu } from '../components/BellMenu'

interface Props {
  result: { score: number; correct: number; total: number; dateStr: string }
  user: User | null
  username: string | null
  onPlayAgain: () => void
  onAuthChange: (user: User | null) => void
  onUsernameChange: (name: string) => void
}

function scoreEmoji(correct: number, total: number) {
  const pct = correct / total
  if (pct === 1) return '🔥'
  if (pct >= 0.8) return '⭐'
  if (pct >= 0.6) return '👍'
  if (pct >= 0.4) return '🎯'
  return '💪'
}

function scoreMessage(correct: number, total: number) {
  const pct = correct / total
  if (pct === 1) return 'Perfekt! Alla rätt!'
  if (pct >= 0.8) return 'Imponerande! Nästan perfekt!'
  if (pct >= 0.6) return 'Bra jobbat!'
  if (pct >= 0.4) return 'Inte illa — öva mer imorgon!'
  return 'Kom tillbaka imorgon och försök igen!'
}

const handleCreateBtnMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.currentTarget.style.background = 'rgba(255,107,43,0.08)'
}
const handleCreateBtnMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.currentTarget.style.background = 'transparent'
}

export default function ResultsPage({ result, user, username, onPlayAgain, onAuthChange, onUsernameChange }: Props) {
  const [loginVisible, setLoginVisible] = useState(false)
  const [createVisible, setCreateVisible] = useState(false)
  const [feedbackVisible, setFeedbackVisible] = useState(false)
  const [storyVisible, setStoryVisible] = useState(false)
  const [loginThenCreate, setLoginThenCreate] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const submittingRef = useRef(false)

  const seg = getSegmentConfig()
  const pct = Math.round((result.correct / result.total) * 100)
  const emoji = scoreEmoji(result.correct, result.total)
  const message = scoreMessage(result.correct, result.total)

  // Auto-submit when user is already logged in.
  // Guard via ref instead of state to prevent an infinite retry loop: if the
  // submission fails silently, having `submitting` in the dep array would
  // re-trigger the effect each time it toggles false→true→false, causing the
  // "Sparar poäng…" row to flash and the page content to shake.
  useEffect(() => {
    if (user && username && !submitted && !submittingRef.current) {
      submittingRef.current = true
      setSubmitting(true)
      submitDailyScore({
        userId: user.id,
        username,
        date: result.dateStr,
        score: result.score,
        correct: result.correct,
      })
        .then(() => setSubmitted(true))
        .catch(() => {})
        .finally(() => {
          setSubmitting(false)
          submittingRef.current = false
        })
    }
  }, [user, username, submitted, result])

  const handlePostLoginSubmit = async (u: User, uname: string) => {
    setSubmitting(true)
    setSubmitError('')
    try {
      await submitDailyScore({
        userId: u.id,
        username: uname,
        date: result.dateStr,
        score: result.score,
        correct: result.correct,
      })
      setSubmitted(true)
    } catch {
      setSubmitError('Kunde inte spara poängen. Försök igen.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, var(--blue) 0%, var(--blue-dark) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              fontWeight: 900,
              color: '#fff',
            }}
          >
            Q
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--white)' }}>Quizine Daily</div>
        </div>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BellMenu user={user} />
            <UserMenu user={user} username={username} onUsernameChange={onUsernameChange} />
          </div>
        )}
      </header>

      <main
        style={{
          flex: 1,
          maxWidth: 560,
          width: '100%',
          margin: '0 auto',
          padding: '28px 16px 48px',
        }}
      >
        {/* Score card */}
        <div
          className="pop-in"
          style={{
            background: 'linear-gradient(135deg, #0A2A5C 0%, var(--bg-card) 100%)',
            border: '1px solid var(--border-light)',
            borderRadius: 24,
            padding: 28,
            textAlign: 'center',
            marginBottom: 20,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              bottom: -30,
              right: -30,
              width: 140,
              height: 140,
              borderRadius: '50%',
              background: 'radial-gradient(circle, var(--orange-glow) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />
          <div style={{ fontSize: 52, marginBottom: 10 }}>{emoji}</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--white)', marginBottom: 6 }}>
            {message}
          </div>
          <div
            style={{
              fontSize: 56,
              fontWeight: 900,
              color: 'var(--orange)',
              lineHeight: 1,
              marginBottom: 4,
            }}
          >
            {result.score.toLocaleString('sv-SE')}
          </div>
          <div style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 20 }}>XP</div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <div
              style={{
                background: 'var(--success-bg)',
                border: '1px solid var(--success)',
                borderRadius: 12,
                padding: '10px 20px',
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--success)' }}>
                {result.correct}/{result.total}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Rätt svar</div>
            </div>
            <div
              style={{
                background: 'rgba(29,111,232,0.08)',
                border: '1px solid rgba(29,111,232,0.25)',
                borderRadius: 12,
                padding: '10px 20px',
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--blue-light)' }}>{pct}%</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Rätt</div>
            </div>
          </div>
        </div>

        {/* Leaderboard CTA for anon users */}
        {!user && !submitted && (
          <div
            className="fade-in"
            style={{
              background: 'rgba(255,107,43,0.08)',
              border: '1.5px solid rgba(255,107,43,0.3)',
              borderRadius: 18,
              padding: 20,
              marginBottom: 20,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 20, marginBottom: 8 }}>🏆</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--white)', marginBottom: 6 }}>
              Spara poängen på topplistan!
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
              Logga in eller skapa ett konto för att synas på veckans topplista.
            </div>
            <button
              onClick={() => setLoginVisible(true)}
              style={{
                padding: '12px 28px',
                background: 'var(--orange)',
                color: '#fff',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
              }}
            >
              Logga in och spara poäng
            </button>
          </div>
        )}

        {submitted && (
          <div
            className="fade-in"
            style={{
              background: 'var(--success-bg)',
              border: '1px solid var(--success)',
              borderRadius: 14,
              padding: '12px 16px',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span style={{ fontSize: 18 }}>✓</span>
            <span style={{ fontSize: 14, color: 'var(--success)', fontWeight: 600 }}>
              Din poäng är sparad på topplistan!
            </span>
          </div>
        )}

        {submitError && (
          <div
            style={{
              background: 'var(--error-bg)',
              border: '1px solid var(--error)',
              borderRadius: 14,
              padding: '12px 16px',
              marginBottom: 20,
              fontSize: 13,
              color: 'var(--error)',
            }}
          >
            {submitError}
          </div>
        )}

        {submitting && (
          <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
            Sparar poäng...
          </div>
        )}

        {/* Feedback label */}
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          Feedback?
        </div>

        {/* Play more CTA */}
        <style>{`
          @keyframes cta-attract {
            0%   { transform: scale(1.04); box-shadow: 0 0 0 6px rgba(29,111,232,0.45), 0 8px 32px rgba(29,111,232,0.55); }
            60%  { transform: scale(1.01); box-shadow: 0 0 0 0px rgba(29,111,232,0), 0 6px 24px rgba(29,111,232,0.35); }
            100% { transform: scale(1);    box-shadow: 0 4px 20px var(--blue-glow); }
          }
          .cta-attract { animation: cta-attract 2s cubic-bezier(0.22,1,0.36,1) forwards; }
        `}</style>
        <a
          href={seg.ctaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="cta-attract"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '16px',
            background: 'linear-gradient(135deg, var(--blue) 0%, var(--blue-dark) 100%)',
            color: '#fff',
            borderRadius: 14,
            fontSize: 16,
            fontWeight: 700,
            textAlign: 'center',
            boxShadow: '0 4px 20px var(--blue-glow)',
            marginBottom: 20,
            textDecoration: 'none',
          }}
        >
          {seg.ctaLabel}
        </a>

        {/* Leaderboard */}
        <Leaderboard highlightUsername={username} key={String(submitted)} />

        {/* Actions */}
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={() => setCreateVisible(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '14px',
              background: 'transparent',
              color: 'var(--orange)',
              border: '1.5px solid rgba(255,107,43,0.4)',
              borderRadius: 14,
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={handleCreateBtnMouseEnter}
            onMouseLeave={handleCreateBtnMouseLeave}
          >
            ✏️  Skicka in en egen fråga
          </button>

          <button
            onClick={() => setStoryVisible(true)}
            style={{
              padding: '14px',
              background: 'transparent',
              color: 'var(--text-muted)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            🍽️  Berätta en kroghistoria
          </button>

          <button
            onClick={() => setFeedbackVisible(true)}
            style={{
              padding: '14px',
              background: 'transparent',
              color: 'var(--text-muted)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            💬  Lämna feedback
          </button>

          <button
            onClick={onPlayAgain}
            style={{
              padding: '14px',
              background: 'var(--bg-card)',
              color: 'var(--white)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            ← Tillbaka till startsidan
          </button>

        </div>
      </main>

      {loginVisible && (
        <LoginModal
          hint={loginThenCreate ? 'Logga in för att skicka in en fråga.' : 'Logga in för att spara din poäng på topplistan!'}
          onSuccess={async (u) => {
            setLoginVisible(false)
            onAuthChange(u)
            if (loginThenCreate) {
              setLoginThenCreate(false)
              setCreateVisible(true)
            } else {
              const { data } = await (await import('../lib/supabase')).supabase
                .from('profiles')
                .select('username')
                .eq('id', u.id)
                .single()
              const uname = data?.username as string | null
              if (uname) await handlePostLoginSubmit(u, uname)
            }
          }}
          onClose={() => { setLoginVisible(false); setLoginThenCreate(false) }}
        />
      )}

      {feedbackVisible && (
        <FeedbackModal
          user={user}
          username={username}
          onClose={() => setFeedbackVisible(false)}
        />
      )}

      {storyVisible && (
        <StoryModal
          user={user}
          username={username}
          onClose={() => setStoryVisible(false)}
        />
      )}

      {createVisible && (
        <CreateQuestionModal
          user={user}
          onClose={() => setCreateVisible(false)}
          onNeedLogin={() => {
            setCreateVisible(false)
            setLoginThenCreate(true)
            setLoginVisible(true)
          }}
        />
      )}
    </div>
  )
}
