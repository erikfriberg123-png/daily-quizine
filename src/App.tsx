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

export default function App() {
  const segment = getSegmentConfig()
  const [view, setView] = useState<View>('home')
  const [user, setUser] = useState<User | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [result, setResult] = useState<QuizResult | null>(null)
  const [serverPlayed, setServerPlayed] = useState<ServerPlayed | null>(null)
  const [serverPlayedChecked, setServerPlayedChecked] = useState(false)
  const [justCompleted, setJustCompleted] = useState(false)

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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUsername(session.user.id)
        fetchServerPlayed(session.user.id)
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
