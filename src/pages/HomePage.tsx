import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { isWeekend, getNextMondayLabel, getTodayPlayedData, getParisDate, pickDailyQuestions, getCachedDailySelection, cacheDailySelection } from '../lib/dailyUtils'
import { fetchDailyQuestions } from '../lib/questions'
import { LoginModal } from '../components/LoginModal'
import { Leaderboard } from '../components/Leaderboard'
import { CreateQuestionModal } from '../components/CreateQuestionModal'
import { StoryModal } from '../components/StoryModal'
import { supabase } from '../lib/supabase'
import { ServerPlayed } from '../App'
import { CATEGORY_DISPLAY, ROMAN } from '../lib/categories'
import { getSegmentConfig, SegmentConfig } from '../config/segments'
import { SegmentLogo } from '../components/SegmentLogo'

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
  const [storyVisible, setStoryVisible] = useState(false)
  const [loginThenCreate, setLoginThenCreate] = useState(false)
  const seg = getSegmentConfig()
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
          <SegmentLogo />
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--white)', lineHeight: 1 }}>
              Quizine Daily
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              {seg.subtitle}
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
                color: 'var(--gold-light)',
                background: 'rgba(201,146,42,0.1)',
                padding: '7px 14px',
                border: '1px solid rgba(201,146,42,0.3)',
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
            seg={seg}
          />
        )}

        {/* Create question button — always visible */}
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
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
          {seg.showStoryButton && (
            <button
              onClick={() => setStoryVisible(true)}
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
              🍽️  Berätta en kroghistoria
            </button>
          )}
        </div>

        {/* Leaderboard always visible below */}
        <div style={{ marginTop: 32 }}>
          <Leaderboard highlightUsername={username} />
        </div>

        {/* Link to main app / back to segment selector */}
        <div style={{ marginTop: 28, textAlign: 'center' }}>
          {seg.showBackLink ? (
            <a
              href="/"
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
              ← Byt bransch
            </a>
          ) : (
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
          )}
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

      {storyVisible && (
        <StoryModal
          user={user}
          username={username}
          onClose={() => setStoryVisible(false)}
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
              background: 'rgba(29,111,232,0.1)',
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
              background: 'rgba(29,111,232,0.08)',
              border: '1px solid rgba(29,111,232,0.25)',
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
  seg,
}: {
  user: User | null
  username: string | null
  dateStr: string
  onStart: () => void
  onLogin: () => void
  seg: SegmentConfig
}) {
  const weekday = TODAY_WEEKDAY
  const [menuItems, setMenuItems] = useState<Array<{ name: string; emoji: string; desc: string }>>([])

  useEffect(() => {
    fetchDailyQuestions()
      .then(all => {
        let daily
        const cachedIds = getCachedDailySelection(dateStr)
        if (cachedIds) {
          const idMap = new Map(all.map(q => [q.id, q]))
          const restored = cachedIds.map(id => idMap.get(id)).filter(q => !!q)
          daily = restored.length === 3 ? restored : pickDailyQuestions(all, dateStr, 3)
          if (restored.length !== 3) cacheDailySelection(dateStr, daily.map(q => q.id))
        } else {
          daily = pickDailyQuestions(all, dateStr, 3)
          cacheDailySelection(dateStr, daily.map(q => q.id))
        }
        setMenuItems(daily.map(q => CATEGORY_DISPLAY[q.categoryId] ?? { name: q.categoryId, emoji: '❓', desc: '' }))
      })
      .catch(() => {})
  }, [dateStr])

  return (
    <div className="fade-in">
      {/* EKG decoration (VOO only) */}
      {seg.showEkg && (
        <svg
          style={{ width: '100%', height: 32, marginBottom: 24, opacity: 0.18 }}
          viewBox="0 0 560 32"
          preserveAspectRatio="none"
          fill="none"
        >
          <polyline
            points="0,16 60,16 80,16 90,4 100,28 110,2 120,30 130,16 200,16 220,16 230,8 240,24 250,16 320,16 340,16 350,4 360,28 370,2 380,30 390,16 460,16 480,16 490,8 500,24 510,16 560,16"
            stroke="var(--gold)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      )}

      {/* Date ornament */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <span style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600 }}>
          ✦&nbsp; {weekday} {dateStr} &nbsp;✦
        </span>
      </div>

      {/* Hero title */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: 'var(--cream)', lineHeight: 1.2, marginBottom: 10, margin: 0 }}>
          {seg.heroLine1}<br />{seg.heroLine2Start}
          <em style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>{seg.heroEm}</em>
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, marginTop: 10, marginBottom: 0 }}>
          {seg.heroCopyLine1}<br />{seg.heroCopyLine2}
        </p>
      </div>

      {/* Menu card */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 20,
        marginBottom: 16,
        overflow: 'hidden',
        boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
      }}>
        {/* Card header */}
        <div style={{
          padding: '18px 20px 14px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--white)', fontSize: 15 }}>{seg.cardTitle}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', marginTop: 3 }}>
              3 rätter · Max 500 XP
            </div>
          </div>
          <div style={{ fontSize: 22 }}>{seg.cardIcon}</div>
        </div>

        {/* Menu items */}
        {menuItems.length > 0
          ? menuItems.map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 20px',
              borderBottom: i < 2 ? '1px solid rgba(46,34,24,0.6)' : 'none',
            }}>
              <div style={{
                fontSize: 18, fontWeight: 700, color: 'var(--border-light)',
                minWidth: 26, fontFamily: 'Georgia, serif',
              }}>
                {ROMAN[i]}
              </div>
              <div style={{ fontSize: 22 }}>{item.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--white)' }}>{item.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{item.desc}</div>
              </div>
              <div style={{
                fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                background: 'rgba(201,146,42,0.12)', color: 'var(--gold-light)',
                border: '1px solid rgba(201,146,42,0.3)', letterSpacing: 0.5,
              }}>
                Idag
              </div>
            </div>
          ))
          : [0, 1, 2].map(i => (
            <div key={i} style={{ padding: '18px 20px', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ height: 14, background: 'var(--bg-card-2)', borderRadius: 7, width: `${55 + i * 12}%`, opacity: 0.7 }} />
            </div>
          ))
        }

        {/* Sparkler preview row */}
        <div style={{
          padding: '14px 20px', background: 'var(--bg-card-2)',
          display: 'flex', alignItems: 'center', gap: 12,
          borderTop: '1px solid var(--border)',
        }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 90 }}>⏱ Tid per fråga</div>
          <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3 }}>
            <div style={{
              height: '100%', width: '66%', borderRadius: 3,
              background: 'var(--timer-bar)',
            }} />
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--gold-light)', minWidth: 32 }}>20s</div>
        </div>
      </div>

      {/* Start button */}
      <button
        onClick={onStart}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          width: '100%', padding: '17px',
          background: 'linear-gradient(135deg, var(--gold) 0%, var(--rust) 100%)',
          color: 'var(--cream)', borderRadius: 16,
          fontSize: 17, fontWeight: 800, cursor: 'pointer',
          boxShadow: '0 4px 24px var(--gold-glow)',
          border: 'none', transition: 'transform 0.15s, box-shadow 0.15s',
          letterSpacing: 0.5, marginBottom: 12,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(201,146,42,0.4)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'none'
          e.currentTarget.style.boxShadow = '0 4px 24px var(--gold-glow)'
        }}
      >
        <span style={{ fontSize: 20 }}>{seg.startBtnIcon}</span>
        Starta dagens quiz
      </button>

      {!user && (
        <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
          Spela utan konto — eller{' '}
          <button
            onClick={onLogin}
            style={{ background: 'none', color: 'var(--gold-light)', fontWeight: 600, fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}
          >
            logga in
          </button>
          {' '}för att synas på topplistan
        </div>
      )}
      {user && username && (
        <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
          Du spelar som{' '}
          <strong style={{ color: 'var(--gold-light)' }}>{username}</strong>
        </div>
      )}
    </div>
  )
}
