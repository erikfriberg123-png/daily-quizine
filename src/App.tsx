import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import { getMyTodayScore } from './lib/dailyScores'
import { getParisDate } from './lib/dailyUtils'
import { getSegmentConfig } from './config/segments'
import HomePage from './pages/HomePage'
import QuizPage from './pages/QuizPage'
import ResultsPage from './pages/ResultsPage'

type View = 'home' | 'quiz' | 'results'

interface QuizResult {
  score: number
  correct: number
  total: number
  dateStr: string
}

export interface ServerPlayed {
  score: number
  correct: number
}

function ComingSoonPage() {
  const { name, icon, subtitle } = getSegmentConfig()
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32, textAlign: 'center', background: 'var(--bg)', color: 'var(--cream)' }}>
      <div style={{ fontSize: 56 }}>{icon}</div>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>{name}</h1>
      <p style={{ fontSize: 16, opacity: 0.6, margin: 0 }}>{subtitle}</p>
      <div style={{ marginTop: 8, padding: '10px 22px', borderRadius: 99, border: '1px solid var(--border-light)', fontSize: 14, opacity: 0.5 }}>
        Kommer snart
      </div>
    </div>
  )
}

function AuthErrorBanner({ error, onDismiss }: { error: string; onDismiss: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      background: 'rgba(3,12,26,0.88)', backdropFilter: 'blur(6px)',
    }} onClick={onDismiss}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 24,
        padding: 28, width: '100%', maxWidth: 400, textAlign: 'center',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>Länken har gått ut</div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
          {error === 'otp_expired'
            ? 'Din bekräftelseslänk har gått ut eller använts redan. Försök registrera dig igen med samma e-post och lösenord.'
            : 'Inloggningslänken är ogiltig. Försök igen.'}
        </div>
        <button
          onClick={onDismiss}
          style={{ width: '100%', padding: '13px', background: 'var(--blue)', color: '#fff', borderRadius: 14, fontSize: 16, fontWeight: 700 }}
        >
          OK
        </button>
      </div>
    </div>
  )
}

export default function App() {
  const segment = getSegmentConfig()
  const [view, setView] = useState<View>('home')
  const [user, setUser] = useState<User | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [result, setResult] = useState<QuizResult | null>(null)
  const [serverPlayed, setServerPlayed] = useState<ServerPlayed | null>(null)
  const [serverPlayedChecked, setServerPlayedChecked] = useState(false)
  const [justCompleted, setJustCompleted] = useState(false)
  const [authHashError, setAuthHashError] = useState<string | null>(null)

  useEffect(() => {
    const hash = window.location.hash
    if (hash.includes('error_code=')) {
      const params = new URLSearchParams(hash.replace(/^#/, ''))
      const code = params.get('error_code')
      if (code) {
        setAuthHashError(code)
        window.history.replaceState(null, '', window.location.pathname + window.location.search)
      }
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUsername(session.user.id)
        fetchServerPlayed(session.user.id)
      } else {
        setServerPlayedChecked(true)
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUsername(session.user.id)
        fetchServerPlayed(session.user.id)
        if (event === 'SIGNED_IN') {
          const redirect = localStorage.getItem('postAuthRedirect')
          if (redirect === 'quiz') {
            localStorage.removeItem('postAuthRedirect')
            setView('quiz')
          }
        }
      } else {
        setUsername(null)
        setServerPlayed(null)
        setServerPlayedChecked(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const fetchUsername = async (uid: string) => {
    const { data } = await supabase.from('profiles').select('username').eq('id', uid).single()
    setUsername((data?.username as string | null) ?? null)
  }

  const fetchServerPlayed = async (uid: string) => {
    setServerPlayedChecked(false)
    try {
      const data = await getMyTodayScore(uid, getParisDate())
      setServerPlayed(data)
    } catch {
      setServerPlayed(null)
    } finally {
      setServerPlayedChecked(true)
    }
  }

  const handleAuthChange = (u: User | null) => {
    setUser(u)
    if (u) {
      fetchUsername(u.id)
      fetchServerPlayed(u.id)
    } else {
      setUsername(null)
      setServerPlayed(null)
      setServerPlayedChecked(true)
    }
  }

  if (segment.disabled) return <ComingSoonPage />

  return (
    <>
      {authHashError && <AuthErrorBanner error={authHashError} onDismiss={() => setAuthHashError(null)} />}
      {view === 'home' && (
        <HomePage
          user={user}
          username={username}
          serverPlayed={serverPlayed}
          serverPlayedChecked={serverPlayedChecked}
          justCompleted={justCompleted}
          onStartQuiz={() => setView('quiz')}
          onAuthChange={handleAuthChange}
        />
      )}
      {view === 'quiz' && (
        <QuizPage
          user={user}
          username={username}
          onComplete={(r) => { setResult(r); setView('results') }}
          onExit={() => setView('home')}
        />
      )}
{view === 'results' && result && (
        <ResultsPage
          result={result}
          user={user}
          username={username}
          onPlayAgain={() => { setJustCompleted(true); setView('home') }}
          onAuthChange={handleAuthChange}
        />
      )}
    </>
  )
}
