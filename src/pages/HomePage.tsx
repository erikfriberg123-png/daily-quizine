import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import logo from '../assets/logo.png'
import { isWeekend, getNextMondayLabel, getTodayPlayedData, getParisDate } from '../lib/dailyUtils'
import { LoginModal } from '../components/LoginModal'
import { Leaderboard } from '../components/Leaderboard'
import { CreateQuestionModal } from '../components/CreateQuestionModal'
import { supabase } from '../lib/supabase'
import { ServerPlayed } from '../App'

const QUESTION_COUNT = 3

interface Props {
  user: User | null
  username: string | null
  serverPlayed: ServerPlayed | null
  serverPlayedChecked: boolean
  onStartQuiz: () => void
  onAuthChange: (user: User | null) => void
}

const TODAY_WEEKDAY = ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'][
  new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Paris' })).getDay()
]

export default function HomePage({ user, username, serverPlayed, serverPlayedChecked, onStartQuiz, onAuthChange }: Props) {
  const [loginVisible, setLoginVisible] = useState(false)
  const [createVisible, setCreateVisible] = useState(false)
  const [loginThenCreate, setLoginThenCreate] = useState(false)
  const weekend = isWeekend()
  const dateStr = getParisDate()

  // For logged-in users: server record is authoritative (cross-device gate).
  // While it's loading, show a spinner to avoid a flash of the start button.
  // For anonymous users: fall back to localStorage.
  const localPlayed = getTodayPlayedData()
  const played = user
    ? serverPlayed
      ? { ...serverPlayed, total: QUESTION_COUNT }
      : localPlayed
    : localPlayed
  const checkingServer = user !== null && !serverPlayedChecked

  const handleLogout = async () => {
    await supabase.auth.signOut()
    onAuthChange(null)
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-card)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img
            src={logo}
            alt="Quizine logo"
            style={{ width: 40, height: 40, objectFit: 'contain' }}
          />
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--white)', lineHeight: 1 }}>
              Quizine Daily
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              Quiz om krogen
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {username ?? user.email?.split('@')[0]}
              </span>
              <button
                onClick={handleLogout}
                style={{
                  fontSize: 12,
                  color: 'var(--text-dim)',
                  background: 'none',
                  padding: '4px 10px',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  cursor: 'pointer',
                }}
              >
                Logga ut
              </button>
            </div>
          ) : (
            <button
              onClick={() => setLoginVisible(true)}
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--blue-light)',
                background: 'rgba(96,216,144,0.1)',
                padding: '7px 14px',
                border: '1px solid rgba(96,216,144,0.3)',
                borderRadius: 10,
                cursor: 'pointer',
              }}
            >
              Logga in
            </button>
          )}
        </div>
      </header>

      {/* Main content */}
      <main
        style={{
          flex: 1,
          maxWidth: 560,
          width: '100%',
          margin: '0 auto',
          padding: '28px 16px 48px',
        }}
      >
        {weekend ? (
          <WeekendView nextMonday={getNextMondayLabel()} username={username} />
        ) : checkingServer ? (
          <CheckingView />
        ) : played ? (
          <AlreadyPlayedView played={played} dateStr={dateStr} />
        ) : (
          <StartView
            user={user}
            username={username}
            dateStr={dateStr}
            onStart={onStartQuiz}
            onLogin={() => setLoginVisible(true)}
          />
        )}

        {/* Create question button — always visible */}
        <div style={{ marginTop: 20 }}>
          <button
            onClick={() => setCreateVisible(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              width: '100%',
              padding: '13px',
              background: 'transparent',
              color: 'var(--text-muted)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--orange)'
              e.currentTarget.style.color = 'var(--orange)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.color = 'var(--text-muted)'
            }}
          >
            ✏️  Skicka in en egen fråga
          </button>
        </div>

        {/* Leaderboard always visible below */}
        <div style={{ marginTop: 32 }}>
          <Leaderboard highlightUsername={username} />
        </div>

        {/* Link to main app */}
        <div style={{ marginTop: 28, textAlign: 'center' }}>
          <a
            href="https://quizine.se"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              color: 'var(--text-muted)',
              padding: '8px 16px',
              border: '1px solid var(--border)',
              borderRadius: 20,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--white)'
              e.currentTarget.style.borderColor = 'var(--border-light)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)'
              e.currentTarget.style.borderColor = 'var(--border)'
            }}
          >
            ⚔️ Vill du spela mer? Besök Quizine.se
          </a>
        </div>
      </main>

      {loginVisible && (
        <LoginModal
          hint={loginThenCreate ? 'Logga in för att skicka in en fråga.' : 'Logga in för att synas på topplistan!'}
          onSuccess={(u) => {
            onAuthChange(u)
            setLoginVisible(false)
            if (loginThenCreate) { setLoginThenCreate(false); setCreateVisible(true) }
          }}
          onClose={() => { setLoginVisible(false); setLoginThenCreate(false) }}
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

function WeekendView({ nextMonday, username }: { nextMonday: string; username: string | null }) {
  return (
    <div className="fade-in">
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 24,
          padding: 32,
          textAlign: 'center',
          marginBottom: 28,
        }}
      >
        <div style={{ fontSize: 56, marginBottom: 16 }}>😴</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--white)', marginBottom: 8 }}>
          Vila på helgen!
        </div>
        <div style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 20 }}>
          Quizine Daily tar helg. Kom tillbaka på{' '}
          <strong style={{ color: 'var(--orange)' }}>{nextMonday}</strong> för ett nytt quiz.
        </div>
        {username && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              color: 'var(--blue-light)',
              background: 'rgba(96,216,144,0.1)',
              padding: '6px 14px',
              borderRadius: 20,
            }}
          >
            👋 Vi ses på måndag, {username}!
          </div>
        )}
      </div>
    </div>
  )
}

function CheckingView() {
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 24,
        padding: 48,
        textAlign: 'center',
        marginBottom: 28,
      }}
    >
      <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
      <div style={{ fontSize: 15, color: 'var(--text-muted)' }}>Kontrollerar spelstatus…</div>
    </div>
  )
}

function AlreadyPlayedView({
  played,
  dateStr,
}: {
  played: { score: number; correct: number; total: number }
  dateStr: string
}) {
  const pct = Math.round((played.correct / played.total) * 100)
  return (
    <div className="fade-in">
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 24,
          padding: 28,
          marginBottom: 28,
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>
          {dateStr} — Din poäng idag
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 48, fontWeight: 900, color: 'var(--orange)', lineHeight: 1 }}>
            {played.score.toLocaleString('sv-SE')}
          </span>
          <span style={{ fontSize: 16, color: 'var(--text-muted)', paddingBottom: 6 }}>XP</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div
            style={{
              flex: 1,
              background: 'var(--success-bg)',
              border: '1px solid var(--success)',
              borderRadius: 12,
              padding: '10px 14px',
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--success)' }}>
              {played.correct}/{played.total}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Rätt svar</div>
          </div>
          <div
            style={{
              flex: 1,
              background: 'rgba(96,216,144,0.08)',
              border: '1px solid rgba(96,216,144,0.25)',
              borderRadius: 12,
              padding: '10px 14px',
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--blue-light)' }}>{pct}%</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Träffsäkerhet</div>
          </div>
        </div>
        <div style={{ marginTop: 16, fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
          Kom tillbaka imorgon för ett nytt quiz!
        </div>
      </div>
    </div>
  )
}

function StartView({
  user,
  username,
  dateStr,
  onStart,
  onLogin,
}: {
  user: User | null
  username: string | null
  dateStr: string
  onStart: () => void
  onLogin: () => void
}) {
  const weekday = TODAY_WEEKDAY

  return (
    <div className="fade-in">
      {/* Hero */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0A2A18 0%, #0E2219 60%, var(--bg-card) 100%)',
          border: '1px solid var(--border)',
          borderRadius: 24,
          padding: 28,
          marginBottom: 20,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative orb */}
        <div
          style={{
            position: 'absolute',
            top: -40,
            right: -40,
            width: 160,
            height: 160,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(96,216,144,0.2) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--blue-light)',
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          {weekday} · {dateStr}
        </div>
        <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--white)', lineHeight: 1.2, marginBottom: 8 }}>
          Dagens quiz är redo!
        </div>
        <div style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
          3 frågor · 15 sekunder per fråga · Max 500 XP
        </div>

        <button
          onClick={onStart}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            width: '100%',
            padding: '16px',
            background: 'linear-gradient(135deg, var(--orange) 0%, var(--orange-dark) 100%)',
            color: '#fff',
            borderRadius: 16,
            fontSize: 17,
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 24px var(--orange-glow)',
            border: 'none',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)'
            e.currentTarget.style.boxShadow = '0 6px 32px var(--orange-glow)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none'
            e.currentTarget.style.boxShadow = '0 4px 24px var(--orange-glow)'
          }}
        >
          <span style={{ fontSize: 20 }}>🎯</span>
          Starta dagens quiz
        </button>

        {!user && (
          <div style={{ marginTop: 14, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
            Spela utan konto — eller{' '}
            <button
              onClick={onLogin}
              style={{
                background: 'none',
                color: 'var(--blue-light)',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              logga in
            </button>{' '}
            för att synas på topplistan
          </div>
        )}
        {user && username && (
          <div style={{ marginTop: 14, textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
            Du spelar som{' '}
            <strong style={{ color: 'var(--blue-light)' }}>{username}</strong>
          </div>
        )}
      </div>

      {/* Rules strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 10,
          marginBottom: 8,
        }}
      >
        {[
          { icon: '⏱️', label: '15s', sub: 'per fråga' },
          { icon: '🎯', label: '3', sub: 'frågor' },
          { icon: '🏆', label: 'Vecka', sub: 'topplista' },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: '14px 10px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 22, marginBottom: 4 }}>{item.icon}</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--white)' }}>{item.label}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{item.sub}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
